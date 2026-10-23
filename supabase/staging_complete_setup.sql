-- =========================================================================
-- রক্তদাতা (Roktodata) — STAGING ENVIRONMENT COMPLETE SETUP SCRIPT
-- =========================================================================
-- ⚠️ এই স্ক্রিপ্টটি শুধুমাত্র STAGING SUPABASE প্রোজেক্টের SQL Editor-এ রান করবেন।
-- এতে রয়েছে:
-- ১. সম্পূর্ণ ডেটাবেস স্কিমা (১৫টি টেবিল)
-- ২. Row Level Security (RLS) পলিসিসমূহ (প্রোডাকশন-অনুরূপ কঠোর নিরাপত্তা)
-- ৩. Storage Buckets (prescriptions - Private, avatars - Public)
-- ৪. Realtime Replication Publication
-- ৫. কৃত্রিম পরীক্ষামূলক ডেটা (100% Synthetic Mock Data - নো রিয়েল পেশেন্ট ডেটা)
-- =========================================================================

-- এক্সটেনশন সক্রিয়করণ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ফাংশন: updated_at স্বয়ংক্রিয় আপডেট
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- ১. স্কিমা তৈরি (TABLES DEFINITION)
-- =========================================================================

-- ১.১ Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(25) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  division VARCHAR(50) DEFAULT 'রাজশাহী',
  district VARCHAR(50) DEFAULT 'বগুড়া',
  upazila VARCHAR(50),
  avatar_url TEXT,
  role VARCHAR(30) DEFAULT 'donor' CHECK (role IN ('donor', 'recipient', 'hospital_operator', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  text_size_preference VARCHAR(10) DEFAULT '100%',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ১.২ Donor Profiles Table
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  last_donation_date DATE,
  total_donations INTEGER DEFAULT 0 CHECK (total_donations >= 0),
  reward_points INTEGER DEFAULT 50 CHECK (reward_points >= 0),
  badges JSONB DEFAULT '["নতুন সদস্য"]'::jsonb,
  privacy_hide_phone BOOLEAN DEFAULT true,
  is_fast_responder BOOLEAN DEFAULT false,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ১.৩ Emergency Requests Table
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  patient_name VARCHAR(100) NOT NULL,
  patient_relation VARCHAR(50) DEFAULT 'আত্মীয়',
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  component_type VARCHAR(30) DEFAULT 'whole' CHECK (component_type IN ('whole', 'rbc', 'platelets', 'plasma')),
  bags_needed INTEGER NOT NULL CHECK (bags_needed > 0 AND bags_needed <= 20),
  bags_fulfilled INTEGER DEFAULT 0 CHECK (bags_fulfilled >= 0),
  hospital_name VARCHAR(200) NOT NULL,
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  upazila VARCHAR(50),
  ward_number VARCHAR(50),
  bed_number VARCHAR(50),
  contact_phone VARCHAR(25) NOT NULL,
  urgency VARCHAR(20) DEFAULT 'now' CHECK (urgency IN ('now', 'today', 'scheduled')),
  time_target VARCHAR(100) DEFAULT 'এখনই প্রয়োজন',
  reason TEXT,
  prescription_image_url TEXT,
  has_verified_hospital BOOLEAN DEFAULT true,
  status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'open', 'partially_fulfilled', 'fulfilled', 'cancelled', 'expired')),
  tracking_step INTEGER DEFAULT 1 CHECK (tracking_step BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ১.৪ Donor Responses Table
CREATE TABLE IF NOT EXISTS public.donor_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.emergency_requests(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  eta_minutes INTEGER DEFAULT 30 CHECK (eta_minutes > 0),
  transport_mode VARCHAR(30) DEFAULT 'motorcycle',
  status VARCHAR(30) DEFAULT 'accepted' CHECK (status IN ('accepted', 'on_the_way', 'confirmed', 'declined', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_request_donor_response UNIQUE(request_id, donor_id)
);

-- ১.৫ Hospitals & Blood Banks Table
CREATE TABLE IF NOT EXISTS public.hospitals_and_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(30) DEFAULT 'medical_college' CHECK (type IN ('medical_college', 'district_hospital', 'upazila_health_complex', 'red_crescent', 'private_clinic', 'blood_bank')),
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  hotline VARCHAR(25) NOT NULL,
  operating_hours VARCHAR(50) DEFAULT '২৪/৭ খোলা',
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ১.৬ Blood Inventory Table (নেতিবাচক সংখ্যা প্রতিরোধ)
CREATE TABLE IF NOT EXISTS public.blood_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals_and_banks(id) ON DELETE CASCADE NOT NULL,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  units_available INTEGER DEFAULT 0 CHECK (units_available >= 0),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'low', 'critical', 'empty', 'sufficient', 'limited')),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_hospital_blood_group UNIQUE(hospital_id, blood_group)
);

