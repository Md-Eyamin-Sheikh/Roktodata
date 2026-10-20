import { Schema } from 'mongoose';
import crypto from 'crypto';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const COMPONENTS = ['whole_blood', 'platelet', 'plasma'] as const;
export type ComponentType = (typeof COMPONENTS)[number];

// পূর্ণ রক্তের জন্য: রোগীর গ্রুপ → যে গ্রুপের ডোনার দিতে পারেন
export const COMPATIBLE_DONOR_GROUPS: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

// ন্যূনতম বিরতি (দিন)। পুরুষ: ৯০ দিন, নারী: ১২০ দিন
export const DONATION_INTERVAL_DAYS = {
  male: 90,
  female: 120,
  other: 120,
} as const;

// হাসপাতালের স্টক স্ট্যাটাস নির্ণয় (সংরক্ষণ নয়, রিড-টাইমে নির্ণয়)
export const stockStatus = (bags: number): 'critical' | 'limited' | 'sufficient' =>
  bags === 0 ? 'critical' : bags < 5 ? 'limited' : 'sufficient';

// র‍্যান্ডম শর্ট কোড জেনারেটর (যেমন "REQ-7K2M9Q" বা "RD-88421")
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const makeCode = (prefix: string, length = 6): string => {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }
  return `${prefix}-${result}`;
};

export interface IPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export const PointSchema = new Schema<IPoint>(
  {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (v: number[]) =>
          Array.isArray(v) &&
          v.length === 2 &&
          v[0] >= -180 &&
          v[0] <= 180 &&
          v[1] >= -90 &&
          v[1] <= 90,
        message: 'coordinates অবশ্যই [lng, lat] হতে হবে',
      },
    },
  },
  { _id: false }
);
