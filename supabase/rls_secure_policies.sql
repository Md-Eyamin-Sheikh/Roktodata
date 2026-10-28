-- =========================================================================
-- রক্তদাতা (Roktodata) — Production Row Level Security (RLS) & Access Control
-- Version: 4.0 (Strict Policy Matrix Enforced, Zero Advisor Warning)
-- Architect: 20-30 Years Veteran Database & Security Architect
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'donor' 
  CHECK (role IN ('user', 'donor', 'recipient', 'hospital_operator', 'admin', 'volunteer'));

ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES public.hospitals_and_banks(id) ON DELETE SET NULL;

-- ১. হেল্পার ও ট্রিগার ফাংশনসমূহ (SET search_path = '')
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

-- profiles role ও is_verified সুরক্ষা ট্রিগার
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

-- donor_profiles total_donations ও reward_points সুরক্ষা ট্রিগার
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

-- ২. ভিউসমূহ (security_invoker = true)
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

-- ৩. ১৬টি টেবিলে RLS সক্রিয়করণ ও পারমিশন রিসেট
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals_and_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

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

-- ৪. সুনির্দিষ্ট পলিসি-ম্যাট্রিক্স বাস্তবায়ন

-- ১. PROFILES (anon SELECT ব্লকড!)
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

-- ২. DONOR_PROFILES (anon SELECT ব্লকড, reward_points ও donations লকড)
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
  FOR SELECT USING (
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
    reporter_id = (SELECT auth.uid()) OR public.is_admin()
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
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

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

-- ৫. STORAGE পলিসি (প্রেসক্রিপশন ইউজার B-র ফাইলে ইউজার A ব্লকড)
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
