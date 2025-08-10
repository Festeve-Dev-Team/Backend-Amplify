import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsletterDocument = Newsletter & Document;

@Schema({ timestamps: true })
export class Newsletter {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  token: string;

  @Prop({ default: false })
  confirmed: boolean;

  @Prop()
  unsubscribedAt?: Date;
}

export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);

// Indexes for efficient querying
NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ token: 1 });
NewsletterSchema.index({ confirmed: 1 });
NewsletterSchema.index({ unsubscribedAt: 1 });


