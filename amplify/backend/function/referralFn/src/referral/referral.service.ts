import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';

import { Referral, ReferralDocument } from './schemas/referral.schema';
import { WalletClient } from '../clients/wallet.client';
import { UsersClient } from '../clients/users.client';

@Injectable()
export class ReferralService {
  private readonly REFERRAL_BONUS = 50; // 50 coins bonus for both referrer and referee

  constructor(
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    private walletClient: WalletClient,
    private usersClient: UsersClient,
  ) {}

  async getReferralCode(userId: string, auth?: string) {
    const user = await this.usersClient.getUserById(userId, auth);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      referralCode: user.referralCode,
      totalReferrals: await this.referralModel.countDocuments({ referrer: userId }),
    };
  }

  async applyReferralOnSignup(userId: string, referralCode: string, auth?: string) {
    // Simplified referral application for new signups
    // Find referrer by code
    const referrer = await this.usersClient.getUserByReferralCode(referralCode, auth);
    if (!referrer) {
      throw new BadRequestException('Invalid referral code');
    }

    // Prevent self-referral (though this shouldn't happen during signup)
    if (referrer._id.toString() === userId) {
      throw new BadRequestException('Cannot use your own referral code');
    }

    // Check if this referral code was already used by this user
    const existingReferral = await this.referralModel.findOne({
      referee: userId,
    });

    if (existingReferral) {
      throw new ConflictException('User has already used a referral code');
    }

    try {
      // Try to use transactions if available (replica set/sharded environment)
      let session: ClientSession | undefined = undefined;
      try {
        session = await this.referralModel.db.startSession();
        
        await session.withTransaction(async () => {
          // Create referral record
          await this.referralModel.create([{
            code: referralCode,
            referrer: referrer._id,
            referee: userId,
            bonusAmount: this.REFERRAL_BONUS,
          }], { session });

          // Update user's referredBy field via HTTP
          await this.usersClient.updateUserReferralStats(userId, 0, auth);
          // Note: You'll need to add an endpoint to update referredBy field

          // Add coin bonus to both users' wallets via HTTP calls
          await this.walletClient.addCoins(
            (referrer._id as string).toString(),
            this.REFERRAL_BONUS,
            'referral',
            { refereeId: userId },
            auth
          );

          await this.walletClient.addCoins(
            userId,
            this.REFERRAL_BONUS,
            'referral',
            { referrerId: (referrer._id as string).toString() },
            auth
          );
        });

        if (session) {
          await session.endSession();
        }
      } catch (transactionError: any) {
        if (session) {
          await session.endSession();
        }
        
        // Fallback to non-transactional approach for standalone MongoDB
        if (transactionError.message?.includes('Transaction numbers are only allowed') || 
            transactionError.message?.includes('replica set')) {
          
          // Execute operations sequentially without transactions
          await this.referralModel.create({
            code: referralCode,
            referrer: referrer._id,
            referee: userId,
            bonusAmount: this.REFERRAL_BONUS,
          });

          // Update user's referredBy field via HTTP
          await this.usersClient.updateUserReferralStats(userId, 0, auth);

          await this.walletClient.addCoins(
            (referrer._id as string).toString(),
            this.REFERRAL_BONUS,
            'referral',
            { refereeId: userId },
            auth
          );

          await this.walletClient.addCoins(
            userId,
            this.REFERRAL_BONUS,
            'referral',
            { referrerId: (referrer._id as string).toString() },
            auth
          );
        } else {
          throw transactionError;
        }
      }

      return {
        message: 'Referral applied successfully',
        coinsEarned: this.REFERRAL_BONUS,
      };
    } catch (error) {
      throw error;
    }
  }

  async applyReferral(userId: string, referralCode: string, auth?: string) {
    // Validate user exists and hasn't used a referral before
    const user = await this.usersClient.getUserById(userId, auth);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.referredBy) {
      throw new ConflictException('User has already used a referral code');
    }

    // Find referrer by code
    const referrer = await this.usersClient.getUserByReferralCode(referralCode, auth);
    if (!referrer) {
      throw new BadRequestException('Invalid referral code');
    }

    // Prevent self-referral
    if ((referrer._id as string).toString() === userId) {
      throw new BadRequestException('Cannot use your own referral code');
    }

    // Check if this referral code was already used by this user
    const existingReferral = await this.referralModel.findOne({
      referee: userId,
      code: referralCode,
    });

    if (existingReferral) {
      throw new ConflictException('Referral code already used');
    }

    // Start session for atomic transaction
    const session = await this.referralModel.db.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Create referral record
        await this.referralModel.create([{
          code: referralCode,
          referrer: referrer._id,
          referee: userId,
          bonusAmount: this.REFERRAL_BONUS,
        }], { session });

        // Update user's referredBy field via HTTP
        await this.usersClient.updateUserReferralStats(userId, 0, auth);

        // Add coin bonus to both users' wallets via HTTP calls
        await this.walletClient.addCoins(
          (referrer._id as string).toString(),
          this.REFERRAL_BONUS,
          'referral',
          { refereeId: userId },
          auth
        );

        await this.walletClient.addCoins(
          userId,
          this.REFERRAL_BONUS,
          'referral',
          { referrerId: (referrer._id as string).toString() },
          auth
        );
      });

      return {
        message: 'Referral applied successfully',
        coinsEarned: this.REFERRAL_BONUS,
      };
    } finally {
      await session.endSession();
    }
  }
}


