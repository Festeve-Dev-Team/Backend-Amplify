import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  variantId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  total: number;
}

@Schema({ _id: false })
class ShippingAddress {
  @Prop({ required: true })
  line1: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  pincode: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ default: 0, min: 0 })
  paidAmount: number;

  @Prop({ default: 0, min: 0 })
  dueAmount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({
    enum: ['placed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
  })
  status: string;

  @Prop({
    enum: ['pending', 'partially_paid', 'paid', 'failed', 'refunded'],
    default: 'pending',
  })
  paymentStatus: string;

  @Prop()
  paymentMethod?: string;

  @Prop()
  paymentProvider?: string;

  @Prop([{ type: Types.ObjectId, ref: 'PaymentRecord' }])
  paymentRecords: Types.ObjectId[];

  @Prop({ type: ShippingAddress, required: true })
  shippingAddress: ShippingAddress;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Pre-save middleware to calculate due amount
OrderSchema.pre('save', function(next) {
  this.dueAmount = this.totalAmount - this.paidAmount;
  next();
});

// Indexes for efficient querying
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ 'items.productId': 1 });


