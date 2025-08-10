import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TestimonialDocument = Testimonial & Document;

@Schema({ timestamps: true })
export class Testimonial {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  approvedByAdmin: boolean;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);

// Indexes for efficient querying
TestimonialSchema.index({ userId: 1 });
TestimonialSchema.index({ isVerified: 1 });
TestimonialSchema.index({ approvedByAdmin: 1 });
TestimonialSchema.index({ rating: -1 });


