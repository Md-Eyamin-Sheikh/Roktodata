-- =========================================================================
-- রক্তদাতা (Roktodata) — Production Row Level Security (RLS) & Access Control
-- Version: 3.0 (Role-Based Access Control, Strict Data Isolation & Privacy)
-- =========================================================================
-- এই স্ক্রিপ্টটি প্রতিটি টেবিলে RLS সক্রিয় করে এবং মালিকানা ও ভূমিকা যাচাই করে
-- ডেটা নিরাপত্তা নিশ্চিত করে।
--
-- ব্যবহারের নিয়ম:
-- ১. Supabase ড্যাশবোর্ডে লগইন করুন (https://supabase.com/dashboard)
-- ২. আপনার প্রজেক্টটি ওপেন করুন (rpsvngzpnhgizwjqaelc)
-- ৩. বাম পাশের মেনু থেকে "SQL Editor" এ ক্লিক করুন
-- ৪. নিচের সম্পূর্ণ স্ক্রিপ্টটি পেস্ট করে "Run" বাটনে ক্লিক করুন।
-- =========================================================================

-- =========================================================================
-- ধাপ ১: প্রয়োজনীয় এক্সটেনশন ও ফাংশন (Role Verification Helpers)
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ১.১ role কলাম যোগ করা (যদি ইতিমধ্যে না থাকে)
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'donor' 
  CHECK (role IN ('donor', 'recipient', 'hospital_operator', 'admin'));

-- ১.২ হাসপাতাল অপারেটরের জন্য hospital_id সংযোগ (ঐচ্ছিক)
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES public.hospitals_and_banks(id) ON DELETE SET NULL;

-- ১.৩ অ্যাডমিন যাচাইকারী সিকিউরিটি ডেফাইনার ফাংশন
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ১.৪ হাসপাতাল অপারেটর যাচাইকারী ফাংশন
CREATE OR REPLACE FUNCTION public.is_hospital_operator()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'hospital_operator' OR role = 'admin')
  );
$$;

-- =========================================================================
-- ধাপ ২: মিসিং টেবিল তৈরি (reports ও chat_messages)
-- =========================================================================

-- ২.১ অ্যান্টি-ফ্রড ও অনিয়ম রিপোর্ট টেবিল
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_name VARCHAR(150) NOT NULL,
  target_phone VARCHAR(25),
  reason VARCHAR(200) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ২.২ সুরক্ষিত ইন-অ্যাপ চ্যাট মেসেজ টেবিল
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_participants ON public.chat_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_request ON public.chat_messages(request_id);

-- =========================================================================
-- ধাপ ৩: প্রতিটি টেবিলে RLS সক্রিয়করণ (Enable Row Level Security)
-- =========================================================================
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

-- পূর্বে তৈরিকৃত পুরানো পারমিশন মুছে ফেলা (Clean existing policies)
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

-- =========================================================================
-- ধাপ ৪: সুনির্দিষ্ট গ্র্যানুলার RLS পলিসি (Fine-Grained Policies)
-- =========================================================================

-- -------------------------------------------------------------------------
-- ১. PROFILES টেবিল
-- -------------------------------------------------------------------------
-- SELECT: জরুরি রক্তের প্রয়োজনে রক্তদাতাদের সাধারণ তথ্য দেখা যাবে
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT
  USING (true);

-- INSERT: ব্যবহারকারী শুধুমাত্র নিজের user_id দিয়ে প্রোফাইল তৈরি করতে পারবেন
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: ব্যবহারকারী শুধুমাত্র নিজের প্রোফাইল পরিবর্তন করবেন; অ্যাডমিন সবার পরিবর্তন করতে পারেন
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- DELETE: ব্যবহারকারী বা অ্যাডমিন মুছতে পারবেন
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE
  USING (auth.uid() = id OR public.is_admin());

-- -------------------------------------------------------------------------
-- ২. DONOR_PROFILES টেবিল
-- -------------------------------------------------------------------------
-- SELECT: যে কেউ সক্রিয় রক্তদাতাদের দেখতে পাবেন
CREATE POLICY "donor_profiles_select_public" ON public.donor_profiles
  FOR SELECT
  USING (true);

