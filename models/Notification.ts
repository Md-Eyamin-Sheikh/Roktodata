import mongoose, { Schema, Document, Model } from 'mongoose';
import { BLOOD_GROUPS, BloodGroup } from './_shared';

export interface INotification extends Document {
  notifCode: string;
  category: 'urgent' | 'my-req' | 'health' | 'camps' | 'system' | 'general';
  title: string;
  description: string;
  timestamp: string;
  bloodGroup?: BloodGroup;
  donorName?: string;
  isUnread: boolean;
  actionType?: 'respond' | 'call' | 'details' | 'calendar';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    notifCode: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ['urgent', 'my-req', 'health', 'camps', 'system', 'general'],
      default: 'system',
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: String, default: 'এইমাত্র' },
    bloodGroup: { type: String, enum: BLOOD_GROUPS },
    donorName: { type: String },
    isUnread: { type: Boolean, default: true },
    actionType: { type: String, enum: ['respond', 'call', 'details', 'calendar'] },
  },
  { timestamps: true }
);

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
