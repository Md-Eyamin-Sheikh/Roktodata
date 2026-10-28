-- =========================================================================
-- রক্তদাতা (Roktodata) — Production Database & Strict RLS Hardening (ধাপ ২)
-- Migration: 20261028_step2_database_and_rls_hardening.sql
-- Architect: 20-30 Years Veteran Database & Security Architect
--
-- পলিসি-ম্যাট্রিক্স ও ১২টি টেস্ট কেস এনফোর্সমেন্ট:
-- ১. anon -> profiles, donor_profiles, chat_messages, reports, push_subscriptions -> ব্লক
-- ২. anon -> emergency_requests -> ফোন, রোগীর নাম, প্রেসক্রিপশন ছাড়া সীমিত ভিউ
-- ৩. ইউজার A -> নিজের profiles.role = 'admin' করা -> ব্লক
-- ৪. ইউজার A -> ইউজার B-র profile বা request UPDATE/DELETE -> ব্লক
-- ৫. ইউজার A -> donor_responses-এ donor_id = B বসিয়ে insert (spoof) -> ব্লক
-- ৬. ইউজার A -> B ও C-র chat পড়া বা Realtime-এ subscribe -> ব্লক
-- ৭. ইউজার A -> blood_inventory UPDATE -> ব্লক
-- ৮. hospital_operator -> অন্য হাসপাতালের inventory UPDATE -> ব্লক
-- ৯. ইউজার A -> অন্যের reports ও admin_notes পড়া -> ব্লক
-- ১০. ইউজার A -> B-র প্রেসক্রিপশন ছবির URL খোলা -> ব্লক
-- ১১. ইউজার A -> নিজের reward_points, total_donations, is_verified বাড়ানো -> ব্লক
-- ১২. ইউজার A -> অন্যের requester_id বসিয়ে অনুরোধ insert -> ব্লক
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- ১. ডেটা স্যানিটাইজেশন (Data Cleansing)
-- =========================================================================
DO $$
BEGIN
  UPDATE public.profiles
  SET phone_number = translate(
    regexp_replace(phone_number, '[^0-9০-৯]', '', 'g'),
    '০১২৩৪৫৬৭৮৯',
    '0123456789'
  )
  WHERE phone_number IS NOT NULL AND phone_number !~ '^01[3-9][0-9]{8}$';

  UPDATE public.emergency_requests
  SET contact_phone = translate(
    regexp_replace(contact_phone, '[^0-9০-৯]', '', 'g'),
    '০১২৩৪৫৬৭৮৯',
    '0123456789'
  )
  WHERE contact_phone IS NOT NULL AND contact_phone !~ '^01[3-9][0-9]{8}$';

  UPDATE public.emergency_requests
  SET contact_phone = '01700000000'
  WHERE contact_phone IS NOT NULL AND contact_phone !~ '^01[3-9][0-9]{8}$';

  UPDATE public.ambulances
  SET phone_number = translate(
    regexp_replace(phone_number, '[^0-9০-৯]', '', 'g'),
    '০১২৩৪৫৬৭৮৯',
    '0123456789'
  )
  WHERE phone_number IS NOT NULL AND phone_number !~ '^01[3-9][0-9]{8}$';

  UPDATE public.ambulances
  SET phone_number = '01711000000'
  WHERE phone_number IS NOT NULL AND phone_number !~ '^01[3-9][0-9]{8}$';
END $$;

-- =========================================================================
-- ২. টেবিল স্ট্রাকচার ও কনস্ট্রেইন্ট স্তর (Database Constraints)
-- =========================================================================
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'donor',
  ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES public.hospitals_and_banks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_phone_regex;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_phone_regex 
  CHECK (phone_number ~ '^01[3-9][0-9]{8}$');

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_blood_group;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_blood_group 
  CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_role;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_role 
  CHECK (role IN ('user', 'donor', 'recipient', 'hospital_operator', 'admin', 'volunteer'));

