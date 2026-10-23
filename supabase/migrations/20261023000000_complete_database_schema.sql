-- =========================================================================
-- রক্তদাতা (Roktodata) — Supabase PostgreSQL Production Migration
-- Migration: 20261023000000_complete_database_schema.sql
-- Description: সম্পূর্ণ ডেটাবেজ স্কিমা (১৫টি কোর টেবিল, রিলেশন, ইনডেক্স, আরএলএস ও ট্রিগার)
-- =========================================================================

-- ১. প্রয়োজনীয় এক্সটেনশন সক্রিয়করণ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- ২. স্বয়ংক্রিয় updated_at টাইমস্ট্যাম্প ট্রিগার ফাংশন
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- ৩. ভৌগোলিক রেফারেন্স টেবিল (Districts & Upazilas)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.districts (
  id VARCHAR(50) PRIMARY KEY,
  name_bn VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  division_id VARCHAR(50) NOT NULL,
  division_bn VARCHAR(100) NOT NULL,
  division_en VARCHAR(100) NOT NULL,
  lat NUMERIC(9,6) NOT NULL,
  lng NUMERIC(9,6) NOT NULL,
  upazilas JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_districts_division ON public.districts(division_id);
CREATE INDEX IF NOT EXISTS idx_districts_name_bn ON public.districts(name_bn);
CREATE INDEX IF NOT EXISTS idx_districts_name_en ON public.districts(name_en);

-- =========================================================================
-- ৪. Profiles Table (ব্যবহারকারী ও সদস্য প্রোফাইল)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  upazila VARCHAR(50),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  role VARCHAR(20) DEFAULT 'donor' CHECK (role IN ('user', 'donor', 'hospital_admin', 'volunteer', 'admin')),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  avatar_url TEXT,
  text_size_preference VARCHAR(10) DEFAULT '100%',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- কলাম মাইগ্রেশন সেফটি (বিদ্যমান ডাটাবেসের জন্য)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'donor' CHECK (role IN ('user', 'donor', 'hospital_admin', 'volunteer', 'admin'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_division ON public.profiles(division);
CREATE INDEX IF NOT EXISTS idx_profiles_district_upazila ON public.profiles(district, upazila);
CREATE INDEX IF NOT EXISTS idx_profiles_blood_group ON public.profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_gps ON public.profiles(latitude, longitude);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- ৫. Donor Profiles Table (ডোনার স্ট্যাটাস ও প্রাপ্যতা ট্র্যাকার)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  total_donations INTEGER DEFAULT 0 CHECK (total_donations >= 0),
  last_donation_date DATE,
  next_eligible_date DATE,
  is_fast_responder BOOLEAN DEFAULT false,
  national_id_verified BOOLEAN DEFAULT false,
  privacy_hide_phone BOOLEAN DEFAULT true,
  reward_points INTEGER DEFAULT 100 CHECK (reward_points >= 0),
  badges JSONB DEFAULT '["নতুন সদস্য"]'::jsonb,
  preferred_donation_areas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.donor_profiles ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 100;
ALTER TABLE public.donor_profiles ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '["নতুন সদস্য"]'::jsonb;
ALTER TABLE public.donor_profiles ADD COLUMN IF NOT EXISTS preferred_donation_areas JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.donor_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_donor_available ON public.donor_profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_donor_user_avail ON public.donor_profiles(user_id, is_available);
CREATE INDEX IF NOT EXISTS idx_donor_next_eligible ON public.donor_profiles(next_eligible_date);
CREATE INDEX IF NOT EXISTS idx_donor_points ON public.donor_profiles(reward_points DESC);

DROP TRIGGER IF EXISTS trg_donor_profiles_updated_at ON public.donor_profiles;
CREATE TRIGGER trg_donor_profiles_updated_at
  BEFORE UPDATE ON public.donor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- ৬. Emergency Requests Table (জরুরি রক্তের আবেদন)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  bags_needed INTEGER NOT NULL DEFAULT 1 CHECK (bags_needed > 0 AND bags_needed <= 20),
  bags_fulfilled INTEGER NOT NULL DEFAULT 0 CHECK (bags_fulfilled >= 0 AND bags_fulfilled <= bags_needed),
  component_type VARCHAR(20) DEFAULT 'whole' CHECK (component_type IN ('whole', 'platelets', 'plasma')),
  hospital_name VARCHAR(200) NOT NULL,
  division VARCHAR(50) DEFAULT 'ঢাকা',
  district VARCHAR(50) NOT NULL,
  upazila VARCHAR(100),
  location_detail VARCHAR(150),
  ward_number VARCHAR(50),
  bed_number VARCHAR(50),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('now', 'today', '24-48', 'scheduled')),
  time_target VARCHAR(100),
  patient_name VARCHAR(100) NOT NULL,
  patient_relation VARCHAR(50),
  reason VARCHAR(150),
  contact_phone VARCHAR(25) NOT NULL,
  prescription_image_url TEXT,
  tracking_step INTEGER DEFAULT 1 CHECK (tracking_step BETWEEN 1 AND 5),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'matched', 'completed', 'fulfilled', 'cancelled')),
  has_verified_hospital BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emergency_requests ADD COLUMN IF NOT EXISTS bags_fulfilled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.emergency_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_requests_district ON public.emergency_requests(district);
