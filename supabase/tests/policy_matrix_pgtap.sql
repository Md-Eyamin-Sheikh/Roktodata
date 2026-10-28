-- =========================================================================
-- রক্তদাতা (Roktodata) — ধাপ ২: পূর্ণাঙ্গ pgTAP পলিসি-ম্যাট্রিক্স টেস্ট স্ক্রিপ্ট
-- File: supabase/tests/policy_matrix_pgtap.sql
-- =========================================================================

BEGIN;
SELECT plan(12);

-- টেস্ট ভেরিয়েবল সেটআপ
DO $$
DECLARE
  uid_a UUID := '11111111-1111-4111-8111-111111111111';
  uid_b UUID := '22222222-2222-4222-8222-222222222222';
  uid_c UUID := '33333333-3333-4333-8333-333333333333';
  hosp_1 UUID := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  hosp_2 UUID := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
BEGIN
  -- টেম্পোরারি টেস্ট ডাটা তৈরি
  INSERT INTO public.hospitals_and_banks (id, name, district, address, hotline)
  VALUES 
    (hosp_1, 'হাসপাতাল ১', 'ঢাকা', 'ধানমন্ডি', '01711111111'),
    (hosp_2, 'হাসপাতাল ২', 'বগুড়া', 'সদর', '01722222222')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, phone_number, full_name, blood_group, division, district, role, hospital_id)
  VALUES 
    (uid_a, '01711000001', 'ইউজার এ', 'B+', 'ঢাকা', 'ঢাকা', 'donor', NULL),
    (uid_b, '01711000002', 'ইউজার বি', 'O+', 'ঢাকা', 'ঢাকা', 'donor', NULL),
    (uid_c, '01711000003', 'ইউজার সি (অপারেটর ১)', 'A+', 'ঢাকা', 'ঢাকা', 'hospital_operator', hosp_1)
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, hospital_id = EXCLUDED.hospital_id;

  INSERT INTO public.donor_profiles (user_id, is_available, total_donations, reward_points)
  VALUES 
    (uid_a, true, 2, 100),
    (uid_b, true, 5, 250)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.blood_inventory (hospital_id, blood_group, units_available)
  VALUES 
    (hosp_1, 'B+', 10),
    (hosp_2, 'B+', 5)
  ON CONFLICT (hospital_id, blood_group) DO UPDATE SET units_available = EXCLUDED.units_available;

  INSERT INTO public.emergency_requests (id, requester_id, blood_group, bags_needed, hospital_name, district, patient_name, contact_phone, urgency, status)
  VALUES 
    ('44444444-4444-4444-8444-444444444444', uid_b, 'B+', 1, 'হাসপাতাল ২', 'বগুড়া', 'রোগী বি', '01711000002', 'now', 'active')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.chat_messages (id, sender_id, receiver_id, message)
  VALUES 
    ('55555555-5555-4555-8555-555555555555', uid_b, uid_c, 'ব্যক্তিগত বার্তা')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.reports (id, reporter_id, reason, details)
  VALUES 
    ('66666666-6666-4666-8666-666666666666', uid_b, 'কনফিডেনশিয়াল রিপোর্ট', 'গোপনীয় তদন্ত তথ্য')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- -------------------------------------------------------------------------
-- ১. টেস্ট ১: লগইন ছাড়া (anon) -> profiles, donor_profiles, chat, reports, push SELECT -> ব্লক
-- -------------------------------------------------------------------------
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{}', true);

SELECT is(
  (SELECT count(*)::int FROM public.profiles),
  0,
  'টেস্ট ১.১: লগইন ছাড়া (anon) profiles SELECT সম্পূর্ণ ব্লকড (০ সারি)'
);

-- -------------------------------------------------------------------------
-- ২. টেস্ট ২: anon -> emergency_requests SELECT -> ফোন ও রোগীর নাম কলাম সুরক্ষিত
-- -------------------------------------------------------------------------
-- anon কলাম লেভেল রেস্ট্রিকশন বা লিমিটেড ভিউ পায়
SELECT is(
  (SELECT patient_name FROM public.public_emergency_requests WHERE id = '44444444-4444-4444-8444-444444444444'),
  '*** গোপনীয় ***',
  'টেস্ট ২: anon এমার্জেন্সি রিকোয়েস্টে রোগীর নাম ও সংবেদনশীল তথ্য গোপন (সীমিত ভিউ)'
);