-- emergency_requests
ALTER TABLE IF EXISTS public.emergency_requests
  ADD COLUMN IF NOT EXISTS bags_fulfilled INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.emergency_requests DROP CONSTRAINT IF EXISTS chk_emergency_bags_needed;
ALTER TABLE public.emergency_requests ADD CONSTRAINT chk_emergency_bags_needed 
  CHECK (bags_needed > 0 AND bags_needed <= 50);

ALTER TABLE public.emergency_requests DROP CONSTRAINT IF EXISTS chk_emergency_bags_fulfilled;
ALTER TABLE public.emergency_requests ADD CONSTRAINT chk_emergency_bags_fulfilled 
  CHECK (bags_fulfilled >= 0 AND bags_fulfilled <= bags_needed);

ALTER TABLE public.emergency_requests DROP CONSTRAINT IF EXISTS chk_emergency_phone_regex;
ALTER TABLE public.emergency_requests ADD CONSTRAINT chk_emergency_phone_regex 
  CHECK (contact_phone ~ '^01[3-9][0-9]{8}$');

ALTER TABLE public.emergency_requests DROP CONSTRAINT IF EXISTS chk_emergency_blood_group;
ALTER TABLE public.emergency_requests ADD CONSTRAINT chk_emergency_blood_group 
  CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'));

ALTER TABLE public.emergency_requests DROP CONSTRAINT IF EXISTS chk_emergency_status;
ALTER TABLE public.emergency_requests ADD CONSTRAINT chk_emergency_status 
  CHECK (status IN ('active', 'in_progress', 'matched', 'completed', 'fulfilled', 'cancelled'));

-- donor_responses
ALTER TABLE IF EXISTS public.donor_responses
  ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(30) DEFAULT 'motorcycle',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.donor_responses DROP CONSTRAINT IF EXISTS uq_request_donor;
ALTER TABLE public.donor_responses ADD CONSTRAINT uq_request_donor 
  UNIQUE(request_id, donor_id);

ALTER TABLE public.donor_responses DROP CONSTRAINT IF EXISTS chk_responses_eta;
ALTER TABLE public.donor_responses ADD CONSTRAINT chk_responses_eta 
  CHECK (eta_minutes >= 0);

ALTER TABLE public.donor_responses DROP CONSTRAINT IF EXISTS chk_responses_status;
ALTER TABLE public.donor_responses ADD CONSTRAINT chk_responses_status 
  CHECK (status IN ('pending', 'accepted', 'on_the_way', 'arrived', 'confirmed', 'completed', 'declined', 'cancelled'));

-- blood_inventory
ALTER TABLE IF EXISTS public.blood_inventory
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.blood_inventory DROP CONSTRAINT IF EXISTS uq_hospital_blood_group;
ALTER TABLE public.blood_inventory ADD CONSTRAINT uq_hospital_blood_group 
  UNIQUE(hospital_id, blood_group);

ALTER TABLE public.blood_inventory DROP CONSTRAINT IF EXISTS chk_inventory_units_positive;
ALTER TABLE public.blood_inventory ADD CONSTRAINT chk_inventory_units_positive 
  CHECK (units_available >= 0);

ALTER TABLE public.blood_inventory DROP CONSTRAINT IF EXISTS chk_inventory_blood_group;
ALTER TABLE public.blood_inventory ADD CONSTRAINT chk_inventory_blood_group 
  CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'));

-- ambulances
ALTER TABLE public.ambulances DROP CONSTRAINT IF EXISTS chk_ambulances_phone_regex;
ALTER TABLE public.ambulances ADD CONSTRAINT chk_ambulances_phone_regex 
  CHECK (phone_number ~ '^01[3-9][0-9]{8}$');

-- donation_history
ALTER TABLE public.donation_history DROP CONSTRAINT IF EXISTS chk_history_units;
ALTER TABLE public.donation_history ADD CONSTRAINT chk_history_units 
  CHECK (units_donated > 0);

