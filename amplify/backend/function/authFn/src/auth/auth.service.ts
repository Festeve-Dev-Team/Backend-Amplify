import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

import { OTP, OTPDocument } from './schemas/otp.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UsersClient } from '../clients/users.client';
import { ReferralClient } from '../clients/referral.client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly blacklistedTokens = new Set<string>();

  constructor(
    @InjectModel(OTP.name) private otpModel: Model<OTPDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersClient: UsersClient,
    private referralClient: ReferralClient,
  ) {}

  async signup(signupDto: SignupDto, auth?: string) {
    const { email, phone, password, provider, providerUserId, referralCode } = signupDto;

    // Check for existing user
    const conditions: any[] = [{ email }];
    
    if (phone) {
      conditions.push({ phone });
    }
    
    // Only check providerUserId if it's meaningful (not placeholder values)
    if (providerUserId && providerUserId !== 'string' && providerUserId.trim()) {
      conditions.push({ providerUserId });
    }

    const existingUser = await this.usersClient.findUser({
      $or: conditions,
    });

    if (existingUser) {
      let conflictField = '';
      if (existingUser.email === email) {
        conflictField = 'email';
      } else if (existingUser.phone === phone) {
        conflictField = 'phone';
      } else if (existingUser.providerUserId === providerUserId) {
        conflictField = 'provider user ID';
      }
      
      throw new ConflictException(`User already exists with this ${conflictField}`);
    }

    // Validate referral code if provided
    if (referralCode) {
      const referrer = await this.usersClient.findUser({ referralCode });
      if (!referrer) {
        throw new BadRequestException('Invalid referral code');
      }
    }

    // Validate password strength for native signup
    if (provider === 'native' && password) {
      this.validatePasswordStrength(password);
    }

    // For native signup, generate and send OTP
    if (provider === 'native') {
      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Clean up any existing OTPs for this email
      await this.otpModel.deleteMany({ 
        $or: [{ userId: email }, { userId: phone }] 
      });

      // Create new OTP record
      await this.otpModel.create({
        userId: email || phone,
        code: otpCode,
        purpose: 'signup',
        expiresAt,
      });

      // Send OTP via email/SMS (implement your preferred service)
      const recipient = email || phone;
      if (!recipient) {
        throw new BadRequestException('Email or phone is required');
      }
      await this.sendOTP(recipient, otpCode);

      return {
        message: 'OTP sent successfully',
        otpSentTo: email || phone,
      };
    }

    // For third-party providers, verify token and create user directly
    if (!providerUserId) {
      throw new BadRequestException('Provider user ID is required for third-party signup');
    }
    const providerUser = await this.verifyProviderToken(provider, providerUserId);
    const user = await this.createUser({
      ...signupDto,
      name: providerUser.name || signupDto.name,
      email: providerUser.email || email,
    });

    // Apply referral code if provided
    let referralMessage = '';
    if (referralCode) {
      try {
        const referralResult = await this.referralClient.applyReferralOnSignup(
          (user._id as string).toString(),
          referralCode,
          auth
        );
        referralMessage = ` ${referralResult.message}. You earned ${referralResult.coinsEarned} coins!`;
      } catch (error) {
        this.logger.warn(`Failed to apply referral code during signup: ${error instanceof Error ? error.message : String(error)}`);
        // Don't fail the entire signup process if referral fails
      }
    }

    const token = this.generateJwtToken(user);
    return {
      message: `Signup successful.${referralMessage}`,
      user: this.sanitizeUser(user),
      token,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto, auth?: string) {
    const { identifier, code, signupData } = verifyOtpDto;

    const otpRecord = await this.otpModel.findOne({
      userId: identifier,
      code,
      purpose: 'signup',
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check max attempts
    if (otpRecord.attempts >= 3) {
      await this.otpModel.deleteOne({ _id: otpRecord._id });
      throw new BadRequestException('OTP verification failed. Please request a new OTP.');
    }

    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();

    // Create user after successful OTP verification
    const hashedPassword = signupData.password ? 
      await bcrypt.hash(signupData.password, 12) : undefined;

    const user = await this.createUser({
      ...signupData,
      passwordHash: hashedPassword,
      provider: 'native',
    });

    // Apply referral code if provided
    let referralMessage = '';
    if (signupData.referralCode) {
      try {
        const referralResult = await this.referralClient.applyReferralOnSignup(
          (user._id as string).toString(),
          signupData.referralCode,
          auth
        );
        referralMessage = ` ${referralResult.message}. You earned ${referralResult.coinsEarned} coins!`;
      } catch (error) {
        this.logger.warn(`Failed to apply referral code during signup: ${error instanceof Error ? error.message : String(error)}`);
        // Don't fail the entire signup process if referral fails
      }
    }

    // Clean up OTP
    await this.otpModel.deleteOne({ _id: otpRecord._id });

    const token = this.generateJwtToken(user);
    return {
      message: `Registration completed successfully.${referralMessage}`,
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { provider, email, password, providerToken, providerUserId } = loginDto;

    if (provider === 'native') {
      if (!email || !password) {
        throw new BadRequestException('Email and password are required for native login');
      }
      return this.nativeLogin(email, password);
    } else {
      if (!providerToken || !providerUserId) {
        throw new BadRequestException('Provider token and user ID are required');
      }
      return this.providerLogin(provider, providerToken, providerUserId);
    }
  }

  private async nativeLogin(email: string, password: string) {
    const user = await this.usersClient.findUser({ 
      email, 
      provider: 'native',
      includePassword: true
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked (implement lockout logic)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment failed attempts (implement in user schema)
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    const token = this.generateJwtToken(user);
    return {
      message: 'Login successful',
      user: this.sanitizeUser(user),
      token,
    };
  }

  private async providerLogin(
    provider: string, 
    providerToken: string, 
    providerUserId: string
  ) {
    // Verify provider token
    const providerUser = await this.verifyProviderToken(provider, providerUserId);
    
    let user: any = await this.usersClient.findUser({ 
      provider, 
      providerUserId 
    });

    if (!user) {
      // Create user if doesn't exist
      user = await this.createUser({
        name: providerUser.name,
        email: providerUser.email,
        provider,
        providerUserId,
        meta: providerUser,
      });
    }

    if (!user) {
      throw new BadRequestException('Authentication failed');
    }

    const token = this.generateJwtToken(user);
    return {
      message: 'Login successful',
      user: this.sanitizeUser(user),
      token,
    };
  }

  async logout(userId: string) {
    // In a production app, you'd want to blacklist the token
    // or use a more sophisticated token invalidation strategy
    return { message: 'Logout successful' };
  }

  async getMe(userId: string, auth?: string) {
    const user = await this.usersClient.findById(userId, auth);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private async createUser(userData: any): Promise<any> {
    const referralCode = this.generateReferralCode();
    
    // Generate a unique providerUserId for native signups if not provided or empty
    let providerUserId = userData.providerUserId;
    if (!providerUserId || providerUserId.trim() === '' || providerUserId === 'string') {
      if (userData.provider === 'native') {
        providerUserId = `native_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      } else {
        throw new BadRequestException('Provider user ID is required for non-native signups');
      }
    }
    
    const user = await this.usersClient.createUser({
      ...userData,
      providerUserId,
      referralCode,
      role: 'user',
    });

    return user;
  }

  private generateJwtToken(user: any): string {
    const payload = {
      sub: (user._id as string).toString(),
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    if (user.toObject && typeof user.toObject === 'function') {
      const { passwordHash, ...sanitized } = user.toObject();
      return sanitized;
    }
    // For plain objects (HTTP responses)
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private validatePasswordStrength(password: string) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)) {
      throw new BadRequestException(
        'Password must contain uppercase, lowercase, number and special character'
      );
    }
  }

  private async sendOTP(recipient: string, code: string) {
    // Implement your OTP sending logic here
    // This could be email via SMTP or SMS via a service like Twilio
    this.logger.log(`Sending OTP ${code} to ${recipient}`);
  }

  private async verifyProviderToken(provider: string, providerUserId: string) {
    // Implement provider token verification
    // This would validate tokens from Auth0, Firebase, Cognito, etc.
    return {
      name: 'Provider User',
      email: 'user@example.com',
    };
  }
}


