import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurohitDocument = Purohit & Document;

@Schema({ _id: false })
class Location {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true, match: /^\d{6}$/ })
  pincode: string;
}

@Schema({ _id: false })
class Availability {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, type: [String] })
  timeSlots: string[];
}

@Schema({ _id: false })
class Rating {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  review?: string;

  @Prop({ default: Date.now })
  date: Date;
}

@Schema({ timestamps: true })
export class Purohit {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: Location, required: true })
  location: Location;

  @Prop({ required: true, min: 0 })
  experienceYears: number;

  @Prop({ required: true, type: [String] })
  skills: string[];

  @Prop({ type: [Availability] })
  availability: Availability[];

  @Prop()
  bio?: string;

  @Prop({ type: [Rating] })
  ratings: Rating[];

  @Prop({ type: Object })
  customSkills?: Record<string, any>;

  @Prop([String])
  rituals: string[];

  @Prop([String])
  languages: string[];

  @Prop({ default: false })
  chargesCommission: boolean;

  @Prop({
    type: String,
    enum: ['percentage', 'flat'],
    required: function() { return this.chargesCommission; }
  })
  commissionType?: 'percentage' | 'flat';

  @Prop({
    type: Number,
    min: 0,
    required: function() { return this.chargesCommission; }
  })
  commissionValue?: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const PurohitSchema = SchemaFactory.createForClass(Purohit);

// Virtual for average rating
PurohitSchema.virtual('averageRating').get(function() {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
});

// Ensure virtual fields are serialized
PurohitSchema.set('toJSON', { virtuals: true });
PurohitSchema.set('toObject', { virtuals: true });

// Indexes for efficient querying
PurohitSchema.index({ 'location.pincode': 1 });
PurohitSchema.index({ 'location.city': 1 });
PurohitSchema.index({ 'location.state': 1 });
PurohitSchema.index({ isActive: 1 });
PurohitSchema.index({ skills: 1 });
PurohitSchema.index({ rituals: 1 });
PurohitSchema.index({ languages: 1 });
PurohitSchema.index({ chargesCommission: 1 });
PurohitSchema.index({ 'availability.date': 1 });