CREATE INDEX IF NOT EXISTS idx_requests_district_status ON public.emergency_requests(district, status);
CREATE INDEX IF NOT EXISTS idx_requests_upazila ON public.emergency_requests(upazila);
CREATE INDEX IF NOT EXISTS idx_requests_blood_group ON public.emergency_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_urgency ON public.emergency_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_requests_requester_id ON public.emergency_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_gps ON public.emergency_requests(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.emergency_requests(created_at DESC);

DROP TRIGGER IF EXISTS trg_emergency_requests_updated_at ON public.emergency_requests;
CREATE TRIGGER trg_emergency_requests_updated_at
  BEFORE UPDATE ON public.emergency_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- ৭. Donor Responses Table (রিয়েল-টাইম লাইভ ম্যাচিং ও সাড়া ট্র্যাকিং)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.donor_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.emergency_requests(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.donor_profiles(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'on_the_way', 'arrived', 'confirmed', 'completed', 'declined', 'cancelled')),
  eta_minutes INTEGER NOT NULL CHECK (eta_minutes >= 0),
  distance_km NUMERIC(5, 2) DEFAULT 2.5 CHECK (distance_km >= 0),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_request_donor UNIQUE(request_id, donor_id)
);

ALTER TABLE public.donor_responses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_responses_request_id ON public.donor_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_responses_donor_id ON public.donor_responses(donor_id);
CREATE INDEX IF NOT EXISTS idx_responses_status ON public.donor_responses(status);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON public.donor_responses(created_at DESC);

DROP TRIGGER IF EXISTS trg_donor_responses_updated_at ON public.donor_responses;
CREATE TRIGGER trg_donor_responses_updated_at
  BEFORE UPDATE ON public.donor_responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- ৮. Hospitals & Blood Banks Table (হাসপাতাল ও ব্লাড ব্যাংক ডিরেক্টরি)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.hospitals_and_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(30) DEFAULT 'medical_college' CHECK (type IN ('medical_college', 'district_hospital', 'upazila_health_complex', 'red_crescent', 'private_clinic', 'blood_bank')),
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  upazila VARCHAR(50),
  address TEXT NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  hotline VARCHAR(25) NOT NULL,
  operating_hours VARCHAR(50) DEFAULT '২৪/৭ খোলা',
  has_blood_bank BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hospitals_and_banks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_hospitals_district ON public.hospitals_and_banks(district);
CREATE INDEX IF NOT EXISTS idx_hospitals_division ON public.hospitals_and_banks(division);
CREATE INDEX IF NOT EXISTS idx_hospitals_gps ON public.hospitals_and_banks(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_hospitals_type ON public.hospitals_and_banks(type);

DROP TRIGGER IF EXISTS trg_hospitals_updated_at ON public.hospitals_and_banks;
CREATE TRIGGER trg_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals_and_banks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- ৯. Blood Inventory Table (হাসপাতাল ও ব্লাড ব্যাংক স্টক)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.blood_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals_and_banks(id) ON DELETE CASCADE NOT NULL,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  units_available INTEGER DEFAULT 0 CHECK (units_available >= 0),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'low', 'critical', 'empty', 'sufficient', 'limited')),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_hospital_blood_group UNIQUE(hospital_id, blood_group)
);

