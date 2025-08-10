import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OTPDocument = OTP & Document;

@Schema({ timestamps: true })
export class OTP {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  code: string;

  @Prop({ 
    required: true, 
    enum: ['signup', 'login', 'password_reset'] 
  })
  purpose: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 0 })
  attempts: number;
}

export const OTPSchema = SchemaFactory.createForClass(OTP);

// Index for cleanup of expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


