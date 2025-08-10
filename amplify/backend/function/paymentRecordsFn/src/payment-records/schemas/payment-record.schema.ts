import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentRecordDocument = PaymentRecord & Document;

@Schema({ timestamps: true })
export class PaymentRecord {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['order', 'booking'],
  })
  relatedTo: string;

  @Prop({ type: Types.ObjectId, required: true })
  referenceId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ required: true })
  provider: string; // e.g., 'razorpay', 'stripe'

  @Prop({ required: true })
  method: string; // e.g., 'UPI', 'cards', 'COD'

  @Prop()
  transactionId?: string;

  @Prop()
  paymentIntentId?: string;

  @Prop({
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  })
  status: string;

  @Prop()
  note?: string;

  @Prop()
  paidAt?: Date;
}

export const PaymentRecordSchema = SchemaFactory.createForClass(PaymentRecord);

// Indexes for efficient querying
PaymentRecordSchema.index({ userId: 1, createdAt: -1 });
PaymentRecordSchema.index({ relatedTo: 1, referenceId: 1 });
PaymentRecordSchema.index({ status: 1 });
PaymentRecordSchema.index({ provider: 1 });
PaymentRecordSchema.index({ transactionId: 1 });
PaymentRecordSchema.index({ paymentIntentId: 1 });


