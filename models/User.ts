import mongoose, { Schema, Document, Model } from 'mongoose';
import { PointSchema, IPoint, BLOOD_GROUPS, BloodGroup } from './_shared';

export interface IUser extends Document {
  phone: string;
  name: string;
  role: 'user' | 'donor' | 'hospital_admin';
  locationName: string;
  location?: IPoint;
  isVerified: boolean;
  isAvailable: boolean;
  bloodGroup: BloodGroup;
  totalDonations: number;
  livesImpacted: number;
  emergencyResponses: number;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  daysRemaining?: number;
  donorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'donor', 'hospital_admin'], default: 'donor' },
    locationName: { type: String, required: true, default: 'বগুড়া সদর, বগুড়া' },
    location: { type: PointSchema, index: '2dsphere' },
    isVerified: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, default: 'B+' },
    totalDonations: { type: Number, default: 5 },
    livesImpacted: { type: Number, default: 15 },
    emergencyResponses: { type: Number, default: 3 },
    lastDonationDate: { type: String, default: '১২ আগস্ট ২০২৬' },
    nextEligibleDate: { type: String, default: '১৫ নভেম্বর ২০২৬' },
    daysRemaining: { type: Number, default: 23 },
    donorId: { type: String, default: 'RD-88421' },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