ALTER TABLE public.blood_inventory ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.blood_inventory ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_inventory_hospital ON public.blood_inventory(hospital_id);
CREATE INDEX IF NOT EXISTS idx_inventory_blood_group ON public.blood_inventory(blood_group);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.blood_inventory(status);

DROP TRIGGER IF EXISTS trg_inventory_updated_at ON public.blood_inventory;
CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON public.blood_inventory
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- ১০. Ambulances Directory Table (জরুরি অ্যাম্বুলেন্স সেবা)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_name VARCHAR(100) NOT NULL,
  service_type VARCHAR(100) DEFAULT 'অক্সিজেন ও জরুরি রোগী পরিবহন',
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  location_base VARCHAR(150) NOT NULL,
  phone_number VARCHAR(25) NOT NULL,
  ambulance_type VARCHAR(30) DEFAULT 'Normal' CHECK (ambulance_type IN ('ICU', 'Normal', 'Freezing', 'AC', 'Non-AC')),
  is_available_24_7 BOOLEAN DEFAULT true,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ambulances ADD COLUMN IF NOT EXISTS ambulance_type VARCHAR(30) DEFAULT 'Normal';
ALTER TABLE public.ambulances ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6);
ALTER TABLE public.ambulances ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);
ALTER TABLE public.ambulances ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_ambulances_district ON public.ambulances(district);
CREATE INDEX IF NOT EXISTS idx_ambulances_division ON public.ambulances(division);
CREATE INDEX IF NOT EXISTS idx_ambulances_available ON public.ambulances(is_available_24_7);

DROP TRIGGER IF EXISTS trg_ambulances_updated_at ON public.ambulances;
CREATE TRIGGER trg_ambulances_updated_at
  BEFORE UPDATE ON public.ambulances
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- ১১. Donation Camps Table (রক্তদান ক্যাম্পেইন ও ইভেন্ট)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.donation_camps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer VARCHAR(150) NOT NULL,
  venue VARCHAR(200) NOT NULL,
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  upazila VARCHAR(100),
  camp_date DATE NOT NULL,
  date_day VARCHAR(10),
  date_month VARCHAR(20),
  time_slot VARCHAR(50) NOT NULL,
  target_units INTEGER DEFAULT 100 CHECK (target_units >= 0),
  registered_count INTEGER DEFAULT 0 CHECK (registered_count >= 0),
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  description TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.donation_camps ADD COLUMN IF NOT EXISTS upazila VARCHAR(100);
ALTER TABLE public.donation_camps ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming';
ALTER TABLE public.donation_camps ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.donation_camps ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6);
ALTER TABLE public.donation_camps ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);
ALTER TABLE public.donation_camps ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_camps_district ON public.donation_camps(district);
CREATE INDEX IF NOT EXISTS idx_camps_date ON public.donation_camps(camp_date);
CREATE INDEX IF NOT EXISTS idx_camps_status ON public.donation_camps(status);

