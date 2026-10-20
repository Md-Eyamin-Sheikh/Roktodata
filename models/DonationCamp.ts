import mongoose, { Schema, Document, Model } from 'mongoose';
import { PointSchema, IPoint } from './_shared';

export interface IDonationCamp extends Document {
  campCode: string;
  dateDay: string;
  dateMonth: string;
  time: string;
  organizer: string;
  venue: string;
  locationName: string;
  location?: IPoint;
  isRsvp: boolean;
  registeredCount: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationCampSchema = new Schema<IDonationCamp>(
  {
    campCode: { type: String, required: true, unique: true, index: true },
    dateDay: { type: String, required: true },
    dateMonth: { type: String, required: true },
    time: { type: String, required: true },
    organizer: { type: String, required: true },
    venue: { type: String, required: true },
    locationName: { type: String, default: 'বগুড়া সদর' },
    location: { type: PointSchema, index: '2dsphere' },
    isRsvp: { type: Boolean, default: false },
    registeredCount: { type: Number, default: 0 },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const DonationCampModel: Model<IDonationCamp> =
  mongoose.models.DonationCamp || mongoose.model<IDonationCamp>('DonationCamp', DonationCampSchema);
