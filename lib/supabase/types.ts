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
export type RequestStatus = 'active' | 'matched' | 'completed' | 'cancelled';
export type DonorResponseStatus = 'accepted' | 'on_the_way' | 'confirmed' | 'completed' | 'declined';
export type InventoryStatus = 'available' | 'low' | 'critical';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone_number: string;
          full_name: string;
          blood_group: BloodGroup;
          division: string;
          district: string;
          upazila: string | null;
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
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          is_available?: boolean;
          total_donations?: number;
          last_donation_date?: string | null;
          next_eligible_date?: string | null;
          is_fast_responder?: boolean;
          national_id_verified?: boolean;
          privacy_hide_phone?: boolean;
          updated_at?: string;
        };
      };
      emergency_requests: {
        Row: {
          id: string;
          requester_id: string | null;
          blood_group: BloodGroup;
          bags_needed: number;
          component_type: ComponentType;
          hospital_name: string;
          division: string;
          district: string;
          location_detail: string | null;
          ward_number: string | null;
          bed_number: string | null;
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
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          requester_id?: string | null;
          blood_group: BloodGroup;
          bags_needed?: number;
          component_type?: ComponentType;
          hospital_name: string;
          division?: string;
          district: string;
          location_detail?: string | null;
          ward_number?: string | null;
          bed_number?: string | null;
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
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          bags_needed?: number;
          component_type?: ComponentType;
          hospital_name?: string;
          district?: string;
          ward_number?: string | null;
          bed_number?: string | null;
          urgency?: UrgencyLevel;
          time_target?: string | null;
          tracking_step?: number;
          status?: RequestStatus;
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
          address: string;
          hotline: string;
          is_verified: boolean;
          operating_hours: string;
          created_at: string;
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
          is_available_24_7: boolean;
          created_at: string;
        };
      };
      donation_camps: {
        Row: {
          id: string;
          organizer: string;
          venue: string;
          division: string;
          district: string;
          camp_date: string;
          date_day: string | null;
          date_month: string | null;
          time_slot: string;
          target_units: number;
          registered_count: number;
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          title: string;
          description: string;
          is_unread: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category?: string;
          title: string;
          description: string;
          is_unread?: boolean;
          created_at?: string;
        };
        Update: {
          is_unread?: boolean;
        };
      };
    };
  };
}
