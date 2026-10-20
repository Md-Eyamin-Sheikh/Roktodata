-- =========================================================================
-- রক্তদাতা (Roktodata) — Supabase PostgreSQL Production Database Schema
-- Version: 2.0 (৮টি বিভাগ, ৬৪টি জেলা ও থানা, রিয়েল-টাইম মেট্রিক্স ও জিপিএস)
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. বাংলাদেশ ভৌগোলিক রেফারেন্স টেবিল (Districts & Upazilas)
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
-- 2. Profiles Table (সদস্য ও ডোনার প্রোফাইল)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  upazila VARCHAR(50),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  avatar_url TEXT,
  text_size_preference VARCHAR(10) DEFAULT '100%',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_district_upazila ON public.profiles(district, upazila);
CREATE INDEX IF NOT EXISTS idx_profiles_blood_group ON public.profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_profiles_gps ON public.profiles(latitude, longitude);

-- =========================================================================
-- 3. Donor Profiles Table (ডোনার স্ট্যাটাস ও প্রাপ্যতা ট্র্যাকার)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_available BOOLEAN DEFAULT true, -- 'আপনি এখন রক্ত দেওয়ার জন্য প্রস্তুত'
  total_donations INTEGER DEFAULT 0,
  last_donation_date DATE,
  next_eligible_date DATE, -- 90-day cooldown calculation
  is_fast_responder BOOLEAN DEFAULT false,
  national_id_verified BOOLEAN DEFAULT false,
  privacy_hide_phone BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donor_available ON public.donor_profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_donor_user_avail ON public.donor_profiles(user_id, is_available);

-- =========================================================================
-- 4. Emergency Requests Table (জরুরি রক্তের আবেদন)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  bags_needed INTEGER NOT NULL DEFAULT 1 CHECK (bags_needed > 0 AND bags_needed <= 10),
  component_type VARCHAR(20) DEFAULT 'whole' CHECK (component_type IN ('whole', 'platelets', 'plasma')),
  hospital_name VARCHAR(200) NOT NULL,
  division VARCHAR(50) DEFAULT 'রাজশাহী',
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
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'matched', 'completed', 'cancelled')),
  has_verified_hospital BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_requests_district ON public.emergency_requests(district);
CREATE INDEX IF NOT EXISTS idx_requests_district_status ON public.emergency_requests(district, status);
CREATE INDEX IF NOT EXISTS idx_requests_upazila ON public.emergency_requests(upazila);
CREATE INDEX IF NOT EXISTS idx_requests_blood_group ON public.emergency_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_gps ON public.emergency_requests(latitude, longitude);

-- =========================================================================
-- 5. Donor Responses Table (রিয়েল-টাইম লাইভ ম্যাচিং)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.donor_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.emergency_requests(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.donor_profiles(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('accepted', 'on_the_way', 'confirmed', 'completed', 'declined')),
  eta_minutes INTEGER NOT NULL,
  distance_km NUMERIC(4, 2) DEFAULT 2.5,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, donor_id)
);

CREATE INDEX IF NOT EXISTS idx_responses_request_id ON public.donor_responses(request_id);

-- =========================================================================
-- 6. Hospitals & Blood Banks Directory Table (হাসপাতাল ও ব্লাড ব্যাংক)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.hospitals_and_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(30) DEFAULT 'medical_college' CHECK (type IN ('medical_college', 'district_hospital', 'red_crescent', 'private_clinic')),
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hospitals_district ON public.hospitals_and_banks(district);
CREATE INDEX IF NOT EXISTS idx_hospitals_gps ON public.hospitals_and_banks(latitude, longitude);

-- =========================================================================
-- 7. Blood Inventory Table (ব্লাড ব্যাংক স্টক)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.blood_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES public.hospitals_and_banks(id) ON DELETE CASCADE NOT NULL,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  units_available INTEGER DEFAULT 0 CHECK (units_available >= 0),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'low', 'critical', 'empty')),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(facility_id, blood_group)
);

-- =========================================================================
-- 8. Ambulances Directory Table (জরুরি অ্যাম্বুলেন্স)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_name VARCHAR(100) NOT NULL,
  service_type VARCHAR(100) DEFAULT 'অক্সিজেন ও জরুরি রোগী পরিবহন',
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  location_base VARCHAR(150) NOT NULL,
  phone_number VARCHAR(25) NOT NULL,
  is_available_24_7 BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ambulances_district ON public.ambulances(district);

-- =========================================================================
-- 9. Donation Camps Table (রক্তদান ক্যাম্পেইন)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.donation_camps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer VARCHAR(150) NOT NULL,
  venue VARCHAR(200) NOT NULL,
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  camp_date DATE NOT NULL,
  date_day VARCHAR(10),
  date_month VARCHAR(20),
  time_slot VARCHAR(50) NOT NULL,
  target_units INTEGER DEFAULT 100,
  registered_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camps_district ON public.donation_camps(district);

-- =========================================================================
-- 10. Donation History & User Notifications
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.donation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES public.donor_profiles(id) ON DELETE CASCADE NOT NULL,
  hospital_name VARCHAR(200) NOT NULL,
  donation_date DATE NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  badge_earned VARCHAR(50),
  verified_by_hospital BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(20) DEFAULT 'urgent' CHECK (category IN ('urgent', 'my-req', 'camp', 'badge')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  is_unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 11. লাইভ জেলা ভিত্তিক রিয়েল-টাইম মেট্রিক্স ভিউ (District Live Metrics View)
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
-- 12. PostgreSQL জিপিএস নিকটতম জেলা ক্যালকুলেশন ফাংশন (Haversine Formula)
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
-- 13. ROW LEVEL SECURITY (RLS) POLICIES & PERMISSIONS
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

-- Allow Public Access for fast community usage
CREATE POLICY "Public districts viewable by all" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Public emergency_requests viewable by all" ON public.emergency_requests FOR SELECT USING (true);
CREATE POLICY "Public can insert emergency_requests" ON public.emergency_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update emergency_requests" ON public.emergency_requests FOR UPDATE USING (true);

CREATE POLICY "Public profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Donor profiles viewable by all" ON public.donor_profiles FOR SELECT USING (true);
CREATE POLICY "Public can insert donor_profiles" ON public.donor_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update donor_profiles" ON public.donor_profiles FOR UPDATE USING (true);

CREATE POLICY "Donor responses viewable by all" ON public.donor_responses FOR SELECT USING (true);
CREATE POLICY "Donors can respond" ON public.donor_responses FOR INSERT WITH CHECK (true);

CREATE POLICY "Directories viewable by all" ON public.hospitals_and_banks FOR SELECT USING (true);
CREATE POLICY "Ambulances viewable by all" ON public.ambulances FOR SELECT USING (true);
CREATE POLICY "Camps viewable by all" ON public.donation_camps FOR SELECT USING (true);
CREATE POLICY "Inventory viewable by all" ON public.blood_inventory FOR SELECT USING (true);
CREATE POLICY "Notifications viewable by all" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Donation history viewable by all" ON public.donation_history FOR SELECT USING (true);

-- Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_responses;
