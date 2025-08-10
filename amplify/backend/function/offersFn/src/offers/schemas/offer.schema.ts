import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OfferDocument = Offer & Document;

@Schema({ _id: false })
class ComboItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

@Schema({ timestamps: true })
export class Offer {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
    enum: ['percentage_discount', 'fixed_discount', 'combo', 'group_discount'],
  })
  type: string;

  @Prop({
    required: true,
    enum: ['percentage', 'fixed'],
  })
  discountType: string;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ type: [ComboItem] })
  comboItems?: ComboItem[];

  @Prop({
    required: true,
    enum: ['product', 'event', 'booking'],
  })
  appliesTo: string;

  @Prop([{ type: Types.ObjectId }])
  targetIds: Types.ObjectId[];

  @Prop({ min: 1 })
  minGroupSize?: number;

  @Prop({ min: 1 })
  maxGroupSize?: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: false })
  combinable: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  conditions?: Record<string, any>;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

// Indexes for efficient querying
OfferSchema.index({ type: 1 });
OfferSchema.index({ appliesTo: 1 });
OfferSchema.index({ targetIds: 1 });
OfferSchema.index({ startDate: 1, endDate: 1 });
OfferSchema.index({ isActive: 1 });
OfferSchema.index({ minGroupSize: 1, maxGroupSize: 1 });


