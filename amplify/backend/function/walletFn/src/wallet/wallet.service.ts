import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';

import { WalletTransaction, WalletTransactionDocument } from './schemas/wallet-transaction.schema';
import { TransactionHistoryResponse, WalletBalance } from './interfaces/wallet.interface';
import { UsersClient } from '../clients/users.client';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(WalletTransaction.name) 
    private walletTransactionModel: Model<WalletTransactionDocument>,
    private usersClient: UsersClient,
  ) {}

  async getBalance(userId: string, auth?: string): Promise<WalletBalance> {
    const user = await this.usersClient.getUserById(userId, auth);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      money: user.rewardWallet,
      coins: user.coinWallet,
      userId,
    };
  }

  async getTransactions(
    userId: string, 
    options: {
      page?: number;
      limit?: number;
      type?: 'credit' | 'debit';
      currency?: 'money' | 'coins';
    }
  ): Promise<TransactionHistoryResponse> {
    const { page = 1, limit = 20, type, currency } = options;
    const skip = (page - 1) * limit;

    const filter: any = { userId };
    if (type) {
      filter.type = type;
    }
    if (currency) {
      filter.currency = currency;
    }

    const [transactions, total] = await Promise.all([
      this.walletTransactionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.walletTransactionModel.countDocuments(filter),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Generic credit method for both money and coins
  async addCredit(
    userId: string,
    amount: number,
    currency: 'money' | 'coins',
    source: string,
    meta?: Record<string, any>,
    session?: ClientSession,
    auth?: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const walletField = currency === 'money' ? 'rewardWallet' : 'coinWallet';

    const operations = [
      // Create transaction record
      this.walletTransactionModel.create([{
        userId,
        type: 'credit',
        amount,
        currency,
        source,
        meta,
      }], { session }),

      // Update user balance
      // Note: User wallet update will be handled separately via HTTP
    ];

    if (session) {
      await Promise.all(operations);
    } else {
      // Try to create our own session for atomic operation, fallback if transactions not supported
      try {
        const localSession = await this.walletTransactionModel.db.startSession();
        try {
          await localSession.withTransaction(async () => {
            await Promise.all([
              this.walletTransactionModel.create([{
                userId,
                type: 'credit',
                amount,
                currency,
                source,
                meta,
              }], { session: localSession }),

              // Update user wallet via HTTP client
              this.usersClient.updateUserWallet(userId, { [walletField]: amount, operation: 'increment' }, auth),
            ]);
          });
        } finally {
          await localSession.endSession();
        }
      } catch (transactionError: any) {
        // Fallback to non-transactional approach for standalone MongoDB
        if (transactionError.message?.includes('Transaction numbers are only allowed') || 
            transactionError.message?.includes('replica set')) {
          
          // Execute operations sequentially without transactions
          await this.walletTransactionModel.create({
            userId,
            type: 'credit',
            amount,
            currency,
            source,
            meta,
          });

          await this.usersClient.updateUserWallet(userId, { [walletField]: amount, operation: 'increment' }, auth);
        } else {
          throw transactionError;
        }
      }
    }

    return { success: true, amount, currency };
  }

  // Generic debit method for both money and coins
  async debitAmount(
    userId: string,
    amount: number,
    currency: 'money' | 'coins',
    source: string,
    meta?: Record<string, any>,
    session?: ClientSession,
    auth?: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Check sufficient balance
    const user = await this.usersClient.getUserById(userId, auth);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentBalance = currency === 'money' ? user.rewardWallet : user.coinWallet;
    const walletField = currency === 'money' ? 'rewardWallet' : 'coinWallet';

    if (currentBalance < amount) {
      throw new BadRequestException(`Insufficient ${currency} balance`);
    }

    const operations = [
      // Create transaction record
      this.walletTransactionModel.create([{
        userId,
        type: 'debit',
        amount,
        currency,
        source,
        meta,
      }], { session }),

      // Update user balance (prevent underflow)
      this.usersClient.updateUserWallet(userId, { [walletField]: amount, operation: 'decrement' }, auth),
    ];

    if (session) {
      const [, updatedUser] = await Promise.all(operations);
      if (!updatedUser) {
        throw new BadRequestException(`Insufficient ${currency} balance`);
      }
    } else {
      // Try to create our own session for atomic operation, fallback if transactions not supported
      try {
        const localSession = await this.walletTransactionModel.db.startSession();
        try {
          await localSession.withTransaction(async () => {
            const [, updatedUser] = await Promise.all([
              this.walletTransactionModel.create([{
                userId,
                type: 'debit',
                amount,
                currency,
                source,
                meta,
              }], { session: localSession }),

              this.usersClient.updateUserWallet(userId, { [walletField]: amount, operation: 'decrement' }, auth),
            ]);

            if (!updatedUser) {
              throw new BadRequestException(`Insufficient ${currency} balance`);
            }
          });
        } finally {
          await localSession.endSession();
        }
      } catch (transactionError: any) {
        // Fallback to non-transactional approach for standalone MongoDB
        if (transactionError.message?.includes('Transaction numbers are only allowed') || 
            transactionError.message?.includes('replica set')) {
          
          // Execute operations sequentially without transactions
          await this.walletTransactionModel.create({
            userId,
            type: 'debit',
            amount,
            currency,
            source,
            meta,
          });

          const updatedUser = await this.usersClient.updateUserWallet(userId, { [walletField]: amount, operation: 'decrement' }, auth);

          if (!updatedUser) {
            throw new BadRequestException(`Insufficient ${currency} balance`);
          }
        } else {
          throw transactionError;
        }
      }
    }

    return { success: true, amount, currency };
  }

  // Convenience methods for money transactions
  async addMoney(
    userId: string,
    amount: number,
    source: string,
    meta?: Record<string, any>,
    session?: ClientSession,
    auth?: string,
  ) {
    return this.addCredit(userId, amount, 'money', source, meta, session, auth);
  }

  async debitMoney(
    userId: string,
    amount: number,
    source: string,
    meta?: Record<string, any>,
    session?: ClientSession,
    auth?: string,
  ) {
    return this.debitAmount(userId, amount, 'money', source, meta, session, auth);
  }

  // Convenience methods for coin transactions
  async addCoins(
    userId: string,
    amount: number,
    source: string,
    meta?: Record<string, any>,
    session?: ClientSession,
    auth?: string,
  ) {
    return this.addCredit(userId, amount, 'coins', source, meta, session, auth);
  }

  async debitCoins(
    userId: string,
    amount: number,
    source: string,
    meta?: Record<string, any>,
    session?: ClientSession,
    auth?: string,
  ) {
    return this.debitAmount(userId, amount, 'coins', source, meta, session, auth);
  }

  // Get balance for specific currency
  async getMoneyBalance(userId: string, auth?: string): Promise<number> {
    const user = await this.usersClient.getUserById(userId, auth);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.rewardWallet;
  }

  async getCoinBalance(userId: string, auth?: string): Promise<number> {
    const user = await this.usersClient.getUserById(userId, auth);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.coinWallet;
  }
}


