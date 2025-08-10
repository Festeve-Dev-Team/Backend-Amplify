import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

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

  @Prop({ required: true })
  pincode: string;

  @Prop()
  country?: string;

  @Prop({ default: false })
  isDefault?: boolean;
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Purohit' })
  purohitId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event' })
  eventId?: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  timeSlot: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 0, min: 0 })
  paidAmount: number;

  @Prop({ default: 0, min: 0 })
  dueAmount: number;

  @Prop({ default: false })
  isGroupBooking: boolean;

  @Prop({ min: 1 })
  groupSize?: number;

  @Prop({ type: Types.ObjectId, ref: 'Offer' })
  groupOfferId?: Types.ObjectId;

  @Prop({ min: 0 })
  groupDiscountValue?: number;

  @Prop({
    enum: ['pending', 'partially_paid', 'paid', 'failed', 'refunded'],
    default: 'pending',
  })
  paymentStatus: string;

  @Prop([{ type: Types.ObjectId, ref: 'PaymentRecord' }])
  paymentRecords: Types.ObjectId[];

  @Prop({
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Address, required: true })
  address: Address;

  @Prop({ type: Object })
  extraNotes?: Record<string, any>;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Pre-save middleware to validate either purohitId or eventId is provided
BookingSchema.pre('save', function(next) {
  if (!this.purohitId && !this.eventId) {
    return next(new Error('Either purohitId or eventId must be provided'));
  }
  this.dueAmount = this.amount - this.paidAmount;
  next();
});

// Indexes for efficient querying
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ purohitId: 1, date: 1 });
BookingSchema.index({ eventId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ date: 1, timeSlot: 1 });
BookingSchema.index({ isGroupBooking: 1 });


