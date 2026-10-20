import mongoose, { Schema, Document, Model } from 'mongoose';
import { PointSchema, IPoint, BLOOD_GROUPS, BloodGroup } from './_shared';

export interface IBloodStock {
  count: number;
  status: 'adequate' | 'limited' | 'empty';
}

export interface IHospital extends Document {
  hospitalCode: string;
  name: string;
  type: 'hospital' | 'blood_bank';
  isOpen: boolean;
  timing: string;
  distanceKm: number;
  locationName: string;
  location?: IPoint;
  phone: string;
  lastUpdated: string;
  stocks: Record<BloodGroup, IBloodStock>;
  createdAt: Date;
  updatedAt: Date;
}

const BloodStockSchema = new Schema<IBloodStock>(
  {
    count: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['adequate', 'limited', 'empty'], default: 'limited' },
  },
  { _id: false }
);

const HospitalSchema = new Schema<IHospital>(
  {
    hospitalCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['hospital', 'blood_bank'], default: 'hospital' },
    isOpen: { type: Boolean, default: true },
    timing: { type: String, default: '২৪ ঘণ্টা খোলা' },
    distanceKm: { type: Number, default: 2.0 },
    locationName: { type: String, required: true },
    location: { type: PointSchema, index: '2dsphere' },
    phone: { type: String, required: true },
    lastUpdated: { type: String, default: 'আজ' },
    stocks: {
      'O+': { type: BloodStockSchema, default: { count: 8, status: 'adequate' } },
      'B+': { type: BloodStockSchema, default: { count: 10, status: 'adequate' } },
      'A+': { type: BloodStockSchema, default: { count: 5, status: 'adequate' } },
      'AB+': { type: BloodStockSchema, default: { count: 2, status: 'limited' } },
      'O-': { type: BloodStockSchema, default: { count: 1, status: 'limited' } },
      'B-': { type: BloodStockSchema, default: { count: 1, status: 'limited' } },
      'A-': { type: BloodStockSchema, default: { count: 0, status: 'empty' } },
      'AB-': { type: BloodStockSchema, default: { count: 0, status: 'empty' } },
    },
  },
  { timestamps: true }
);

export const HospitalModel: Model<IHospital> =
  mongoose.models.Hospital || mongoose.model<IHospital>('Hospital', HospitalSchema);