ALTER TABLE public.donation_history DROP CONSTRAINT IF EXISTS chk_history_blood_group;
ALTER TABLE public.donation_history ADD CONSTRAINT chk_history_blood_group 
  CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'));

-- chat_messages
ALTER TABLE IF EXISTS public.chat_messages
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- donor_bookmarks, campaign_rsvps, push_subscriptions
CREATE TABLE IF NOT EXISTS public.donor_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.donor_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_donor_bookmark UNIQUE(user_id, donor_id)
);

CREATE TABLE IF NOT EXISTS public.campaign_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id UUID REFERENCES public.donation_camps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'attending' CHECK (status IN ('attending', 'cancelled', 'attended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_camp_user_rsvp UNIQUE(camp_id, user_id)
);

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

-- =========================================================================
-- ৩. হাই-পারফরম্যান্স ইনডেক্সিং (Performance & Matching Indexes)
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_requests_district ON public.emergency_requests(district);
CREATE INDEX IF NOT EXISTS idx_requests_blood_group ON public.emergency_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_expires_at ON public.emergency_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.emergency_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_requester_id ON public.emergency_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_live_matching 
  ON public.emergency_requests(district, blood_group, status, expires_at);

CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_blood_group ON public.profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_donor_available_eligible 
  ON public.donor_profiles(is_available, next_eligible_date);
CREATE INDEX IF NOT EXISTS idx_donor_user_id ON public.donor_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_responses_request_donor ON public.donor_responses(request_id, donor_id);
CREATE INDEX IF NOT EXISTS idx_responses_status ON public.donor_responses(status);

CREATE INDEX IF NOT EXISTS idx_inventory_hospital_group ON public.blood_inventory(hospital_id, blood_group);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_unread);
CREATE INDEX IF NOT EXISTS idx_chat_participants ON public.chat_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);

-- =========================================================================
-- ৪. হেল্পার, ট্রিগার ও RPC ফাংশনসমূহ (SET search_path = '')
-- =========================================================================

-- ৪.১ updated_at হ্যান্ডলার
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;

-- ৪.২ অ্যাডমিন রোল যাচাইকারী
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- ৪.৩ হাসপাতাল অপারেটর যাচাইকারী
CREATE OR REPLACE FUNCTION public.is_hospital_operator()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'hospital_operator' OR role = 'admin')
  );
$$;
REVOKE ALL ON FUNCTION public.is_hospital_operator() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_hospital_operator() TO authenticated, service_role;

-- ৪.৪ profiles প্রিভিলেজ এস্কেলেশন সুরক্ষা (role ও is_verified লক)
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Privilege Escalation Rejected: Only administrators can modify roles.';
    END IF;
  END IF;

  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified AND NEW.is_verified = TRUE THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized Modification: Self-verification is not permitted.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_profile_role() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- ৪.৫ donor_profiles ম্যাট্রিক্স সুরক্ষা (total_donations ও reward_points লক)
CREATE OR REPLACE FUNCTION public.protect_donor_profile_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.total_donations IS DISTINCT FROM OLD.total_donations THEN
    IF NOT (public.is_admin() OR pg_catalog.current_setting('roktodata.internal_sync', true) = 'on') THEN
      NEW.total_donations := OLD.total_donations;
    END IF;
  END IF;

  IF NEW.reward_points IS DISTINCT FROM OLD.reward_points THEN
    IF NOT (public.is_admin() OR pg_catalog.current_setting('roktodata.internal_sync', true) = 'on') THEN
      NEW.reward_points := OLD.reward_points;
    END IF;
  END IF;

  IF NEW.national_id_verified IS DISTINCT FROM OLD.national_id_verified AND NEW.national_id_verified = TRUE THEN
    IF NOT public.is_admin() THEN
      NEW.national_id_verified := OLD.national_id_verified;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_donor_profile_metrics() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_donor_profile_metrics ON public.donor_profiles;
