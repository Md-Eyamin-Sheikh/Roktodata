-- =========================================================================
-- রক্তদাতা (Roktodata) — Production Security Hardening & Privilege Protection
-- Migration: 20261027_production_security_hardening.sql
-- =========================================================================

-- ১. অ্যাডমিন হেল্পার ফাংশন
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

-- ২. প্রোফাইল রোল ও ভেরিফিকেশন প্রটেকশন ট্রিগার
-- ব্যবহারকারী নিজে কখনোই তার role বা is_verified পরিবর্তন করতে পারবেন না (Privilege Escalation Prevention)
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- রোল পরিবর্তনের চেষ্টা যাচাই
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Privilege Escalation Rejected: Only administrators can modify roles.';
    END IF;
  END IF;

  -- সেলফ-ভেরিফিকেশন প্রতিরোধের চেষ্টা যাচাই
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified AND NEW.is_verified = TRUE THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized Modification: Self-verification is not permitted.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- ৩. RLS আপডেট পলিসি শক্তিশালীকরণ
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    (auth.uid() = id AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
    OR public.is_admin()
  );

-- ৪. সার্ভার-সাইড ফোন মাস্কিং ফাংশন (Server-Side Phone Masking)
-- 01712345678 -> 01712-XXX678
CREATE OR REPLACE FUNCTION public.mask_phone(phone_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  clean_digits TEXT;
BEGIN
  IF phone_text IS NULL OR length(phone_text) < 8 THEN
    RETURN '01XXX-XXXXXX';
  END IF;

  clean_digits := regexp_replace(phone_text, '[^0-9]', '', 'g');
  IF length(clean_digits) >= 11 THEN
    RETURN substr(clean_digits, 1, 5) || '-XXX' || substr(clean_digits, length(clean_digits) - 2);
  ELSE
    RETURN substr(clean_digits, 1, 3) || '-XXX-XXX';
  END IF;
END;
$$;

-- ৫. পাবলিক ডোনার ডিরেক্টরি ভিউ (ফোন নম্বর সর্বদা সার্ভার-সাইডে মাস্কড)
CREATE OR REPLACE VIEW public.public_donors_view AS
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
    WHEN auth.uid() = p.id OR public.is_admin() THEN p.phone_number
    ELSE public.mask_phone(p.phone_number)
  END AS phone_display
FROM public.profiles p
LEFT JOIN public.donor_profiles dp ON dp.user_id = p.id
WHERE dp.is_available IS TRUE OR dp.is_available IS NULL;

-- ৬. অনুমোদিত ম্যাচে পূর্ণ নম্বর প্রকাশের অডিট-লগযুক্ত RPC ফাংশন
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
SET search_path = public
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

  -- ডোনার নিজে অথবা সিস্টেম অ্যাডমিন হলে তৎক্ষণাৎ রিটার্ন
  IF caller_id = target_donor_id OR public.is_admin() THEN
    SELECT p.phone_number INTO donor_phone FROM public.profiles p WHERE p.id = target_donor_id;
    RETURN QUERY SELECT TRUE, donor_phone, 'অনুমোদিত'::TEXT;
    RETURN;
  END IF;

  -- ১. সক্রিয় জরুরি রক্তের আবেদনের প্রেক্ষিতে যাচাই
  IF request_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.emergency_requests er
      WHERE er.id = request_id AND er.requester_id = caller_id AND er.status = 'active'
    ) THEN
      is_authorized_match := TRUE;
    END IF;
  END IF;

  -- ২. রক্তদাতার সাড়া (donor_responses) যাচাই
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

  -- ৩. অনুমোদিত হলে নম্বর প্রকাশ এবং অডিট লগ লিপিবদ্ধকরণ
  IF is_authorized_match THEN
    SELECT p.phone_number INTO donor_phone FROM public.profiles p WHERE p.id = target_donor_id;

    -- অডিট লগ টেবিলে এন্ট্রি তৈরি (Audited Access)
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
      jsonb_build_object(
        'caller_id', caller_id,
        'target_donor_id', target_donor_id,
        'request_id', request_id,
        'timestamp', now()
      )::TEXT,
      'resolved'
    );

    RETURN QUERY SELECT TRUE, donor_phone, 'অনুমোদিত চিকিৎসা ম্যাচ: নম্বর প্রদান করা হয়েছে।'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::TEXT, 'অননুমোদিত: গোপনীয়তা নীতি অনুযায়ী শুধুমাত্র সক্রিয় জরুরি রোগী ও যাচাইকৃত ম্যাচে যোগাযোগ প্রকাশ করা হয়।'::TEXT;
  END IF;
END;
$$;
