-- =========================================================================
-- রক্তদাতা (Roktodata) — Supabase RLS Write & Read Permissions Fix
-- =========================================================================
-- আপনার ওয়েব অ্যাপ থেকে সরাসরি emergency_requests, profiles, donor_profiles
-- ইত্যাদি টেবিলে ডেটা রাইট (INSERT) এবং রিড (SELECT) সক্রিয় করার স্ক্রিপ্ট।
--
-- ব্যবহারের নিয়ম:
-- ১. Supabase ড্যাশবোর্ডে লগইন করুন (https://supabase.com/dashboard)
-- ২. আপনার প্রজেক্টটি ওপেন করুন (rpsvngzpnhgizwjqaelc)
-- ৩. বাম পাশের মেনু থেকে "SQL Editor" এ ক্লিক করুন
-- ৪. নিচের সম্পূর্ণ কোডটি পেস্ট করে "Run" বাটনে ক্লিক করুন।
-- =========================================================================

-- =========================================================================
-- অপশন ১: সবচেয়ে সহজ ও নিশ্চিত পদ্ধতি (Disable RLS for open write/read)
-- =========================================================================
ALTER TABLE IF EXISTS public.emergency_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donor_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hospitals_and_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blood_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambulances DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donation_camps DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donation_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;

-- =========================================================================
-- অপশন ২: অথবা RLS চালু রেখে সকল পারমিশন উন্মুক্ত রাখা (Permissive Policies)
-- =========================================================================
-- ১. emergency_requests
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "emergency_requests_all_access" ON public.emergency_requests;
CREATE POLICY "emergency_requests_all_access" ON public.emergency_requests
  FOR ALL USING (true) WITH CHECK (true);

-- ২. profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_all_access" ON public.profiles;
CREATE POLICY "profiles_all_access" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

-- ৩. donor_profiles
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "donor_profiles_all_access" ON public.donor_profiles;
CREATE POLICY "donor_profiles_all_access" ON public.donor_profiles
  FOR ALL USING (true) WITH CHECK (true);

-- ৪. donor_responses
ALTER TABLE public.donor_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "donor_responses_all_access" ON public.donor_responses;
CREATE POLICY "donor_responses_all_access" ON public.donor_responses
  FOR ALL USING (true) WITH CHECK (true);

-- ৫. hospitals_and_banks
ALTER TABLE public.hospitals_and_banks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hospitals_all_access" ON public.hospitals_and_banks;
CREATE POLICY "hospitals_all_access" ON public.hospitals_and_banks
  FOR ALL USING (true) WITH CHECK (true);

-- ৬. blood_inventory
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inventory_all_access" ON public.blood_inventory;
CREATE POLICY "inventory_all_access" ON public.blood_inventory
  FOR ALL USING (true) WITH CHECK (true);

-- ৭. ambulances
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ambulances_all_access" ON public.ambulances;
CREATE POLICY "ambulances_all_access" ON public.ambulances
  FOR ALL USING (true) WITH CHECK (true);

-- ৮. donation_camps
ALTER TABLE public.donation_camps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "camps_all_access" ON public.donation_camps;
CREATE POLICY "camps_all_access" ON public.donation_camps
  FOR ALL USING (true) WITH CHECK (true);

-- ৯. donation_history
ALTER TABLE public.donation_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "history_all_access" ON public.donation_history;
CREATE POLICY "history_all_access" ON public.donation_history
  FOR ALL USING (true) WITH CHECK (true);

-- ১০. notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_all_access" ON public.notifications;
CREATE POLICY "notifications_all_access" ON public.notifications
  FOR ALL USING (true) WITH CHECK (true);

-- রিয়েল-টাইম রেপ্লিকেশন সক্রিয়করণ
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_responses;