-- ১.৭ Blood Inventory Logs (স্টক অডিট হিস্ট্রি)
CREATE TABLE IF NOT EXISTS public.blood_inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals_and_banks(id) ON DELETE CASCADE NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  previous_units INTEGER NOT NULL DEFAULT 0,
  new_units INTEGER NOT NULL DEFAULT 0 CHECK (new_units >= 0),
  delta INTEGER NOT NULL DEFAULT 0,
  action_type VARCHAR(30) DEFAULT 'manual_adjustment',
  reason VARCHAR(255),
  operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  operator_name VARCHAR(120),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ১.৮ Ambulances Directory Table
CREATE TABLE IF NOT EXISTS public.ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_name VARCHAR(100) NOT NULL,
  service_type VARCHAR(100) DEFAULT 'জরুরি অ্যাম্বুলেন্স সেবা',
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  location_base VARCHAR(150) NOT NULL,
  phone_number VARCHAR(25) NOT NULL,
  ambulance_type VARCHAR(30) DEFAULT 'Normal' CHECK (ambulance_type IN ('ICU', 'Normal', 'Freezing', 'AC')),
  is_available_24_7 BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ১.৯ Donation Camps & RSVPs
CREATE TABLE IF NOT EXISTS public.donation_camps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer VARCHAR(150) NOT NULL,
  venue VARCHAR(200) NOT NULL,
  division VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  camp_date DATE NOT NULL,
  date_day VARCHAR(10) DEFAULT '২৪',
  date_month VARCHAR(20) DEFAULT 'অক্টোবর',
  time_slot VARCHAR(50) DEFAULT 'সকাল ৯টা - বিকাল ৪টা',
  target_units INTEGER DEFAULT 100,
  registered_count INTEGER DEFAULT 0 CHECK (registered_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaign_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id UUID REFERENCES public.donation_camps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_camp_user_rsvp UNIQUE(camp_id, user_id)
);

-- ১.১০ Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(20) DEFAULT 'urgent' CHECK (category IN ('urgent', 'my-req', 'camps', 'health', 'system', 'camp', 'badge')),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  is_unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ১.১১ Chat Messages Table (নিরাপদ অভ্যন্তরীণ যোগাযোগ)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ১.১২ Reports Table (অ্যান্টি-ফ্রড ও প্রতারণা রিপোর্ট)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.emergency_requests(id) ON DELETE SET NULL,
  reason VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed', 'reviewing')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ১.১৩ Bookmarks & Push Subscriptions
CREATE TABLE IF NOT EXISTS public.donor_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_donor_bookmark UNIQUE(user_id, donor_id)
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ২. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals_and_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ক) Profiles & Donor Profiles
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "donor_profiles_select_public" ON public.donor_profiles;
CREATE POLICY "donor_profiles_select_public" ON public.donor_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "donor_profiles_insert_own" ON public.donor_profiles;
CREATE POLICY "donor_profiles_insert_own" ON public.donor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "donor_profiles_update_own" ON public.donor_profiles;
CREATE POLICY "donor_profiles_update_own" ON public.donor_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- খ) Emergency Requests
DROP POLICY IF EXISTS "reqs_select_public" ON public.emergency_requests;
CREATE POLICY "reqs_select_public" ON public.emergency_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "reqs_insert_auth" ON public.emergency_requests;
CREATE POLICY "reqs_insert_auth" ON public.emergency_requests FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "reqs_update_own" ON public.emergency_requests;
CREATE POLICY "reqs_update_own" ON public.emergency_requests FOR UPDATE TO authenticated 
  USING (auth.uid() = requester_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'hospital_operator')));

