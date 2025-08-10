import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
class Address {
  @Prop()
  label?: string;

  @Prop({ required: true })
  line1: string;

  @Prop()
  line2?: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true, match: /^\d{6}$/ })
  pincode: string;

  @Prop({ required: true })
  country: string;

  @Prop({ default: false })
  isDefault: boolean;
}

@Schema({ _id: false })
class SpecialPerson {
  @Prop()
  name?: string;

  @Prop()
  relation?: string;

  @Prop()
  birthday?: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  phone?: string;

  @Prop({ 
    required: true, 
    enum: ['auth0', 'firebase', 'cognito', 'native'] 
  })
  provider: string;

  @Prop({ required: true, unique: true })
  providerUserId: string;

  @Prop({ select: false })
  passwordHash?: string;

  @Prop()
  profilePicture?: string;

  @Prop({ 
    enum: ['user', 'admin'], 
    default: 'user' 
  })
  role: string;

  @Prop({ unique: true, index: true })
  referralCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  referredBy?: Types.ObjectId;

  @Prop({ default: 0 })
  rewardWallet: number;

  @Prop({ default: 0 })
  coinWallet: number;

  @Prop({ type: SpecialPerson })
  specialPersonDetails?: SpecialPerson;

  @Prop([{ type: Types.ObjectId, ref: 'Product' }])
  wishlist: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'Booking' }])
  bookings: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'Order' }])
  orders: Types.ObjectId[];

  @Prop({ type: [Address], validate: [arrayLimit, 'Exceeds the limit of 10'] })
  addresses: Address[];

  @Prop({ type: Object })
  meta?: Record<string, any>;
}

function arrayLimit(val: any[]) {
  return val.length <= 10;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Ensure only one default address
UserSchema.pre('save', function(next) {
  if (this.addresses) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the first default address
      let foundDefault = false;
      this.addresses.forEach(addr => {
        if (addr.isDefault && foundDefault) {
          addr.isDefault = false;
        } else if (addr.isDefault) {
          foundDefault = true;
        }
      });
    }
  }
  next();
});