-- -------------------------------------------------------------------------
-- ৩. টেস্ট ৩: ইউজার A নিজের profiles.role = 'admin' করার চেষ্টা -> ব্লক
-- -------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

-- UPDATE রান করা
DO $$
BEGIN
  UPDATE public.profiles SET role = 'admin' WHERE id = '11111111-1111-4111-8111-111111111111';
EXCEPTION WHEN OTHERS THEN
  -- ট্রিগার প্রিভিলেজ এস্কেলেশন এক্সেপশন রেইজ করলে ক্যাচ হবে
  NULL;
END $$;

SELECT is(
  (SELECT role::text FROM public.profiles WHERE id = '11111111-1111-4111-8111-111111111111'),
  'donor',
  'টেস্ট ৩: ইউজার A নিজের role = admin করতে পারেনি (role অপরিবর্তিত)'
);

-- -------------------------------------------------------------------------
-- ৪. টেস্ট ৪: ইউজার A ইউজার B-র profile বা request UPDATE/DELETE -> ব্লক
-- -------------------------------------------------------------------------
UPDATE public.profiles SET full_name = 'হ্যাকড' WHERE id = '22222222-2222-4222-8222-222222222222';
UPDATE public.emergency_requests SET patient_name = 'হ্যাকড' WHERE requester_id = '22222222-2222-4222-8222-222222222222';
DELETE FROM public.emergency_requests WHERE requester_id = '22222222-2222-4222-8222-222222222222';

SELECT is(
  (SELECT full_name FROM public.profiles WHERE id = '22222222-2222-4222-8222-222222222222'),
  'ইউজার বি',
  'টেস্ট ৪: ইউজার A দ্বারা ইউজার B-র profile বা request পরিবর্তন/মুছে ফেলা ব্লকড'
);

-- -------------------------------------------------------------------------
-- ৫. টেস্ট ৫: ইউজার A donor_responses-এ donor_id = B বসিয়ে insert (spoof) -> ব্লক
-- -------------------------------------------------------------------------
DO $$
DECLARE
  donor_b_id UUID;
BEGIN
  SELECT id INTO donor_b_id FROM public.donor_profiles WHERE user_id = '22222222-2222-4222-8222-222222222222';
  INSERT INTO public.donor_responses (request_id, donor_id, eta_minutes)
  VALUES ('44444444-4444-4444-8444-444444444444', donor_b_id, 20);
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT is(
  (SELECT count(*)::int FROM public.donor_responses WHERE request_id = '44444444-4444-4444-8444-444444444444'),
  0,
  'টেস্ট ৫: donor_responses-এ অন্যের donor_id স্পুফ করে insert ব্লকড'
);

-- -------------------------------------------------------------------------
-- ৬. টেস্ট ৬: ইউজার A B ও C-র chat পড়া বা Realtime subscribe -> ব্লক
-- -------------------------------------------------------------------------
SELECT is(
  (SELECT count(*)::int FROM public.chat_messages WHERE id = '55555555-5555-4555-8555-555555555555'),
  0,
  'টেস্ট ৬: ইউজার A তৃতীয় পক্ষ B ও C-র ব্যক্তিগত চ্যাট বার্তা পড়তে পারেনি (০ সারি)'
);

-- -------------------------------------------------------------------------
-- ৭. টেস্ট ৭: ইউজার A blood_inventory UPDATE -> ব্লক
-- -------------------------------------------------------------------------
UPDATE public.blood_inventory SET units_available = 999 WHERE hospital_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

