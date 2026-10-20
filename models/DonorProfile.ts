import mongoose, { Schema, Document, Model } from 'mongoose';
import { PointSchema, IPoint, BLOOD_GROUPS, BloodGroup } from './_shared';

export interface IDonorProfile extends Document {
  donorCode: string;
  name: string;
  avatarText: string;
  bloodGroup: BloodGroup;
  locationName: string;
  location?: IPoint;
  distanceKm: number;
  isAvailableToday: boolean;
  isVerified: boolean;
  totalDonations: number;
  lastDonationDate: string;
  responseTimeMinutes: string;
  phone: string;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DonorProfileSchema = new Schema<IDonorProfile>(
  {
    donorCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    avatarText: { type: String, required: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, index: true },
    locationName: { type: String, required: true },
    location: { type: PointSchema, index: '2dsphere' },
    distanceKm: { type: Number, default: 2.5 },
    isAvailableToday: { type: Boolean, default: true, index: true },
    isVerified: { type: Boolean, default: true },
    totalDonations: { type: Number, default: 1 },
    lastDonationDate: { type: String, default: '৪ মাস আগে' },
    responseTimeMinutes: { type: String, default: '১০-১৫ মিনিটের মধ্যে' },
    phone: { type: String, required: true },
    isBookmarked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DonorProfileModel: Model<IDonorProfile> =
  mongoose.models.DonorProfile || mongoose.model<IDonorProfile>('DonorProfile', DonorProfileSchema);
