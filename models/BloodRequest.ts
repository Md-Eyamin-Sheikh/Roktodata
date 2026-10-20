import mongoose, { Schema, Document, Model } from 'mongoose';
import { PointSchema, IPoint, BLOOD_GROUPS, BloodGroup } from './_shared';

export interface IRespondingDonorSub {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  phone: string;
  distanceKm: number;
  etaMinutes: number;
  isVerified: boolean;
  lastDonationMonths: number;
  status: 'pending' | 'accepted' | 'on_the_way' | 'arrived' | 'confirmed';
}

export interface IBloodRequest extends Document {
  requestCode: string;
  bloodGroup: BloodGroup;
  bagsNeeded: number;
  bagsFulfilled: number;
  hospitalName: string;
  locationName: string;
  location?: IPoint;
  distanceKm: number;
  urgency: 'now' | 'today' | '24-48' | 'scheduled';
  urgencyLabel: string;
  timeTarget: string;
  componentType: 'whole' | 'platelets' | 'plasma';
  patientName?: string;
  patientRelation?: string;
  reason?: string;
  wardBed?: string;
  contactNumber: string;
  hasVerifiedHospital: boolean;
  hasPrescriptionSlip: boolean;
  prescriptionImageUrl?: string;
  isCaseVerified: boolean;
  status: 'active' | 'in_progress' | 'fulfilled' | 'cancelled';
  trackingStep: number;
  respondingDonors: IRespondingDonorSub[];
  createdAt: Date;
  updatedAt: Date;
}

const RespondingDonorSubSchema = new Schema<IRespondingDonorSub>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    phone: { type: String, required: true },
    distanceKm: { type: Number, default: 2.5 },
    etaMinutes: { type: Number, default: 30 },
    isVerified: { type: Boolean, default: true },
    lastDonationMonths: { type: Number, default: 4 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'on_the_way', 'arrived', 'confirmed'],
      default: 'pending',
    },
  },
  { _id: false }
);

const BloodRequestSchema = new Schema<IBloodRequest>(
  {
    requestCode: { type: String, required: true, unique: true, index: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, index: true },
    bagsNeeded: { type: Number, required: true, default: 1 },
    bagsFulfilled: { type: Number, default: 0 },
    hospitalName: { type: String, required: true },
    locationName: { type: String, required: true },
    location: { type: PointSchema, index: '2dsphere' },
    distanceKm: { type: Number, default: 2.0 },
    urgency: { type: String, enum: ['now', 'today', '24-48', 'scheduled'], default: 'now', index: true },
    urgencyLabel: { type: String, default: 'এখনই' },
    timeTarget: { type: String, default: 'যত দ্রুত সম্ভব' },
    componentType: { type: String, enum: ['whole', 'platelets', 'plasma'], default: 'whole' },
    patientName: { type: String },
    patientRelation: { type: String },
    reason: { type: String },
    wardBed: { type: String },
    contactNumber: { type: String, required: true },
    hasVerifiedHospital: { type: Boolean, default: true },
    hasPrescriptionSlip: { type: Boolean, default: true },
    prescriptionImageUrl: { type: String },
    isCaseVerified: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'in_progress', 'fulfilled', 'cancelled'], default: 'active', index: true },
    trackingStep: { type: Number, default: 1 },
    respondingDonors: [RespondingDonorSubSchema],
  },
  { timestamps: true }
);

export const BloodRequestModel: Model<IBloodRequest> =
  mongoose.models.BloodRequest || mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);
