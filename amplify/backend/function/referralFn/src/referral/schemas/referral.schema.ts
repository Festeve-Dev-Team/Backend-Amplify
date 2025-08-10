import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReferralDocument = Referral & Document;

@Schema({ timestamps: true })
export class Referral {
  @Prop({ required: true })
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  referrer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  referee: Types.ObjectId;

  @Prop({ default: Date.now })
  usedAt: Date;

  @Prop({ required: true })
  bonusAmount: number;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);

// Ensure unique referral per user
ReferralSchema.index({ referee: 1 }, { unique: true });