-- INSERT: ডোনার শুধুমাত্র নিজের user_id দিয়ে ডোনার প্রোফাইল তৈরি করবেন
CREATE POLICY "donor_profiles_insert_own" ON public.donor_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: ডোনার নিজের প্রাপ্যতা (is_available) ও প্রোফাইল পরিবর্তন করবেন
CREATE POLICY "donor_profiles_update_own" ON public.donor_profiles
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- DELETE: ডোনার বা অ্যাডমিন
CREATE POLICY "donor_profiles_delete_own" ON public.donor_profiles
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- -------------------------------------------------------------------------
-- ৩. EMERGENCY_REQUESTS টেবিল (জরুরি রক্তের অনুরোধ)
-- -------------------------------------------------------------------------
-- SELECT: সক্রিয় সকল রক্তের আবেদন যে কেউ দেখতে পাবেন
CREATE POLICY "requests_select_active" ON public.emergency_requests
  FOR SELECT
  USING (status != 'cancelled' OR requester_id = auth.uid() OR public.is_admin());

-- INSERT: লগইন করা ব্যবহারকারী রক্তের অনুরোধ তৈরি করবেন
CREATE POLICY "requests_insert_auth" ON public.emergency_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (requester_id IS NULL OR requester_id = auth.uid())
  );

-- UPDATE: শুধুমাত্র অনুরোধের মালিক (requester) অথবা অ্যাডমিন আপডেট/ক্লোজ করতে পারবেন
CREATE POLICY "requests_update_own" ON public.emergency_requests
  FOR UPDATE
  USING (requester_id = auth.uid() OR public.is_admin())
  WITH CHECK (requester_id = auth.uid() OR public.is_admin());

-- DELETE: মালিক বা অ্যাডমিন
CREATE POLICY "requests_delete_own" ON public.emergency_requests
  FOR DELETE
  USING (requester_id = auth.uid() OR public.is_admin());

-- -------------------------------------------------------------------------
-- ৪. DONOR_RESPONSES টেবিল (রক্তদাতার সাড়া)
-- -------------------------------------------------------------------------
-- SELECT: সাড়াদানকারী রক্তদাতা, অনুরোধকারী গ্রহীতা এবং অ্যাডমিন দেখতে পারবেন
CREATE POLICY "responses_select_involved" ON public.donor_responses
  FOR SELECT
  USING (
    donor_id IN (SELECT dp.id FROM public.donor_profiles dp WHERE dp.user_id = auth.uid())
    OR request_id IN (SELECT er.id FROM public.emergency_requests er WHERE er.requester_id = auth.uid())
    OR public.is_admin()
  );

-- INSERT: শুধুমাত্র রক্তদাতা নিজের ডোনার আইডি দিয়ে সাড়া দেবেন
CREATE POLICY "responses_insert_donor" ON public.donor_responses
  FOR INSERT
  WITH CHECK (
    donor_id IN (SELECT dp.id FROM public.donor_profiles dp WHERE dp.user_id = auth.uid())
    OR public.is_admin()
  );

-- UPDATE: ডোনার তার ETA আপডেট করতে পারবেন এবং অনুরোধকারী কনফার্ম করতে পারবেন
CREATE POLICY "responses_update_involved" ON public.donor_responses
  FOR UPDATE
  USING (
    donor_id IN (SELECT dp.id FROM public.donor_profiles dp WHERE dp.user_id = auth.uid())
    OR request_id IN (SELECT er.id FROM public.emergency_requests er WHERE er.requester_id = auth.uid())
    OR public.is_admin()
  );

-- DELETE: ডোনার নিজের সাড়া প্রত্যাহার করতে পারবেন
CREATE POLICY "responses_delete_own" ON public.donor_responses
  FOR DELETE
  USING (
    donor_id IN (SELECT dp.id FROM public.donor_profiles dp WHERE dp.user_id = auth.uid())
    OR public.is_admin()
  );

-- -------------------------------------------------------------------------
-- ৫. NOTIFICATIONS টেবিল (ব্যবহারকারীর নিজস্ব নোটিফিকেশন)
-- -------------------------------------------------------------------------
-- SELECT: ব্যবহারকারী শুধুমাত্র নিজের নোটিফিকেশন এবং সাধারণ ব্রডকাস্ট দেখতে পারবেন
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT
  USING (
    user_id = auth.uid() OR user_id IS NULL OR public.is_admin()
  );

-- INSERT: অথেনটিকেটেড ইউজার বা সিস্টেম নোটিফিকেশন তৈরি করতে পারে
CREATE POLICY "notifications_insert_authenticated" ON public.notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL OR public.is_admin()
  );

-- UPDATE: ব্যবহারকারী শুধুমাত্র নিজের নোটিফিকেশন পঠিত (read) করতে পারবেন
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- DELETE: ব্যবহারকারী নিজের নোটিফিকেশন মুছতে পারবেন
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());

