export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
export type ComponentType = 'whole' | 'platelets' | 'plasma';
export type UrgencyLevel = 'now' | 'today' | '24-48' | 'scheduled';
export type RequestStatus = 'open' | 'active' | 'partially_fulfilled' | 'in_progress' | 'matched' | 'completed' | 'fulfilled' | 'cancelled' | 'expired';
export type DonorResponseStatus = 'pending' | 'accepted' | 'on_the_way' | 'arrived' | 'confirmed' | 'completed' | 'declined' | 'cancelled';
export type InventoryStatus = 'available' | 'low' | 'critical' | 'empty' | 'sufficient' | 'limited';
export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';
export type CampStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type RsvpStatus = 'attending' | 'cancelled' | 'attended';

export interface Database {
  public: {
    Tables: {
      districts: {
        Row: {
          id: string;
          name_bn: string;
          name_en: string;
          division_id: string;
          division_bn: string;
          division_en: string;
          lat: number;
          lng: number;
          upazilas: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          name_bn: string;
          name_en: string;
          division_id: string;
          division_bn: string;
          division_en: string;
          lat: number;
          lng: number;
          upazilas?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_bn?: string;
          name_en?: string;
          division_id?: string;
          division_bn?: string;
          division_en?: string;
          lat?: number;
          lng?: number;
          upazilas?: Json;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          phone_number: string;
          full_name: string;
          blood_group: BloodGroup;
          division: string;
          district: string;
          upazila: string | null;
          gender: 'male' | 'female' | 'other' | null;
          date_of_birth: string | null;
          role: string;
          latitude: number | null;
          longitude: number | null;
          avatar_url: string | null;
          text_size_preference: string;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone_number: string;
          full_name: string;
          blood_group: BloodGroup;
          division: string;
          district: string;
          upazila?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          date_of_birth?: string | null;
          role?: string;
          latitude?: number | null;
          longitude?: number | null;
          avatar_url?: string | null;
          text_size_preference?: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone_number?: string;
          full_name?: string;
          blood_group?: BloodGroup;
          division?: string;
          district?: string;
          upazila?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          date_of_birth?: string | null;
          role?: string;
          latitude?: number | null;
          longitude?: number | null;
          avatar_url?: string | null;
          text_size_preference?: string;
          is_verified?: boolean;
          updated_at?: string;
        };
      };
      donor_profiles: {
        Row: {
          id: string;
          user_id: string;
          is_available: boolean;
          total_donations: number;
          last_donation_date: string | null;
          next_eligible_date: string | null;
          is_fast_responder: boolean;
          national_id_verified: boolean;
          privacy_hide_phone: boolean;
          reward_points: number;
          badges: Json;
          preferred_donation_areas: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          is_available?: boolean;
          total_donations?: number;
          last_donation_date?: string | null;
          next_eligible_date?: string | null;
          is_fast_responder?: boolean;
          national_id_verified?: boolean;
          privacy_hide_phone?: boolean;
          reward_points?: number;
          badges?: Json;
          preferred_donation_areas?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          is_available?: boolean;
          total_donations?: number;
          last_donation_date?: string | null;
          next_eligible_date?: string | null;
          is_fast_responder?: boolean;
          national_id_verified?: boolean;
          privacy_hide_phone?: boolean;
          reward_points?: number;
          badges?: Json;
          preferred_donation_areas?: Json;
          updated_at?: string;
        };
      };
      emergency_requests: {
        Row: {
          id: string;
          requester_id: string | null;
          blood_group: BloodGroup;
          bags_needed: number;
          bags_fulfilled: number;
          component_type: ComponentType;
          hospital_name: string;
          division: string;
          district: string;
          upazila: string | null;
          location_detail: string | null;
          ward_number: string | null;
          bed_number: string | null;
          latitude: number | null;
          longitude: number | null;
          urgency: UrgencyLevel;
          time_target: string | null;
          patient_name: string;
          patient_relation: string | null;
          reason: string | null;
          contact_phone: string;
          prescription_image_url: string | null;
          tracking_step: number;
          status: RequestStatus;
          has_verified_hospital: boolean;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id?: string | null;
          blood_group: BloodGroup;
          bags_needed?: number;
          bags_fulfilled?: number;
          component_type?: ComponentType;
          hospital_name: string;
          division?: string;
          district: string;
          upazila?: string | null;
          location_detail?: string | null;
          ward_number?: string | null;
          bed_number?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          urgency: UrgencyLevel;
          time_target?: string | null;
          patient_name: string;
          patient_relation?: string | null;
          reason?: string | null;
          contact_phone: string;
          prescription_image_url?: string | null;
          tracking_step?: number;
          status?: RequestStatus;
          has_verified_hospital?: boolean;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string | null;
          blood_group?: BloodGroup;
          bags_needed?: number;
          bags_fulfilled?: number;
          component_type?: ComponentType;
          hospital_name?: string;
          division?: string;
          district?: string;
          upazila?: string | null;
          location_detail?: string | null;
          ward_number?: string | null;
          bed_number?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          urgency?: UrgencyLevel;
          time_target?: string | null;
          patient_name?: string;
          patient_relation?: string | null;
          reason?: string | null;
          contact_phone?: string;
          prescription_image_url?: string | null;
          tracking_step?: number;
          status?: RequestStatus;
          has_verified_hospital?: boolean;
          expires_at?: string;
          updated_at?: string;
        };
      };
      donor_responses: {
        Row: {
          id: string;
          request_id: string;
          donor_id: string;
          status: DonorResponseStatus;
          eta_minutes: number;
          distance_km: number | null;
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          donor_id: string;
          status?: DonorResponseStatus;
          eta_minutes: number;
          distance_km?: number | null;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          donor_id?: string;
          status?: DonorResponseStatus;
          eta_minutes?: number;
          distance_km?: number | null;
          message?: string | null;
          updated_at?: string;
        };
      };
      hospitals_and_banks: {
        Row: {
          id: string;
          name: string;
          type: string;
          division: string;
          district: string;
          upazila: string | null;
          address: string;
          latitude: number | null;
          longitude: number | null;
          hotline: string;
          operating_hours: string;
          has_blood_bank: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string;
          division: string;
          district: string;
          upazila?: string | null;
          address: string;
          latitude?: number | null;
          longitude?: number | null;
          hotline: string;
          operating_hours?: string;
          has_blood_bank?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          division?: string;
          district?: string;
          upazila?: string | null;
          address?: string;
          latitude?: number | null;
          longitude?: number | null;
          hotline?: string;
          operating_hours?: string;
          has_blood_bank?: boolean;
          is_verified?: boolean;
          updated_at?: string;
        };
      };
      blood_inventory: {
        Row: {
          id: string;
          hospital_id: string;
          blood_group: BloodGroup;
          units_available: number;
          status: InventoryStatus;
          last_updated: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hospital_id: string;
          blood_group: BloodGroup;
          units_available?: number;
          status?: InventoryStatus;
          last_updated?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hospital_id?: string;
          blood_group?: BloodGroup;
          units_available?: number;
          status?: InventoryStatus;
          last_updated?: string;
          updated_at?: string;
        };
      };
      ambulances: {
        Row: {
          id: string;
          driver_name: string;
          service_type: string;
          division: string;
          district: string;
          location_base: string;
          phone_number: string;
          ambulance_type: string;
          is_available_24_7: boolean;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_name: string;
          service_type?: string;
          division: string;
          district: string;
          location_base: string;
          phone_number: string;
          ambulance_type?: string;
          is_available_24_7?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          driver_name?: string;
          service_type?: string;
          division?: string;
          district?: string;
          location_base?: string;
          phone_number?: string;
          ambulance_type?: string;
          is_available_24_7?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          updated_at?: string;
        };
      };
      donation_camps: {
        Row: {
          id: string;
          organizer: string;
          venue: string;
          division: string;
          district: string;
          upazila: string | null;
          camp_date: string;
          date_day: string | null;
          date_month: string | null;
          time_slot: string;
          target_units: number;
          registered_count: number;
          status: CampStatus;
          description: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer: string;
          venue: string;
          division: string;
          district: string;
          upazila?: string | null;
          camp_date: string;
          date_day?: string | null;
          date_month?: string | null;
          time_slot: string;
          target_units?: number;
          registered_count?: number;
          status?: CampStatus;
          description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer?: string;
          venue?: string;
          division?: string;
          district?: string;
          upazila?: string | null;
          camp_date?: string;
          date_day?: string | null;
          date_month?: string | null;
          time_slot?: string;
          target_units?: number;
          registered_count?: number;
          status?: CampStatus;
          description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          updated_at?: string;
        };
      };
      donation_history: {
        Row: {
          id: string;
          donor_id: string;
          request_id: string | null;
          hospital_name: string;
          donation_date: string;
          blood_group: BloodGroup;
          patient_name: string | null;
          units_donated: number;
          badge_earned: string | null;
          verified_by_hospital: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          donor_id: string;
          request_id?: string | null;
          hospital_name: string;
          donation_date: string;
          blood_group: BloodGroup;
          patient_name?: string | null;
          units_donated?: number;
          badge_earned?: string | null;
          verified_by_hospital?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string;
          request_id?: string | null;
          hospital_name?: string;
          donation_date?: string;
          blood_group?: BloodGroup;
          patient_name?: string | null;
          units_donated?: number;
          badge_earned?: string | null;
          verified_by_hospital?: boolean;
          notes?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          category: string;
          title: string;
          description: string;
          blood_group: BloodGroup | null;
          action_type: string | null;
          action_url: string | null;
          is_unread: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          category?: string;
          title: string;
          description: string;
          blood_group?: BloodGroup | null;
          action_type?: string | null;
          action_url?: string | null;
          is_unread?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          category?: string;
          title?: string;
          description?: string;
          blood_group?: BloodGroup | null;
          action_type?: string | null;
          action_url?: string | null;
          is_unread?: boolean;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          request_id: string | null;
          sender_id: string;
          receiver_id: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id?: string | null;
          sender_id: string;
          receiver_id: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string | null;
          sender_id?: string;
          receiver_id?: string;
          message?: string;
          is_read?: boolean;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string | null;
          reported_user_id: string | null;
          request_id: string | null;
          reason: string;
          details: string | null;
          status: ReportStatus;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id?: string | null;
          reported_user_id?: string | null;
          request_id?: string | null;
          reason: string;
          details?: string | null;
          status?: ReportStatus;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string | null;
          reported_user_id?: string | null;
          request_id?: string | null;
          reason?: string;
          details?: string | null;
          status?: ReportStatus;
          admin_notes?: string | null;
          updated_at?: string;
        };
      };
      donor_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          donor_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          donor_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          donor_id?: string;
        };
      };
      campaign_rsvps: {
        Row: {
          id: string;
          camp_id: string;
          user_id: string;
          status: RsvpStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          camp_id: string;
          user_id: string;
          status?: RsvpStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          camp_id?: string;
          user_id?: string;
          status?: RsvpStatus;
          updated_at?: string;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          endpoint: string;
          p256dh: string;
          auth: string;
          district: string | null;
          blood_group: BloodGroup | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          endpoint: string;
          p256dh: string;
          auth: string;
          district?: string | null;
          blood_group?: BloodGroup | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          district?: string | null;
          blood_group?: BloodGroup | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: {
      district_live_metrics: {
        Row: {
          district_id: string;
          district_name_bn: string;
          district_name_en: string;
          division_id: string;
          division_bn: string;
          lat: number;
          lng: number;
          upazilas: Json;
          active_requests: number;
          ready_donors: number;
          hospital_count: number;
        };
      };
      donation_records: {
        Row: {
          id: string;
          donor_id: string;
          request_id: string | null;
          hospital_name: string;
          donation_date: string;
          blood_group: BloodGroup;
          patient_name: string | null;
          units_donated: number;
          badge_earned: string | null;
          verified_by_hospital: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      find_nearest_district: {
        Args: {
          user_lat: number;
          user_lng: number;
        };
        Returns: {
          district_id: string;
          name_bn: string;
          name_en: string;
          division_bn: string;
          distance_km: number;
        }[];
      };
    };
  };
}
