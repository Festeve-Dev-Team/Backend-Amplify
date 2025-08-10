import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletTransactionDocument = WalletTransaction & Document;

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ 
    required: true, 
    enum: ['credit', 'debit'] 
  })
  type: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ 
    required: true, 
    enum: ['money', 'coins'] 
  })
  currency: string;

  @Prop({ 
    required: true, 
    enum: ['referral', 'order', 'refund', 'admin'] 
  })
  source: string;

  @Prop({ type: Object })
  meta?: Record<string, any>;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);

// Index for efficient querying
WalletTransactionSchema.index({ userId: 1, createdAt: -1 });
WalletTransactionSchema.index({ userId: 1, type: 1, createdAt: -1 });
WalletTransactionSchema.index({ userId: 1, currency: 1, createdAt: -1 });