DROP TRIGGER IF EXISTS trg_camps_updated_at ON public.donation_camps;
CREATE TRIGGER trg_camps_updated_at
  BEFORE UPDATE ON public.donation_camps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- ১২. Donation History / Records Table (যাচাইকৃত রক্তদানের ইতিহাস)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.donation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES public.donor_profiles(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.emergency_requests(id) ON DELETE SET NULL,
  hospital_name VARCHAR(200) NOT NULL,
  donation_date DATE NOT NULL,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  patient_name VARCHAR(100),
  units_donated INTEGER DEFAULT 1 CHECK (units_donated > 0),
  badge_earned VARCHAR(50),
  verified_by_hospital BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.donation_history ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES public.emergency_requests(id) ON DELETE SET NULL;
ALTER TABLE public.donation_history ADD COLUMN IF NOT EXISTS patient_name VARCHAR(100);
ALTER TABLE public.donation_history ADD COLUMN IF NOT EXISTS units_donated INTEGER DEFAULT 1;
ALTER TABLE public.donation_history ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.donation_history ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_donation_history_donor ON public.donation_history(donor_id);
CREATE INDEX IF NOT EXISTS idx_donation_history_date ON public.donation_history(donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_donation_history_request ON public.donation_history(request_id);

DROP TRIGGER IF EXISTS trg_donation_history_updated_at ON public.donation_history;
CREATE TRIGGER trg_donation_history_updated_at
  BEFORE UPDATE ON public.donation_history
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- রক্তদান হিস্ট্রির সাথে donor_profiles-এর total_donations ও next_eligible_date স্বয়ংক্রিয় সিঙ্ক ট্রিগার
CREATE OR REPLACE FUNCTION public.sync_donor_history_on_donation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.donor_profiles
  SET 
    total_donations = total_donations + NEW.units_donated,
    last_donation_date = NEW.donation_date,
    next_eligible_date = NEW.donation_date + INTERVAL '90 days',
    reward_points = reward_points + 50,
    updated_at = NOW()
  WHERE id = NEW.donor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_donor_history ON public.donation_history;
CREATE TRIGGER trg_sync_donor_history
  AFTER INSERT ON public.donation_history
  FOR EACH ROW EXECUTE FUNCTION public.sync_donor_history_on_donation();

-- donation_records ভিউ (README ও সোর্স কোড উভয় কাঠামোর সাথে ১০০% সামঞ্জস্যপূর্ণ)
CREATE OR REPLACE VIEW public.donation_records AS
SELECT * FROM public.donation_history;

-- =========================================================================
-- ১৩. Notifications Table (সিস্টেম, ব্রডকাস্ট ও ইউজার নোটিফিকেশন)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category VARCHAR(20) DEFAULT 'urgent' CHECK (category IN ('urgent', 'my-req', 'camp', 'badge', 'system', 'health')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  blood_group VARCHAR(5) CHECK (blood_group IS NULL OR blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  action_type VARCHAR(30) CHECK (action_type IS NULL OR action_type IN ('respond', 'call', 'details', 'calendar', 'link')),
  action_url TEXT,
  is_unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_type VARCHAR(30);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url TEXT;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_unread);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- =========================================================================
-- ১৪. Chat Messages Table (ইন-অ্যাপ সুরক্ষিত চ্যাট মেসেজিং)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.emergency_requests(id) ON DELETE SET NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL CHECK (char_length(trim(message)) > 0),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_request_id ON public.chat_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversation ON public.chat_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_receiver_unread ON public.chat_messages(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON public.chat_messages(created_at ASC);

-- =========================================================================
-- ১৫. Reports Table (অনিয়ম, ভুয়া অনুরোধ ও প্রতারণা রিপোর্ট)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.emergency_requests(id) ON DELETE SET NULL,
  reason VARCHAR(255) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

DROP TRIGGER IF EXISTS trg_reports_updated_at ON public.reports;
CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- ১৬. Donor Bookmarks Table (পছন্দের রক্তদাতা বুকমার্ক)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.donor_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.donor_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_donor_bookmark UNIQUE(user_id, donor_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.donor_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_donor_id ON public.donor_bookmarks(donor_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.donor_bookmarks(created_at DESC);

-- =========================================================================
-- ১৭. Campaign RSVPs Table (রক্তদান ক্যাম্পেইন রেজিস্ট্রেশন)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.campaign_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id UUID REFERENCES public.donation_camps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'attending' CHECK (status IN ('attending', 'cancelled', 'attended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_camp_user_rsvp UNIQUE(camp_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rsvps_camp_id ON public.campaign_rsvps(camp_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id ON public.campaign_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_status ON public.campaign_rsvps(status);

DROP TRIGGER IF EXISTS trg_campaign_rsvps_updated_at ON public.campaign_rsvps;
CREATE TRIGGER trg_campaign_rsvps_updated_at
  BEFORE UPDATE ON public.campaign_rsvps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ক্যাম্পেইন আরএসভিপি এর সাথে registered_count সিঙ্ক ফাংশন
CREATE OR REPLACE FUNCTION public.sync_camp_rsvp_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.donation_camps
    SET registered_count = registered_count + 1
    WHERE id = NEW.camp_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.donation_camps
    SET registered_count = GREATEST(0, registered_count - 1)
    WHERE id = OLD.camp_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_camp_rsvp ON public.campaign_rsvps;
CREATE TRIGGER trg_sync_camp_rsvp
  AFTER INSERT OR DELETE ON public.campaign_rsvps
  FOR EACH ROW EXECUTE FUNCTION public.sync_camp_rsvp_count();

-- =========================================================================
-- ১৮. Push Subscriptions Table (ওয়েব পুশ নোটিফিকেশন সাবস্ক্রিপশন)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  district VARCHAR(50),
  blood_group VARCHAR(5) CHECK (blood_group IS NULL OR blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_district ON public.push_subscriptions(district);
CREATE INDEX IF NOT EXISTS idx_push_blood_group ON public.push_subscriptions(blood_group);
CREATE INDEX IF NOT EXISTS idx_push_active ON public.push_subscriptions(is_active);

DROP TRIGGER IF EXISTS trg_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER trg_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- ১৯. লাইভ জেলা ভিত্তিক রিয়েল-টাইম মেট্রিক্স ভিউ (District Live Metrics View)
-- =========================================================================
CREATE OR REPLACE VIEW public.district_live_metrics AS
SELECT 
  d.id AS district_id,
  d.name_bn AS district_name_bn,
  d.name_en AS district_name_en,
  d.division_id,
  d.division_bn,
  d.lat,
  d.lng,
  d.upazilas,
  COALESCE(req.active_count, 0) AS active_requests,
  COALESCE(don.ready_count, 0) AS ready_donors,
  COALESCE(hosp.hospital_count, 0) AS hospital_count
FROM public.districts d
LEFT JOIN (
  SELECT district, COUNT(*) AS active_count 
  FROM public.emergency_requests 
  WHERE status = 'active' 
  GROUP BY district
) req ON req.district = d.name_bn OR req.district = d.name_en
LEFT JOIN (
  SELECT p.district, COUNT(*) AS ready_count 
  FROM public.profiles p 
  JOIN public.donor_profiles dp ON dp.user_id = p.id 
  WHERE dp.is_available = true 
  GROUP BY p.district
) don ON don.district = d.name_bn OR don.district = d.name_en
LEFT JOIN (
  SELECT district, COUNT(*) AS hospital_count 
  FROM public.hospitals_and_banks 
  GROUP BY district
) hosp ON hosp.district = d.name_bn OR hosp.district = d.name_en;

-- =========================================================================
-- ২০. Haversine Formula: নিকটতম জেলা গণনা ফাংশন
-- =========================================================================
CREATE OR REPLACE FUNCTION public.find_nearest_district(user_lat NUMERIC, user_lng NUMERIC)
RETURNS TABLE (
  district_id VARCHAR(50),
  name_bn VARCHAR(100),
  name_en VARCHAR(100),
  division_bn VARCHAR(100),
  distance_km NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name_bn,
    d.name_en,
    d.division_bn,
    ROUND(
      (6371 * acos(
        cos(radians(user_lat)) * cos(radians(d.lat)) *
        cos(radians(d.lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(d.lat))
      ))::NUMERIC, 1
    ) AS distance_km
  FROM public.districts d
  ORDER BY distance_km ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- ২১. Row Level Security (RLS) & Policies
-- =========================================================================
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals_and_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- পলিসি তৈরি (Idempotent: DROP IF EXISTS -> CREATE)
DROP POLICY IF EXISTS "districts_public_read" ON public.districts;
CREATE POLICY "districts_public_read" ON public.districts FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_write_all" ON public.profiles;
CREATE POLICY "profiles_write_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "donor_profiles_read_all" ON public.donor_profiles;
CREATE POLICY "donor_profiles_read_all" ON public.donor_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "donor_profiles_write_all" ON public.donor_profiles;
CREATE POLICY "donor_profiles_write_all" ON public.donor_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "emergency_requests_read_all" ON public.emergency_requests;
CREATE POLICY "emergency_requests_read_all" ON public.emergency_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "emergency_requests_write_all" ON public.emergency_requests;
CREATE POLICY "emergency_requests_write_all" ON public.emergency_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "donor_responses_read_all" ON public.donor_responses;
CREATE POLICY "donor_responses_read_all" ON public.donor_responses FOR SELECT USING (true);
DROP POLICY IF EXISTS "donor_responses_write_all" ON public.donor_responses;
CREATE POLICY "donor_responses_write_all" ON public.donor_responses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "hospitals_read_all" ON public.hospitals_and_banks;
CREATE POLICY "hospitals_read_all" ON public.hospitals_and_banks FOR SELECT USING (true);
DROP POLICY IF EXISTS "hospitals_write_all" ON public.hospitals_and_banks;
CREATE POLICY "hospitals_write_all" ON public.hospitals_and_banks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "inventory_read_all" ON public.blood_inventory;
CREATE POLICY "inventory_read_all" ON public.blood_inventory FOR SELECT USING (true);
DROP POLICY IF EXISTS "inventory_write_all" ON public.blood_inventory;
CREATE POLICY "inventory_write_all" ON public.blood_inventory FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ambulances_read_all" ON public.ambulances;
CREATE POLICY "ambulances_read_all" ON public.ambulances FOR SELECT USING (true);
DROP POLICY IF EXISTS "ambulances_write_all" ON public.ambulances;
CREATE POLICY "ambulances_write_all" ON public.ambulances FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "camps_read_all" ON public.donation_camps;
CREATE POLICY "camps_read_all" ON public.donation_camps FOR SELECT USING (true);
DROP POLICY IF EXISTS "camps_write_all" ON public.donation_camps;
CREATE POLICY "camps_write_all" ON public.donation_camps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "history_read_all" ON public.donation_history;
CREATE POLICY "history_read_all" ON public.donation_history FOR SELECT USING (true);
DROP POLICY IF EXISTS "history_write_all" ON public.donation_history;
CREATE POLICY "history_write_all" ON public.donation_history FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_read_all" ON public.notifications;
CREATE POLICY "notifications_read_all" ON public.notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "notifications_write_all" ON public.notifications;
CREATE POLICY "notifications_write_all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "chat_read_all" ON public.chat_messages;
CREATE POLICY "chat_read_all" ON public.chat_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "chat_write_all" ON public.chat_messages;
CREATE POLICY "chat_write_all" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "reports_read_all" ON public.reports;
CREATE POLICY "reports_read_all" ON public.reports FOR SELECT USING (true);
DROP POLICY IF EXISTS "reports_write_all" ON public.reports;
CREATE POLICY "reports_write_all" ON public.reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "bookmarks_read_all" ON public.donor_bookmarks;
CREATE POLICY "bookmarks_read_all" ON public.donor_bookmarks FOR SELECT USING (true);
DROP POLICY IF EXISTS "bookmarks_write_all" ON public.donor_bookmarks;
CREATE POLICY "bookmarks_write_all" ON public.donor_bookmarks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "rsvps_read_all" ON public.campaign_rsvps;
CREATE POLICY "rsvps_read_all" ON public.campaign_rsvps FOR SELECT USING (true);
DROP POLICY IF EXISTS "rsvps_write_all" ON public.campaign_rsvps;
CREATE POLICY "rsvps_write_all" ON public.campaign_rsvps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "push_subs_read_all" ON public.push_subscriptions;
CREATE POLICY "push_subs_read_all" ON public.push_subscriptions FOR SELECT USING (true);
DROP POLICY IF EXISTS "push_subs_write_all" ON public.push_subscriptions;
CREATE POLICY "push_subs_write_all" ON public.push_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Permissive grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- =========================================================================
-- ২২. Supabase Realtime Publication
-- =========================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'emergency_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'donor_responses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_responses;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;
