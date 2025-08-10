import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

export interface FindAllUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  provider?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(query: FindAllUsersQuery = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      provider
    } = query;

    // Build filter object
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (provider) {
      filter.provider = provider;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-passwordHash') // Exclude password hash
        .populate('referredBy', 'name email referralCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter)
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Handle default address logic
    if (updateUserDto.addresses) {
      const defaultAddresses = updateUserDto.addresses.filter(addr => addr.isDefault);
      if (defaultAddresses.length > 1) {
        throw new BadRequestException('Only one address can be set as default');
      }

      // Validate pincode format
      for (const address of updateUserDto.addresses) {
        if (address.pincode && !/^\d{6}$/.test(address.pincode)) {
          throw new BadRequestException('Invalid pincode format. Must be 6 digits.');
        }
      }
    }

    try {
      const user = await this.userModel.findByIdAndUpdate(
        id,
        { 
          ...updateUserDto, 
          updatedAt: new Date() 
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if ((error as any).code === 11000) {
        throw new ConflictException('Email or phone already exists');
      }
      throw error;
    }
  }

  async addToWishlist(userId: string, productId: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    
    if (!user.wishlist.includes(productId as any)) {
      user.wishlist.push(productId as any);
      await user.save();
    }

    return user;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    
    user.wishlist = user.wishlist.filter(
      id => id.toString() !== productId
    );
    await user.save();

    return user;
  }

  // Methods for HTTP API - used by other services
  async findUserByQuery(query: any): Promise<UserDocument | null> {
    return this.userModel.findOne(query).exec();
  }

  async findUserByReferralCode(referralCode: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ referralCode }).exec();
  }

  async createUser(userData: any): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async updateUserReferralStats(userId: string, referralCount: number): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { referralCount: referralCount } },
      { new: true }
    ).exec();
  }
}


