import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeliverySlotDocument = DeliverySlot & Document;

@Schema({ timestamps: true })
export class DeliverySlot {
  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true, min: 1 })
  maxOrders: number;

  @Prop({ default: 0, min: 0 })
  currentOrders: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;
}

export const DeliverySlotSchema = SchemaFactory.createForClass(DeliverySlot);

// Indexes for efficient querying
DeliverySlotSchema.index({ startTime: 1 });
DeliverySlotSchema.index({ endTime: 1 });
DeliverySlotSchema.index({ isActive: 1 });
DeliverySlotSchema.index({ startTime: 1, isActive: 1 });


