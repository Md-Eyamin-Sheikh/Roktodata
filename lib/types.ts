export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export type UrgencyLevel = 'now' | 'today' | '24-48' | 'scheduled';

export type ComponentType = 'whole' | 'platelets' | 'plasma';

export type StockLevel = 'adequate' | 'limited' | 'empty';

export type RequestStatus =
  | 'open'
  | 'active'
  | 'partially_fulfilled'
  | 'in_progress'
  | 'fulfilled'
  | 'cancelled'
  | 'expired';

export interface EmergencyRequest {
  id: string;
  bloodGroup: BloodGroup;
  hospitalName: string;
  location: string;
  division?: string;
  district?: string;
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
  cabinNumber?: string;
  wardBed?: string;
  contactNumber?: string;
  prescriptionImageUrl?: string;
  prescriptionSignedUrl?: string;
  hasVerifiedHospital: boolean;
  hasPrescriptionSlip?: boolean;
  isCaseVerified?: boolean;
  status?: RequestStatus;
  respondingDonorsCount?: number;
  trackingStep?: number; // 1 to 5
  hasResponded?: boolean;
  userResponseEta?: number;
  userTransportMode?: TransportMode;
  idempotencyKey?: string;
}

export type TransportMode = 'walking' | 'rickshaw' | 'motorcycle' | 'car' | 'public';

export type DonorResponseStatus =
  | 'accepted'
  | 'on_the_way'
  | 'confirmed'
  | 'declined'
  | 'cancelled'
  | 'en_route'
  | 'pending';

export interface Donor {
  id: string;
  name: string;
  avatarText: string;
  avatarUrl?: string;
  bloodGroup: BloodGroup;
  location: string;
  district?: string;
  upazila?: string;
  distanceKm: number;
  isAvailableToday: boolean;
  isVerified: boolean;
  totalDonations: number;
  lastDonationDate: string;
  responseTimeMinutes: string;
  phone: string;
  phoneMasked?: string;
  privacyHidePhone?: boolean;
  isFastResponder?: boolean;
  hospitalAffiliation?: string;
  gender?: 'male' | 'female';
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
  transportMode?: TransportMode;
  transportLabel?: string;
  respondedAt?: string;
  message?: string;
  status: DonorResponseStatus;
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
  targetUnits?: number;
  targetBags?: number;
  description?: string;
}

export interface HospitalBloodBank {
  id: string;
  name: string;
  type: 'hospital' | 'blood_bank' | 'medical_college' | 'district_hospital' | 'upazila_health_complex' | 'red_crescent' | 'private_clinic';
  isOpen: boolean;
  timing: string;
  distanceKm: number;
  location: string;
  district?: string;
  division?: string;
  phone: string;
  lastUpdated: string;
  isVerified?: boolean;
  stocks: { [key in BloodGroup]: { count: number; status: StockLevel } };
}

export interface BloodInventoryLog {
  id: string;
  hospitalId: string;
  hospitalName?: string;
  bloodGroup: BloodGroup;
  previousUnits: number;
  newUnits: number;
  delta: number;
  operatorId?: string;
  operatorName?: string;
  reason?: string;
  timestamp: string;
}

export interface AmbulanceService {
  id: string;
  providerName: string;
  phone: string;
  location: string;
  district?: string;
  division?: string;
  distanceKm: number;
  type: 'ICU' | 'Freezing' | 'Normal' | 'AC';
  isAvailable247: boolean;
  isVerified?: boolean;
}

export interface HealthEducationArticle {
  id: string;
  title: string;
  category: 'eligibility' | 'before_after' | 'myths' | 'recovery';
  summary: string;
  details: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'donor' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  requestId?: string;
  senderId?: string;
  receiverId?: string;
}

export interface SafeChatMessage {
  id: string;
  requestId: string | null;
  senderId: string;
  receiverId?: string | null;
  senderName?: string;
  message: string;
  isRead?: boolean;
  isMe?: boolean;
  createdAt: string;
}

export interface FraudReportPayload {
  reporterId?: string;
  reportedUserId?: string;
  reportedName?: string;
  targetUserId?: string;
  targetName?: string;
  requestId?: string;
  reason: string;
  description?: string;
  details?: string;
  proofFileName?: string;
  proofFileUrl?: string;
  proofImageUrl?: string;
}

export type ReportStatus = 'pending' | 'reviewing' | 'investigating' | 'resolved' | 'dismissed';

export interface FraudReportItem {
  id: string;
  reporterId?: string | null;
  reportedUserId?: string | null;
  reportedName?: string;
  targetUserId?: string | null;
  targetName?: string;
  targetPhone?: string;
  requestId?: string | null;
  reason: string;
  description?: string;
  details?: string;
  status: ReportStatus;
  proofFileName?: string;
  proofFileUrl?: string;
  proofImageUrl?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface CreateCampPayload {
  organizer: string;
  venue: string;
  division?: string;
  district: string;
  upazila?: string;
  campDate: string;
  timeSlot: string;
  targetUnits?: number;
  description?: string;
}

export interface AppNotification {
  id: string;
  category: 'urgent' | 'my-req' | 'camps' | 'health' | 'system' | 'general';
  title: string;
  description: string;
  timestamp: string;
  bloodGroup?: BloodGroup;
  isUnread: boolean;
  actionType?: 'call' | 'respond' | 'calendar' | 'details';
  actionUrl?: string;
  donorName?: string;
  link?: string;
  requestId?: string;
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
  id?: string;
  name: string;
  email?: string;
  bloodGroup: BloodGroup;
  donorId: string;
  phone: string;
  location: string;
  division?: string;
  district?: string;
  upazila?: string;
  userId?: string;
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
  role?: 'donor' | 'hospital_operator' | 'admin' | 'recipient';
  badges?: UserBadge[];
  donationHistory?: DonationRecord[];
}
