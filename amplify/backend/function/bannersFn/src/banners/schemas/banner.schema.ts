import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  linkUrl?: string;

  @Prop({ default: 0 })
  position: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

// Index for efficient querying
BannerSchema.index({ isActive: 1, position: 1 });


