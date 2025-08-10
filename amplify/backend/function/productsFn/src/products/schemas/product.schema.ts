import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ _id: true })
class ProductVariant {
  @Prop()
  sku?: string;

  @Prop({ type: Object })
  specs?: Record<string, any>;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ enum: ['percentage', 'fixed'] })
  discountType?: string;

  @Prop({ default: 0, min: 0 })
  discountValue: number;

  @Prop([String])
  images: string[];

  @Prop({ default: true })
  isActive: boolean;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop([String])
  tags: string[];

  @Prop({ default: false })
  isHotItem: boolean;

  @Prop([String])
  ingredients: string[];

  @Prop([{ type: Types.ObjectId, ref: 'Vendor' }])
  vendors: Types.ObjectId[];

  @Prop({ type: [ProductVariant], required: true })
  variants: ProductVariant[];

  @Prop({ enum: ['percentage', 'fixed'] })
  defaultDiscountType?: string;

  @Prop({ default: 0, min: 0 })
  defaultDiscountValue: number;

  @Prop([{ type: Types.ObjectId, ref: 'Event' }])
  linkedEvents: Types.ObjectId[];

  @Prop({ enum: ['exclusive_offer', 'flash_sale', 'best_deal'] })
  offerType?: string;

  @Prop()
  offerStart?: Date;

  @Prop()
  offerEnd?: Date;

  @Prop({ default: false })
  isTrending: boolean;

  @Prop({ type: Object })
  meta?: Record<string, any>;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes for efficient querying
ProductSchema.index({ name: 'text', description: 'text', tags: 'text', ingredients: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ isHotItem: 1 });
ProductSchema.index({ vendors: 1 });
ProductSchema.index({ isTrending: 1 });
ProductSchema.index({ 'variants.price': 1 });
ProductSchema.index({ offerType: 1, offerStart: 1, offerEnd: 1 });