-- -------------------------------------------------------------------------
-- ৬. BLOOD_INVENTORY টেবিল (হাসপাতাল রক্তের মজুদ)
-- -------------------------------------------------------------------------
-- SELECT: সাধারণ ব্যবহারকারী ও গ্রহীতারা লাইভ স্টক দেখতে পাবেন
CREATE POLICY "inventory_select_all" ON public.blood_inventory
  FOR SELECT
  USING (true);

-- INSERT / UPDATE / DELETE: শুধুমাত্র অনুমোদিত হাসপাতাল অপারেটর বা অ্যাডমিন পরিবর্তন করতে পারবেন
CREATE POLICY "inventory_modify_operator" ON public.blood_inventory
  FOR ALL
  USING (public.is_hospital_operator() OR public.is_admin())
  WITH CHECK (public.is_hospital_operator() OR public.is_admin());

-- -------------------------------------------------------------------------
-- ৭. REPORTS টেবিল (অভিযোগ ও অ্যান্টি-ফ্রড)
-- -------------------------------------------------------------------------
-- INSERT: যে কেউ অনিয়মের রিপোর্ট জমা দিতে পারবেন
CREATE POLICY "reports_insert_any" ON public.reports
  FOR INSERT
  WITH CHECK (true);

-- SELECT: শুধুমাত্র অভিযোগকারী নিজের রিপোর্ট এবং অ্যাডমিনরা সব রিপোর্ট দেখতে পাবেন
CREATE POLICY "reports_select_owner_admin" ON public.reports
  FOR SELECT
  USING (reporter_id = auth.uid() OR public.is_admin());

-- UPDATE / DELETE: শুধুমাত্র অ্যাডমিন তদন্ত বা সমাধান করতে পারবেন
CREATE POLICY "reports_admin_manage" ON public.reports
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -------------------------------------------------------------------------
-- ৮. CHAT_MESSAGES টেবিল (নিরাপদ চ্যাট)
-- -------------------------------------------------------------------------
-- SELECT: শুধুমাত্র বার্তা প্রেরণকারী (sender) ও প্রাপক (recipient) বার্তা দেখতে পারবেন
CREATE POLICY "chat_select_participants" ON public.chat_messages
  FOR SELECT
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid() OR public.is_admin()
  );

-- INSERT: প্রেরক শুধুমাত্র নিজের আইডি দিয়ে বার্তা পাঠাতে পারবেন
CREATE POLICY "chat_insert_sender" ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
  );

-- -------------------------------------------------------------------------
-- ৯. রেফারেন্স টেবিলসমূহ (Hospitals, Ambulances, Camps, Districts, History)
-- -------------------------------------------------------------------------
-- SELECT: সবার জন্য উন্মুক্ত
CREATE POLICY "hospitals_select_all" ON public.hospitals_and_banks FOR SELECT USING (true);
CREATE POLICY "ambulances_select_all" ON public.ambulances FOR SELECT USING (true);
CREATE POLICY "camps_select_all" ON public.donation_camps FOR SELECT USING (true);
CREATE POLICY "districts_select_all" ON public.districts FOR SELECT USING (true);
CREATE POLICY "history_select_all" ON public.donation_history FOR SELECT USING (true);

-- MODIFY: শুধুমাত্র অ্যাডমিন রেফারেন্স ডেটা পরিবর্তন করবেন
CREATE POLICY "hospitals_admin_manage" ON public.hospitals_and_banks FOR ALL USING (public.is_admin());
CREATE POLICY "ambulances_admin_manage" ON public.ambulances FOR ALL USING (public.is_admin());
CREATE POLICY "camps_admin_manage" ON public.donation_camps FOR ALL USING (public.is_admin());
CREATE POLICY "districts_admin_manage" ON public.districts FOR ALL USING (public.is_admin());

-- =========================================================================
-- শেষ: সম্পূর্ণ সিকিউরিটি কনফার্মেশন
-- =========================================================================
COMMENT ON TABLE public.profiles IS 'রক্তদাতা ও গ্রহীতাদের প্রোফাইল — ব্যবহারকারী শুধুমাত্র নিজের ডেটা আপডেট করতে পারেন।';
COMMENT ON TABLE public.notifications IS 'ব্যক্তিগত নোটিফিকেশন — শুধুমাত্র স্বীয় ব্যবহারকারীর জন্য দৃশ্যমান।';
COMMENT ON TABLE public.donor_responses IS 'ডোনারের সাড়া — শুধুমাত্র সংশ্লিষ্ট ডোনার ও গ্রহীতার জন্য দৃশ্যমান।';
COMMENT ON TABLE public.blood_inventory IS 'হাসপাতাল স্টক — শুধুমাত্র অনুমোদিত অপারেটর ও অ্যাডমিন দ্বারা পরিবর্তনযোগ্য।';
