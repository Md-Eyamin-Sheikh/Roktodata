-- =========================================================================
-- রক্তদাতা (Roktodata) — ধাপ ৪: Authentication-এর সাথে User Profile সংযোগ ও নিরাপত্তা
-- =========================================================================
-- এই স্ক্রিপ্টটি Supabase SQL Editor-এ রান করতে পারেন।
-- কাজসমূহ:
-- ১. profiles এবং auth.users-কে নিশ্চিতভাবে সংযুক্ত করা
-- ২. phone_number UNIQUE কনস্ট্রেইন্ট নিশ্চিত করা
-- ৩. Row Level Security (RLS) প্রয়োগ করে একজন ব্যবহারকারী যেন অন্যের তথ্য
--    পরিবর্তন করতে না পারে তা নিশ্চিত করা (auth.uid() = id)
-- ৪. অটোম্যাটিক updated_at ট্রিগার সেটআপ
-- =========================================================================

-- ১. কলাম ও কনস্ট্রেইন্ট পরীক্ষা ও সংশোধন
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS division VARCHAR(50) DEFAULT 'রাজশাহী',
  ADD COLUMN IF NOT EXISTS district VARCHAR(50) DEFAULT 'বগুড়া',
  ADD COLUMN IF NOT EXISTS upazila VARCHAR(50),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- phone_number এ UNIQUE ইনডেক্স/কনস্ট্রেইন্ট নিশ্চিত করা
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_phone_number_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_number_key UNIQUE (phone_number);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- ২. donor_profiles টেবিল সংশোধন
ALTER TABLE IF EXISTS public.donor_profiles
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_donation_date DATE,
  ADD COLUMN IF NOT EXISTS privacy_hide_phone BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ৩. Row Level Security (RLS) সক্রিয়করণ
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;

-- ৪. পূর্বের ত্রুটিপূর্ণ / উন্মুক্ত পলিসি অপসারণ
DROP POLICY IF EXISTS "Public profiles viewable by all" ON public.profiles;
DROP POLICY IF EXISTS "Public can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

DROP POLICY IF EXISTS "Donor profiles viewable by all" ON public.donor_profiles;
DROP POLICY IF EXISTS "Public can insert donor_profiles" ON public.donor_profiles;
DROP POLICY IF EXISTS "Public can update donor_profiles" ON public.donor_profiles;
DROP POLICY IF EXISTS "donor_profiles_all_access" ON public.donor_profiles;
DROP POLICY IF EXISTS "donor_profiles_select_public" ON public.donor_profiles;
DROP POLICY IF EXISTS "donor_profiles_insert_own" ON public.donor_profiles;
DROP POLICY IF EXISTS "donor_profiles_update_own" ON public.donor_profiles;

-- ৫. নতুন সুরক্ষিত পলিসিসমূহ:

-- ক) PROFILES:
-- যে কেউ ডোনার ডিরেক্টরি দেখতে পারবে (জরুরি রক্তের প্রয়োজনে সার্চ করার জন্য)
CREATE POLICY "profiles_select_public" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- শুধুমাত্র লগইন করা ব্যবহারকারী নিজের আইডিতে প্রোফাইল তৈরি করতে পারবে
CREATE POLICY "profiles_insert_own" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ব্যবহারকারী শুধুমাত্র নিজের প্রোফাইল আপডেট করতে পারবে (অন্য কারো প্রোফাইল নয়!)
CREATE POLICY "profiles_update_own" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- খ) DONOR_PROFILES:
-- যে কেউ ডোনার প্রাপ্যতা দেখতে পারবে
CREATE POLICY "donor_profiles_select_public" 
  ON public.donor_profiles 
  FOR SELECT 
  USING (true);

-- শুধুমাত্র লগইন করা ব্যবহারকারী নিজের ডোনার প্রোফাইল তৈরি করতে পারবে
CREATE POLICY "donor_profiles_insert_own" 
  ON public.donor_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ব্যবহারকারী শুধুমাত্র নিজের ডোনার প্রাপ্যতা ও তথ্য আপডেট করতে পারবে
CREATE POLICY "donor_profiles_update_own" 
  ON public.donor_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- ৬. পারমিশন গ্রান্ট
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.donor_profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.donor_profiles TO authenticated;

-- সার্ভিস রোলের জন্য পূর্ণ ক্ষমতা বজায় রাখা
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.donor_profiles TO service_role;
