import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ _id: false })
class Recurring {
  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ enum: ['daily', 'weekly', 'yearly'] })
  frequency?: string;

  @Prop([Number])
  daysOfWeek?: number[]; // 0=Sunday...6=Saturday
}

@Schema({ _id: false })
class SpecialOffer {
  @Prop({ 
    required: true, 
    enum: ['exclusive_offer', 'flash_sale', 'best_deal'] 
  })
  offerType: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;
}

@Schema({ _id: false })
class LinkedProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ 
    required: true, 
    enum: ['poojaKit', 'outfit', 'sweet', 'general'] 
  })
  relation: string;
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ 
    enum: ['festival', 'daily', 'weekly'], 
    default: 'daily' 
  })
  type: string;

  @Prop({ required: true })
  date: Date; // for one-off or "next occurrence"

  @Prop({ type: Recurring })
  recurring: Recurring;

  @Prop({ type: [LinkedProduct] })
  linkedProducts: LinkedProduct[];

  @Prop({ default: false })
  purohitRequired: boolean;

  @Prop()
  ritualNotes?: string;

  @Prop()
  region?: string;

  @Prop([String])
  regions?: string[];

  @Prop({ type: [SpecialOffer] })
  specialOffers: SpecialOffer[];

  @Prop({ type: Object })
  extraData?: Record<string, any>;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Indexes for efficient querying
EventSchema.index({ date: 1 });
EventSchema.index({ type: 1 });
EventSchema.index({ region: 1 });
EventSchema.index({ regions: 1 });
EventSchema.index({ 'recurring.isRecurring': 1 });
EventSchema.index({ 'recurring.frequency': 1 });


