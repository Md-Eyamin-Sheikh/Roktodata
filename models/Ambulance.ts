import mongoose, { Schema, Document, Model } from 'mongoose';
import { PointSchema, IPoint } from './_shared';

export interface IAmbulance extends Document {
  ambulanceCode: string;
  providerName: string;
  phone: string;
  locationName: string;
  location?: IPoint;
  distanceKm: number;
  type: 'ICU' | 'Normal' | 'Freezing' | 'AC';
  isAvailable247: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AmbulanceSchema = new Schema<IAmbulance>(
  {
    ambulanceCode: { type: String, required: true, unique: true, index: true },
    providerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    locationName: { type: String, required: true },
    location: { type: PointSchema, index: '2dsphere' },
    distanceKm: { type: Number, default: 2.5 },
    type: { type: String, enum: ['ICU', 'Normal', 'Freezing', 'AC'], default: 'Normal' },
    isAvailable247: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AmbulanceModel: Model<IAmbulance> =
  mongoose.models.Ambulance || mongoose.model<IAmbulance>('Ambulance', AmbulanceSchema);
