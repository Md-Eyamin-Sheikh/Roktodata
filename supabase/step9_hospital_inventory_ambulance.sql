-- =========================================================================
-- রক্তদাতা (Roktodata) — ধাপ ৯: Hospital, Blood Bank, Inventory ও Ambulance
-- =========================================================================
-- ১. blood_inventory_logs (স্টক পরিবর্তনের অডিট ইতিহাস)
-- ২. blood_inventory নেতিবাচক সংখ্যা প্রতিরোধ কনস্ট্রেইন্ট নিশ্চিতকরণ
-- ৩. Row Level Security (RLS) প্রয়োগ:
--    - যে কেউ হাসপাতাল, স্টক ও অ্যাম্বুলেন্স দেখতে পারবে (পাবলিক ডিরেক্টরি)
--    - শুধুমাত্র অনুমোদিত হাসপাতাল অপারেটর ও অ্যাডমিন স্টক পরিবর্তন করতে পারবে
-- =========================================================================

-- ১. blood_inventory টেবিলে CHECK কনস্ট্রেইন্ট নিশ্চিত করা
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blood_inventory_units_available_check'
  ) THEN
    ALTER TABLE public.blood_inventory ADD CONSTRAINT blood_inventory_units_available_check CHECK (units_available >= 0);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- ২. blood_inventory_logs টেবিল তৈরি (যদি না থাকে)
CREATE TABLE IF NOT EXISTS public.blood_inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals_and_banks(id) ON DELETE CASCADE NOT NULL,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  previous_units INTEGER NOT NULL DEFAULT 0,
  new_units INTEGER NOT NULL DEFAULT 0 CHECK (new_units >= 0),
  delta INTEGER NOT NULL DEFAULT 0,
  action_type VARCHAR(30) DEFAULT 'manual_adjustment',
  reason VARCHAR(255),
  operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  operator_name VARCHAR(120),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_hospital ON public.blood_inventory_logs(hospital_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON public.blood_inventory_logs(created_at DESC);

-- ৩. profiles টেবিলে role ও hospital_id নিশ্চিত করা
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'donor',
  ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES public.hospitals_and_banks(id) ON DELETE SET NULL;

-- ৪. RLS সক্রিয়করণ
ALTER TABLE public.hospitals_and_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;

-- ৫. RLS পলিসিসমূহ:

-- ক) hospitals_and_banks:
DROP POLICY IF EXISTS "hospitals_select_public" ON public.hospitals_and_banks;
CREATE POLICY "hospitals_select_public" ON public.hospitals_and_banks FOR SELECT USING (true);

DROP POLICY IF EXISTS "hospitals_operator_manage" ON public.hospitals_and_banks;
CREATE POLICY "hospitals_operator_manage" ON public.hospitals_and_banks 
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR (profiles.role = 'hospital_operator' AND profiles.hospital_id = hospitals_and_banks.id))
    )
  );

-- খ) blood_inventory:
DROP POLICY IF EXISTS "inventory_select_public" ON public.blood_inventory;
CREATE POLICY "inventory_select_public" ON public.blood_inventory FOR SELECT USING (true);

DROP POLICY IF EXISTS "inventory_operator_update" ON public.blood_inventory;
CREATE POLICY "inventory_operator_update" ON public.blood_inventory 
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'hospital_operator')
    )
  )
  WITH CHECK (
    units_available >= 0 AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'hospital_operator')
    )
  );

DROP POLICY IF EXISTS "inventory_operator_insert" ON public.blood_inventory;
CREATE POLICY "inventory_operator_insert" ON public.blood_inventory 
  FOR INSERT TO authenticated 
  WITH CHECK (
    units_available >= 0 AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'hospital_operator')
    )
  );

-- গ) blood_inventory_logs:
DROP POLICY IF EXISTS "inventory_logs_select_all" ON public.blood_inventory_logs;
CREATE POLICY "inventory_logs_select_all" ON public.blood_inventory_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "inventory_logs_insert_auth" ON public.blood_inventory_logs;
CREATE POLICY "inventory_logs_insert_auth" ON public.blood_inventory_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ঘ) ambulances:
DROP POLICY IF EXISTS "ambulances_select_public" ON public.ambulances;
CREATE POLICY "ambulances_select_public" ON public.ambulances FOR SELECT USING (true);

DROP POLICY IF EXISTS "ambulances_admin_manage" ON public.ambulances;
CREATE POLICY "ambulances_admin_manage" ON public.ambulances 
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'hospital_operator')
    )
  );

-- ৬. পারমিশন গ্রান্ট
GRANT SELECT ON public.hospitals_and_banks TO anon, authenticated;
GRANT SELECT ON public.blood_inventory TO anon, authenticated;
GRANT SELECT ON public.blood_inventory_logs TO anon, authenticated;
GRANT SELECT ON public.ambulances TO anon, authenticated;

GRANT INSERT, UPDATE ON public.blood_inventory TO authenticated;
GRANT INSERT ON public.blood_inventory_logs TO authenticated;
GRANT INSERT, UPDATE ON public.hospitals_and_banks TO authenticated;
GRANT INSERT, UPDATE ON public.ambulances TO authenticated;

GRANT ALL ON public.hospitals_and_banks TO service_role;
GRANT ALL ON public.blood_inventory TO service_role;
GRANT ALL ON public.blood_inventory_logs TO service_role;
GRANT ALL ON public.ambulances TO service_role;