CREATE TRIGGER trg_protect_donor_profile_metrics
  BEFORE UPDATE ON public.donor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_donor_profile_metrics();

-- ৪.৬ ফোন মাস্কিং ইউটিলিটি
CREATE OR REPLACE FUNCTION public.mask_phone(phone_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  clean_digits TEXT;
BEGIN
  IF phone_text IS NULL OR pg_catalog.length(phone_text) < 8 THEN
    RETURN '01XXX-XXXXXX';
  END IF;

  clean_digits := pg_catalog.regexp_replace(phone_text, '[^0-9]', '', 'g');
  IF pg_catalog.length(clean_digits) >= 11 THEN
    RETURN pg_catalog.substr(clean_digits, 1, 5) || '-XXX' || pg_catalog.substr(clean_digits, pg_catalog.length(clean_digits) - 2);
  ELSE
    RETURN pg_catalog.substr(clean_digits, 1, 3) || '-XXX-XXX';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.mask_phone(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mask_phone(TEXT) TO anon, authenticated, service_role;

-- ৪.৭ অনুমোদিত ডোনার নম্বর প্রকাশকারী RPC
CREATE OR REPLACE FUNCTION public.reveal_donor_contact(
  target_donor_id UUID,
  request_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  phone_number TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller_id UUID;
  donor_phone TEXT;
  is_authorized_match BOOLEAN := FALSE;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, 'অননুমোদিত: লগইন করা আবশ্যক।'::TEXT;
    RETURN;
  END IF;

  IF caller_id = target_donor_id OR public.is_admin() THEN
    SELECT p.phone_number INTO donor_phone FROM public.profiles p WHERE p.id = target_donor_id;
    RETURN QUERY SELECT TRUE, donor_phone, 'অনুমোদিত'::TEXT;
    RETURN;
  END IF;

  IF request_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.emergency_requests er
      WHERE er.id = request_id AND er.requester_id = caller_id AND er.status IN ('active', 'in_progress', 'matched')
    ) THEN
      is_authorized_match := TRUE;
    END IF;
  END IF;

  IF NOT is_authorized_match THEN
    IF EXISTS (
      SELECT 1 FROM public.donor_responses dr
      JOIN public.donor_profiles dp ON dp.id = dr.donor_id
      JOIN public.emergency_requests er ON er.id = dr.request_id
      WHERE dp.user_id = target_donor_id 
        AND er.requester_id = caller_id
    ) THEN
      is_authorized_match := TRUE;
    END IF;
  END IF;

  IF is_authorized_match THEN
    SELECT p.phone_number INTO donor_phone FROM public.profiles p WHERE p.id = target_donor_id;

    INSERT INTO public.reports (
      reporter_id,
      target_name,
      target_phone,
      reason,
      details,
      status
    )
    VALUES (
      caller_id,
      'Authorized Contact Reveal',
      public.mask_phone(donor_phone),
      'CONTACT_REVEAL_AUDIT',
      pg_catalog.json_build_object(
        'caller_id', caller_id,
        'target_donor_id', target_donor_id,
        'request_id', request_id,
        'timestamp', pg_catalog.now()
      )::TEXT,
      'resolved'
    );

    RETURN QUERY SELECT TRUE, donor_phone, 'অনুমোদিত চিকিৎসা ম্যাচ: নম্বর প্রদান করা হয়েছে।'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::TEXT, 'অননুমোদিত: গোপনীয়তা নীতি অনুযায়ী শুধুমাত্র সক্রিয় জরুরি রোগী ও যাচাইকৃত ম্যাচে যোগাযোগ প্রকাশ করা হয়।'::TEXT;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.reveal_donor_contact(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reveal_donor_contact(UUID, UUID) TO authenticated, service_role;

-- ৪.৮ রেস কন্ডিশন প্রটেকশন: হাসপাতাল স্টক কমানোর অ্যাটমিক RPC
CREATE OR REPLACE FUNCTION public.claim_blood_stock(
  p_hospital_id UUID,
  p_blood_group VARCHAR(5),
  p_units INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_units INTEGER;
  v_new_units INTEGER;
BEGIN
  IF p_units <= 0 THEN
    RETURN pg_catalog.json_build_object('success', false, 'message', 'Invalid units requested')::jsonb;
  END IF;

  SELECT units_available INTO v_current_units
  FROM public.blood_inventory
  WHERE hospital_id = p_hospital_id AND blood_group = p_blood_group
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN pg_catalog.json_build_object('success', false, 'message', 'Stock entry not found')::jsonb;
  END IF;

  IF v_current_units < p_units THEN
    RETURN pg_catalog.json_build_object(
      'success', false, 
      'message', 'Insufficient stock units', 
      'available', v_current_units
    )::jsonb;
  END IF;

  v_new_units := v_current_units - p_units;

  UPDATE public.blood_inventory
  SET 
    units_available = v_new_units,
    status = CASE 
      WHEN v_new_units = 0 THEN 'empty'
      WHEN v_new_units <= 3 THEN 'critical'
      WHEN v_new_units <= 5 THEN 'low'
      ELSE 'available'
    END,
    last_updated = pg_catalog.now(),
    updated_at = pg_catalog.now()
  WHERE hospital_id = p_hospital_id AND blood_group = p_blood_group;

  RETURN pg_catalog.json_build_object(
    'success', true, 
    'claimed_units', p_units, 
    'remaining_units', v_new_units
  )::jsonb;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_blood_stock(UUID, VARCHAR, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_blood_stock(UUID, VARCHAR, INTEGER) TO authenticated, service_role;

-- ৪.৯ রেস কন্ডিশন প্রটেকশন: জরুরি রক্তের ব্যাগ সম্পন্নকরণ অ্যাটমিক RPC
CREATE OR REPLACE FUNCTION public.fulfill_blood_request(
  p_request_id UUID,
  p_units INTEGER DEFAULT 1,
  p_donor_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_req RECORD;
  v_new_fulfilled INTEGER;
  v_new_status VARCHAR(20);
BEGIN
  IF p_units <= 0 THEN
    RETURN pg_catalog.json_build_object('success', false, 'message', 'Invalid units')::jsonb;
  END IF;

  SELECT * INTO v_req
  FROM public.emergency_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN pg_catalog.json_build_object('success', false, 'message', 'Request not found')::jsonb;
  END IF;

  IF v_req.status IN ('fulfilled', 'cancelled', 'completed') THEN
    RETURN pg_catalog.json_build_object(
      'success', false, 
      'message', 'Request is already finalized and cannot accept further fulfillments',
      'status', v_req.status
    )::jsonb;
  END IF;

  v_new_fulfilled := v_req.bags_fulfilled + p_units;
  IF v_new_fulfilled > v_req.bags_needed THEN
    RETURN pg_catalog.json_build_object(
      'success', false, 
      'message', 'Fulfillment exceeds total bags needed', 
      'needed', v_req.bags_needed, 
      'current', v_req.bags_fulfilled
    )::jsonb;
  END IF;

  v_new_status := CASE WHEN v_new_fulfilled >= v_req.bags_needed THEN 'fulfilled' ELSE 'in_progress' END;

  UPDATE public.emergency_requests
  SET 
    bags_fulfilled = v_new_fulfilled,
    status = v_new_status,
    tracking_step = CASE WHEN v_new_fulfilled >= v_req.bags_needed THEN 5 ELSE 3 END,
    updated_at = pg_catalog.now()
  WHERE id = p_request_id;

  RETURN pg_catalog.json_build_object(
    'success', true,
    'bags_fulfilled', v_new_fulfilled,
    'bags_needed', v_req.bags_needed,
    'status', v_new_status
  )::jsonb;
END;
$$;
REVOKE ALL ON FUNCTION public.fulfill_blood_request(UUID, INTEGER, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fulfill_blood_request(UUID, INTEGER, UUID) TO authenticated, service_role;

-- =========================================================================
-- ৫. ভিউসমূহ: WITH (security_invoker = true)
-- =========================================================================

CREATE OR REPLACE VIEW public.district_live_metrics
WITH (security_invoker = true)
AS
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

CREATE OR REPLACE VIEW public.donation_records
WITH (security_invoker = true)
AS
SELECT * FROM public.donation_history;

CREATE OR REPLACE VIEW public.public_emergency_requests
WITH (security_invoker = true)
AS
SELECT 
  er.id,
  er.blood_group,
  er.bags_needed,
  er.bags_fulfilled,
  er.component_type,
  er.hospital_name,
  er.division,
  er.district,
  er.upazila,
  er.location_detail,
  er.urgency,
  er.time_target,
  er.reason,
  er.status,
  er.expires_at,
  er.created_at,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN er.patient_name
    ELSE '*** গোপনীয় ***'
  END AS patient_name,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN er.contact_phone
    ELSE public.mask_phone(er.contact_phone)
  END AS contact_phone,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN er.prescription_image_url
    ELSE NULL
  END AS prescription_image_url
FROM public.emergency_requests er;

CREATE OR REPLACE VIEW public.public_donors_view
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.full_name,
  p.blood_group,
  p.division,
  p.district,
  p.upazila,
  p.is_verified,
  p.created_at,
  dp.is_available,
  dp.total_donations,
  dp.last_donation_date,
  dp.is_fast_responder,
  dp.privacy_hide_phone,
  public.mask_phone(p.phone_number) AS phone_masked,
  CASE 
    WHEN (SELECT auth.uid()) = p.id OR public.is_admin() THEN p.phone_number
    ELSE public.mask_phone(p.phone_number)
  END AS phone_display
FROM public.profiles p
LEFT JOIN public.donor_profiles dp ON dp.user_id = p.id
WHERE dp.is_available IS TRUE OR dp.is_available IS NULL;

-- =========================================================================
-- ৬. ১৬টি টেবিলেই RLS সক্রিয়করণ ও পলিসি-ম্যাট্রিক্স
-- =========================================================================
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
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ১. PROFILES (anon ব্লকড)
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id OR public.is_admin())
  WITH CHECK (
    ((SELECT auth.uid()) = id 
     AND role = (SELECT p.role FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
     AND is_verified = (SELECT p.is_verified FROM public.profiles p WHERE p.id = (SELECT auth.uid())))
    OR public.is_admin()
  );

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = id OR public.is_admin());

-- ২. DONOR_PROFILES (anon ব্লকড, total_donations ও reward_points লকড)
CREATE POLICY "donor_profiles_select_authenticated" ON public.donor_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "donor_profiles_insert_own" ON public.donor_profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "donor_profiles_update_own" ON public.donor_profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin())
  WITH CHECK (
    ((SELECT auth.uid()) = user_id
     AND total_donations = (SELECT dp.total_donations FROM public.donor_profiles dp WHERE dp.user_id = (SELECT auth.uid()))
     AND reward_points = (SELECT dp.reward_points FROM public.donor_profiles dp WHERE dp.user_id = (SELECT auth.uid()))
    )
    OR public.is_admin()
  );

CREATE POLICY "donor_profiles_delete_own" ON public.donor_profiles
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id OR public.is_admin());

-- ৩. EMERGENCY_REQUESTS (anon ফোন/নাম ছাড়া সীমিত কলাম ভিউ, অন্যের রিকোয়েস্ট আপডেট ব্লকড)
CREATE POLICY "requests_select_active" ON public.emergency_requests
  FOR SELECT
  USING (
    status != 'cancelled' OR requester_id = (SELECT auth.uid()) OR public.is_admin()
  );

CREATE POLICY "requests_insert_auth" ON public.emergency_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    requester_id = (SELECT auth.uid()) 
    OR public.is_admin()
  );

CREATE POLICY "requests_update_own" ON public.emergency_requests
  FOR UPDATE TO authenticated
  USING (requester_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (requester_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "requests_delete_own" ON public.emergency_requests
  FOR DELETE TO authenticated USING (requester_id = (SELECT auth.uid()) OR public.is_admin());

REVOKE SELECT (contact_phone, patient_name, prescription_image_url) ON public.emergency_requests FROM anon;
GRANT SELECT (id, blood_group, bags_needed, bags_fulfilled, component_type, hospital_name, division, district, upazila, location_detail, ward_number, bed_number, urgency, time_target, reason, status, has_verified_hospital, expires_at, created_at, updated_at) ON public.emergency_requests TO anon;
GRANT SELECT ON public.emergency_requests TO authenticated, service_role;

-- ৪. DONOR_RESPONSES (spoofিং ব্লকড)
CREATE POLICY "responses_select_involved" ON public.donor_responses
  FOR SELECT TO authenticated
  USING (
    donor_id IN (SELECT dp.id FROM public.donor_profiles dp WHERE dp.user_id = (SELECT auth.uid()))
    OR request_id IN (SELECT er.id FROM public.emergency_requests er WHERE er.requester_id = (SELECT auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "responses_insert_donor" ON public.donor_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    donor_id IN (SELECT dp.id FROM public.donor_profiles dp WHERE dp.user_id = (SELECT auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "responses_update_involved" ON public.donor_responses
  FOR UPDATE TO authenticated
  USING (
    donor_id IN (SELECT dp.id FROM public.donor_profiles dp WHERE dp.user_id = (SELECT auth.uid()))
    OR request_id IN (SELECT er.id FROM public.emergency_requests er WHERE er.requester_id = (SELECT auth.uid()))
    OR public.is_admin()
  )
  WITH CHECK (
    donor_id IN (SELECT dp.id FROM public.donor_profiles dp WHERE dp.user_id = (SELECT auth.uid()))
    OR request_id IN (SELECT er.id FROM public.emergency_requests er WHERE er.requester_id = (SELECT auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "responses_delete_own" ON public.donor_responses
  FOR DELETE TO authenticated
  USING (
    donor_id IN (SELECT dp.id FROM public.donor_profiles dp WHERE dp.user_id = (SELECT auth.uid()))
    OR public.is_admin()
  );

-- ৫. BLOOD_INVENTORY (অপারেটর শুধুমাত্র নিজের হাসপাতাল বদলাতে পারবে)
CREATE POLICY "inventory_select_all" ON public.blood_inventory
  FOR SELECT USING (true);

CREATE POLICY "inventory_modify_operator" ON public.blood_inventory
  FOR ALL TO authenticated
  USING (
    public.is_admin() 
    OR (
      public.is_hospital_operator() 
      AND hospital_id = (SELECT p.hospital_id FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
    )
  )
  WITH CHECK (
    public.is_admin() 
    OR (
      public.is_hospital_operator() 
      AND hospital_id = (SELECT p.hospital_id FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
    )
  );

-- ৬. CHAT_MESSAGES (তৃতীয় পক্ষ স্নুপিং ব্লকড)
CREATE POLICY "chat_select_participants" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    sender_id = (SELECT auth.uid()) 
    OR receiver_id = (SELECT auth.uid()) 
    OR public.is_admin()
  );

CREATE POLICY "chat_insert_sender" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
  );

CREATE POLICY "chat_update_receiver_read" ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (receiver_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (receiver_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "chat_delete_sender" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (sender_id = (SELECT auth.uid()) OR public.is_admin());

-- ৭. REPORTS (অন্যের রিপোর্ট ও admin_notes রিড ব্লকড)
CREATE POLICY "reports_select_owner_admin" ON public.reports
  FOR SELECT TO authenticated
  USING (
    reporter_id = (SELECT auth.uid()) OR public.is_admin()
  );

CREATE POLICY "reports_insert_authenticated" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (
    reporter_id = (SELECT auth.uid()) OR reporter_id IS NULL OR public.is_admin()
  );

CREATE POLICY "reports_admin_manage" ON public.reports
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ৮. PUSH_SUBSCRIPTIONS (anon ব্লকড)
CREATE POLICY "push_select_own" ON public.push_subscriptions
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR public.is_admin()
  );

CREATE POLICY "push_insert_own" ON public.push_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
  );

CREATE POLICY "push_update_own" ON public.push_subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "push_delete_own" ON public.push_subscriptions
  FOR DELETE TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR public.is_admin()
  );

-- ৯. অন্যান্য টেবিল পলিসি
CREATE POLICY "bookmarks_select_own" ON public.donor_bookmarks FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "bookmarks_insert_own" ON public.donor_bookmarks FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "bookmarks_delete_own" ON public.donor_bookmarks FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "rsvps_select_own" ON public.campaign_rsvps FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "rsvps_insert_own" ON public.campaign_rsvps FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "rsvps_update_own" ON public.campaign_rsvps FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()) OR public.is_admin()) WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "rsvps_delete_own" ON public.campaign_rsvps FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "hospitals_select_all" ON public.hospitals_and_banks FOR SELECT USING (true);
CREATE POLICY "ambulances_select_all" ON public.ambulances FOR SELECT USING (true);
CREATE POLICY "camps_select_all" ON public.donation_camps FOR SELECT USING (true);
CREATE POLICY "districts_select_all" ON public.districts FOR SELECT USING (true);
CREATE POLICY "history_select_all" ON public.donation_history FOR SELECT USING (true);

CREATE POLICY "hospitals_admin_manage" ON public.hospitals_and_banks FOR ALL USING (public.is_admin() OR public.is_hospital_operator());
CREATE POLICY "ambulances_admin_manage" ON public.ambulances FOR ALL USING (public.is_admin());
CREATE POLICY "camps_admin_manage" ON public.donation_camps FOR ALL USING (public.is_admin());
CREATE POLICY "districts_admin_manage" ON public.districts FOR ALL USING (public.is_admin());

CREATE POLICY "history_insert_verified" ON public.donation_history FOR INSERT TO authenticated WITH CHECK (donor_id IN (SELECT dp.id FROM public.donor_profiles dp WHERE dp.user_id = (SELECT auth.uid())) OR public.is_hospital_operator() OR public.is_admin());
CREATE POLICY "history_admin_manage" ON public.donation_history FOR ALL USING (public.is_admin());

-- =========================================================================
-- ৭. STORAGE বাকেট ও অবজেক্ট পলিসি (প্রেসক্রিপশন ইউজার B-র ফাইলে ইউজার A ব্লকড)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('prescriptions', 'prescriptions', false, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']),
  ('avatars', 'avatars', false, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "prescriptions_upload_own" ON storage.objects;
CREATE POLICY "prescriptions_upload_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'prescriptions' AND ((storage.foldername(name))[1] = (SELECT auth.uid())::text OR public.is_admin()));

DROP POLICY IF EXISTS "prescriptions_read_own_or_operator" ON storage.objects;
CREATE POLICY "prescriptions_read_own_or_operator" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'prescriptions' AND ((storage.foldername(name))[1] = (SELECT auth.uid())::text OR public.is_hospital_operator() OR public.is_admin()));

DROP POLICY IF EXISTS "prescriptions_delete_own" ON storage.objects;
CREATE POLICY "prescriptions_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'prescriptions' AND ((storage.foldername(name))[1] = (SELECT auth.uid())::text OR public.is_admin()));

DROP POLICY IF EXISTS "avatars_upload_own" ON storage.objects;
CREATE POLICY "avatars_upload_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND ((storage.foldername(name))[1] = (SELECT auth.uid())::text OR public.is_admin()));

DROP POLICY IF EXISTS "avatars_read_authenticated" ON storage.objects;
CREATE POLICY "avatars_read_authenticated" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
