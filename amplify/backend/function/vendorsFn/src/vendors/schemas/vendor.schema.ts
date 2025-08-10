import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VendorDocument = Vendor & Document;

@Schema({ _id: false })
class VendorRating {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  review?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Vendor {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [VendorRating] })
  ratings: VendorRating[];

  @Prop([{ type: Types.ObjectId, ref: 'Product' }])
  productIds: Types.ObjectId[];
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

// Virtual for average rating
VendorSchema.virtual('averageRating').get(function() {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
});

// Ensure virtual fields are serialized
VendorSchema.set('toJSON', { virtuals: true });
VendorSchema.set('toObject', { virtuals: true });

// Indexes for efficient querying
VendorSchema.index({ name: 1 });
VendorSchema.index({ 'ratings.userId': 1 });
VendorSchema.index({ productIds: 1 });


