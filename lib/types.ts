export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export type UrgencyLevel = 'now' | 'today' | '24-48' | 'scheduled';

export type ComponentType = 'whole' | 'platelets' | 'plasma';

export type StockLevel = 'adequate' | 'limited' | 'empty';

export interface EmergencyRequest {
  id: string;
  bloodGroup: BloodGroup;
  hospitalName: string;
  location: string;
  distanceKm: number;
  bagsNeeded: number;
  bagsFulfilled?: number;
  urgency: UrgencyLevel;
  urgencyLabel: string;
  timeTarget: string;
  createdAt: string;
  componentType?: ComponentType;
  patientName?: string;
  patientRelation?: string;
  patientType?: string;
  reason?: string;
  wardNumber?: string;
  bedNumber?: string;
  wardBed?: string;
  contactNumber?: string;
  prescriptionImageUrl?: string;
  hasVerifiedHospital: boolean;
  hasPrescriptionSlip?: boolean;
  isCaseVerified?: boolean;
  status?: 'active' | 'in_progress' | 'fulfilled' | 'cancelled';
  respondingDonorsCount?: number;
  trackingStep?: number; // 1 to 5
  hasResponded?: boolean;
  userResponseEta?: number;
}

export interface Donor {
  id: string;
  name: string;
  avatarText: string;
  avatarUrl?: string;
  bloodGroup: BloodGroup;
  location: string;
  distanceKm: number;
  isAvailableToday: boolean;
  isVerified: boolean;
  totalDonations: number;
  lastDonationDate: string;
  responseTimeMinutes: string;
  phone: string;
  isBookmarked?: boolean;
}

export interface RespondingDonor {
  id: string;
  donorId?: string;
  name: string;
  avatarText?: string;
  avatarUrl?: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  etaMinutes: number;
  totalDonations?: number;
  lastDonated?: string;
  lastDonationMonths?: number;
  isVerified: boolean;
  isFastResponder?: boolean;
  phone: string;
  status: 'en_route' | 'confirmed' | 'pending' | 'on_the_way' | 'accepted';
}

export interface DonationCamp {
  id: string;
  dateDay: string;
  dateMonth: string;
  time: string;
  organizer: string;
  venue: string;
  isRsvp: boolean;
  registeredCount: number;
  description?: string;
}

export interface HospitalBloodBank {
  id: string;
  name: string;
  type: 'hospital' | 'blood_bank';
  isOpen: boolean;
  timing: string;
  distanceKm: number;
  location: string;
  phone: string;
  lastUpdated: string;
  stocks: { [key in BloodGroup]: { count: number; status: StockLevel } };
}

export interface AmbulanceService {
  id: string;
  providerName: string;
  phone: string;
  location: string;
  distanceKm: number;
  type: 'ICU' | 'Freezing' | 'Normal' | 'AC';
  isAvailable247: boolean;
}

export interface HealthEducationArticle {
  id: string;
  title: string;
  category: 'eligibility' | 'before_after' | 'myths';
  summary: string;
  details: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'donor' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  category: 'urgent' | 'my-req' | 'camps' | 'health' | 'system';
  title: string;
  description: string;
  timestamp: string;
  bloodGroup?: BloodGroup;
  isUnread: boolean;
  actionType?: 'call' | 'respond' | 'calendar' | 'details';
  donorName?: string;
}

export interface UserBadge {
  id: string;
  title: string;
  subtitle: string;
  icon?: string;
}

export interface DonationRecord {
  id: string;
  hospital: string;
  date: string;
  recipientType: string;
  bagsCount?: number;
  units?: number;
  status?: string;
  certificateId?: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  bloodGroup: BloodGroup;
  donorId: string;
  phone: string;
  location: string;
  isVerified: boolean;
  isAvailable: boolean;
  lastDonationDate: string;
  nextEligibleDate: string;
  daysRemaining: number;
  daysUntilNextEligible?: number;
  totalDonations: number;
  livesImpacted: number;
  emergencyResponses: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  notificationRadiusKm: number;
  phoneVisibility: 'verified_family' | 'all_registered';
  language: 'bn' | 'en';
  textSize: '100%' | '125%' | '150%';
  reducedMotion: boolean;
  isProfileComplete?: boolean;
  badges?: UserBadge[];
  donationHistory?: DonationRecord[];
}