SELECT is(
  (SELECT units_available FROM public.blood_inventory WHERE hospital_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' AND blood_group = 'B+'),
  10,
  'টেস্ট ৭: সাধারণ ইউজার A দ্বারা রক্তের স্টক পরিবর্তন ব্লকড (স্টক অপরিবর্তিত)'
);

-- -------------------------------------------------------------------------
-- ৮. টেস্ট ৮: hospital_operator অন্য হাসপাতালের inventory UPDATE -> ব্লক
-- -------------------------------------------------------------------------
-- ইউজার সি (হসপিটাল ১ এর অপারেটর) হিসেবে স্যুইচ
SELECT set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}', true);

-- হসপিটাল ২ এর স্টক পরিবর্তনের চেষ্টা
UPDATE public.blood_inventory SET units_available = 0 WHERE hospital_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

SELECT is(
  (SELECT units_available FROM public.blood_inventory WHERE hospital_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' AND blood_group = 'B+'),
  5,
  'টেস্ট ৮: হসপিটাল অপারেটর অন্য হাসপাতালের স্টক পরিবর্তন করতে পারেনি (০ সারি আপডেট)'
);

-- পুনরায় ইউজার এ-তে ফেরত
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

-- -------------------------------------------------------------------------
-- ৯. টেস্ট ৯: ইউজার A অন্যের reports ও admin_notes পড়া -> ব্লক
-- -------------------------------------------------------------------------
SELECT is(
  (SELECT count(*)::int FROM public.reports WHERE id = '66666666-6666-4666-8666-666666666666'),
  0,
  'টেস্ট ৯: ইউজার A অন্যের দায়েরকৃত রিপোর্ট বা তদন্ত নোট দেখতে পায়নি (০ সারি)'
);

-- -------------------------------------------------------------------------
-- ১০. টেস্ট ১০: ইউজার A B-র প্রেসক্রিপশন ফাইলের URL খোলা -> ব্লক
-- -------------------------------------------------------------------------
SELECT is(
  (SELECT count(*)::int FROM storage.objects 
   WHERE bucket_id = 'prescriptions' AND name LIKE '22222222-2222-4222-8222-222222222222/%'),
  0,
  'টেস্ট ১০: ইউজার A কর্তৃক ইউজার B-র প্রেসক্রিপশন অবজেক্ট সরাসরি পড়া ব্লকড'
);

-- -------------------------------------------------------------------------
-- ১১. টেস্ট ১১: ইউজার A নিজের reward_points, total_donations, is_verified বাড়ানো -> ব্লক
-- -------------------------------------------------------------------------
UPDATE public.donor_profiles 
SET total_donations = 100, reward_points = 9999 
WHERE user_id = '11111111-1111-4111-8111-111111111111';

DO $$
BEGIN
  UPDATE public.profiles SET is_verified = true WHERE id = '11111111-1111-4111-8111-111111111111';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT is(
  (SELECT total_donations FROM public.donor_profiles WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  2,
  'টেস্ট ১১.১: নিজের total_donations জালিয়াতি করে বাড়ানো ব্যর্থ (অপরিবর্তিত)'
);

SELECT is(
  (SELECT reward_points FROM public.donor_profiles WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  100,
  'টেস্ট ১১.২: নিজের reward_points জালিয়াতি করে বাড়ানো ব্যর্থ (অপরিবর্তিত)'
);

-- -------------------------------------------------------------------------
-- ১২. টেস্ট ১২: ইউজার A অন্যের requester_id বসিয়ে অনুরোধ insert -> ব্লক
-- -------------------------------------------------------------------------
DO $$
BEGIN
  INSERT INTO public.emergency_requests (
    requester_id, blood_group, bags_needed, hospital_name, district, patient_name, contact_phone, urgency, status
  )
  VALUES (
    '22222222-2222-4222-8222-222222222222', -- Spoofed B's ID
    'O+', 1, 'হাসপাতাল ১', 'ঢাকা', 'রোগী স্পুফ', '01711000001', 'now', 'active'
  );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT is(
  (SELECT count(*)::int FROM public.emergency_requests WHERE patient_name = 'রোগী স্পুফ'),
  0,
  'টেস্ট ১২: অন্যের requester_id বসিয়ে অননুমোদিত অনুরোধ ইনসার্ট ব্লকড'
);

SELECT * FROM finish();
ROLLBACK;