-- গ) Donor Responses
DROP POLICY IF EXISTS "responses_select_all" ON public.donor_responses;
CREATE POLICY "responses_select_all" ON public.donor_responses FOR SELECT USING (true);

DROP POLICY IF EXISTS "responses_insert_auth" ON public.donor_responses;
CREATE POLICY "responses_insert_auth" ON public.donor_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);

DROP POLICY IF EXISTS "responses_update_own" ON public.donor_responses;
CREATE POLICY "responses_update_own" ON public.donor_responses FOR UPDATE TO authenticated 
  USING (auth.uid() = donor_id OR EXISTS (SELECT 1 FROM public.emergency_requests WHERE id = donor_responses.request_id AND requester_id = auth.uid()));

-- ঘ) Blood Inventory & Logs
DROP POLICY IF EXISTS "inventory_select_all" ON public.blood_inventory;
CREATE POLICY "inventory_select_all" ON public.blood_inventory FOR SELECT USING (true);

DROP POLICY IF EXISTS "inventory_operator_update" ON public.blood_inventory;
CREATE POLICY "inventory_operator_update" ON public.blood_inventory FOR UPDATE TO authenticated 
  WITH CHECK (units_available >= 0);

DROP POLICY IF EXISTS "inventory_operator_insert" ON public.blood_inventory;
CREATE POLICY "inventory_operator_insert" ON public.blood_inventory FOR INSERT TO authenticated 
  WITH CHECK (units_available >= 0);

DROP POLICY IF EXISTS "inventory_logs_select_all" ON public.blood_inventory_logs;
CREATE POLICY "inventory_logs_select_all" ON public.blood_inventory_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "inventory_logs_insert_auth" ON public.blood_inventory_logs;
CREATE POLICY "inventory_logs_insert_auth" ON public.blood_inventory_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ঙ) Hospitals & Ambulances
DROP POLICY IF EXISTS "hospitals_select_all" ON public.hospitals_and_banks;
CREATE POLICY "hospitals_select_all" ON public.hospitals_and_banks FOR SELECT USING (true);

DROP POLICY IF EXISTS "ambulances_select_all" ON public.ambulances;
CREATE POLICY "ambulances_select_all" ON public.ambulances FOR SELECT USING (true);

DROP POLICY IF EXISTS "camps_select_all" ON public.donation_camps;
CREATE POLICY "camps_select_all" ON public.donation_camps FOR SELECT USING (true);

-- চ) Notifications & Chat
DROP POLICY IF EXISTS "notifs_select_own" ON public.notifications;
CREATE POLICY "notifs_select_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_select_own" ON public.chat_messages;
CREATE POLICY "chat_select_own" ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "chat_insert_own" ON public.chat_messages;
CREATE POLICY "chat_insert_own" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- =========================================================================
-- ৩. STORAGE BUCKETS CONFIGURATION (Security Hardened)
-- =========================================================================

-- ৩.১ prescriptions Bucket (PRIVATE - কোনো সরাসরি পাবলিক লিঙ্ক নেই)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prescriptions', 'prescriptions', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ৩.২ avatars Bucket (PUBLIC)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies:
DROP POLICY IF EXISTS "Prescriptions upload policy" ON storage.objects;
CREATE POLICY "Prescriptions upload policy" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'prescriptions');

DROP POLICY IF EXISTS "Prescriptions private read policy" ON storage.objects;
CREATE POLICY "Prescriptions private read policy" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'prescriptions');

DROP POLICY IF EXISTS "Avatars public read policy" ON storage.objects;
CREATE POLICY "Avatars public read policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars upload policy" ON storage.objects;
CREATE POLICY "Avatars upload policy" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- =========================================================================
-- ৪. REALTIME REPLICATION PUBLICATION
-- =========================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_inventory;

