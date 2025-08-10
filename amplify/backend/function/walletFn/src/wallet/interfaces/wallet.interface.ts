import { WalletTransactionDocument } from '../schemas/wallet-transaction.schema';

export interface WalletTransactionResponse {
  _id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: 'money' | 'coins';
  source: 'referral' | 'order' | 'refund' | 'admin';
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionHistoryResponse {
  transactions: WalletTransactionDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface WalletBalance {
  money: number;
  coins: number;
  userId: string;
}


