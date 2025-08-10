import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminSettingsDocument = AdminSettings & Document;

@Schema({ _id: false })
class HomepageSection {
  @Prop({
    required: true,
    enum: [
      'whatsToday',
      'trending',
      'flashSale',
      'exclusiveOffer',
      'bestDeal',
      'testimonials',
    ],
  })
  key: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event' })
  eventId?: Types.ObjectId;
}

@Schema({ _id: false })
class Banner {
  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  linkUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event' })
  eventId?: Types.ObjectId;

  @Prop({ default: 0 })
  position: number;

  @Prop({ default: true })
  isActive: boolean;
}

@Schema({ timestamps: true })
export class AdminSettings {
  @Prop({ type: Types.ObjectId, ref: 'Event' })
  dailyEventId?: Types.ObjectId;

  @Prop({ type: [HomepageSection], default: [] })
  homepageSections: HomepageSection[];

  @Prop({ type: [Banner], default: [] })
  banners: Banner[];

  @Prop([{ type: Types.ObjectId, ref: 'Product' }])
  featuredProductIds: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'Event' }])
  featuredEventIds: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'Product' }])
  manuallyCuratedTrending: Types.ObjectId[];

  @Prop({ type: Object })
  customSections?: Record<string, any>;
}

export const AdminSettingsSchema = SchemaFactory.createForClass(AdminSettings);

// Create default settings if none exist
AdminSettingsSchema.pre('save', function(next) {
  if (this.isNew && (!this.homepageSections || this.homepageSections.length === 0)) {
    this.homepageSections = [
      { key: 'whatsToday', enabled: true, title: "What's Today" },
      { key: 'trending', enabled: true, title: 'Trending Products' },
      { key: 'flashSale', enabled: true, title: 'Flash Sale' },
      { key: 'exclusiveOffer', enabled: true, title: 'Exclusive Offers' },
      { key: 'bestDeal', enabled: true, title: 'Best Deals' },
      { key: 'testimonials', enabled: true, title: 'Customer Reviews' },
    ];
  }
  next();
});

// Indexes
AdminSettingsSchema.index({ 'homepageSections.key': 1 });
AdminSettingsSchema.index({ 'banners.isActive': 1, 'banners.position': 1 });