-- =========================================================================
-- ৫. SYNTHETIC TEST SEED DATA (100% কৃত্রিম ডেটা - কোনো আসল রোগীর তথ্য নেই)
-- =========================================================================

-- ৫.১ পরীক্ষামূলক হাসপাতাল
INSERT INTO public.hospitals_and_banks (id, name, type, division, district, address, hotline, operating_hours)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল (স্টেজ টেস্ট)', 'medical_college', 'রাজশাহী', 'বগুড়া', 'সিলিমপুর, বগুড়া সদর', '০৫১-৫৮০৭৫', '২৪/৭ খোলা'),
  ('b0000001-0000-0000-0000-000000000002', 'রেড ক্রিসেন্ট ব্লাড সেন্টার (স্টেজ টেস্ট)', 'red_crescent', 'রাজশাহী', 'বগুড়া', 'বগুড়া সদর', '০১৭২০-১২৩৪৫৬', 'সকাল ৮টা - রাত ১০টা'),
  ('b0000001-0000-0000-0000-000000000003', 'ঢাকা মেডিকেল কলেজ হাসপাতাল (স্টেজ টেস্ট)', 'medical_college', 'ঢাকা', 'ঢাকা', 'বকশীবাজার, ঢাকা', '০২-৫৫১৬৫০', '২৪/৭ খোলা')
ON CONFLICT (id) DO NOTHING;

-- ৫.২ পরীক্ষামূলক ৮ গ্রুপের ব্লাড ইনভেন্টরি
INSERT INTO public.blood_inventory (hospital_id, blood_group, units_available, status)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'A+', 8, 'available'),
  ('b0000001-0000-0000-0000-000000000001', 'A-', 1, 'critical'),
  ('b0000001-0000-0000-0000-000000000001', 'B+', 15, 'available'),
  ('b0000001-0000-0000-0000-000000000001', 'B-', 3, 'low'),
  ('b0000001-0000-0000-0000-000000000001', 'O+', 10, 'available'),
  ('b0000001-0000-0000-0000-000000000001', 'O-', 2, 'critical'),
  ('b0000001-0000-0000-0000-000000000001', 'AB+', 5, 'available'),
  ('b0000001-0000-0000-0000-000000000001', 'AB-', 0, 'empty')
ON CONFLICT (hospital_id, blood_group) DO UPDATE 
SET units_available = EXCLUDED.units_available, status = EXCLUDED.status;

-- ৫.৩ কৃত্রিম অ্যাম্বুলেন্স সেবা
INSERT INTO public.ambulances (driver_name, service_type, division, district, location_base, phone_number, ambulance_type, is_available_24_7)
VALUES
  ('টেস্ট ড্রাইভার ১ (আল-আমিন)', 'জরুরি আইসিইউ অ্যাম্বুলেন্স', 'রাজশাহী', 'বগুড়া', 'শজিমেক হাসপাতাল স্ট্যান্ড', '০১৭০০-০০০০০১', 'ICU', true),
  ('টেস্ট ড্রাইভার ২ (করিম মিয়া)', 'এসি জরুরি রোগী পরিবহন', 'রাজশাহী', 'বগুড়া', 'মোহাম্মদ আলী হাসপাতাল গেট', '০১৭০০-০০০০০২', 'AC', true),
  ('টেস্ট ড্রাইভার ৩ (রহিম উল্লাহ)', 'নরমাল জরুরি সার্ভিস', 'ঢাকা', 'ঢাকা', 'ঢামেক জরুরি গেট', '০১৭০০-০০০০০৩', 'Normal', true);

-- ৫.৪ কৃত্রিম রক্তদান ক্যাম্প
INSERT INTO public.donation_camps (organizer, venue, division, district, camp_date, date_day, date_month, time_slot, target_units, registered_count)
VALUES
  ('যুব রক্তদান ফাউন্ডেশন (স্টেজ টেস্ট)', 'বগুড়া জিলা স্কুল প্রাঙ্গণ', 'রাজশাহী', 'বগুড়া', '2026-11-15', '১৫', 'নভেম্বর', 'সকাল ৯টা - বিকাল ৪টা', 120, 35);
