-- =========================================================================
-- রক্তদাতা (Roktodata) — Production Row Level Security (RLS) & Access Control
-- Migration: 20261027120000_production_rls_policies.sql
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Helper Functions
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'donor' 
  CHECK (role IN ('donor', 'recipient', 'hospital_operator', 'admin'));

ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES public.hospitals_and_banks(id) ON DELETE SET NULL;

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

-- 2. Enable RLS on core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Profiles Policies
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- 4. Emergency Requests Policies
DROP POLICY IF EXISTS "requests_select_active" ON public.emergency_requests;
CREATE POLICY "requests_select_active" ON public.emergency_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "requests_insert_verified" ON public.emergency_requests;
CREATE POLICY "requests_insert_verified" ON public.emergency_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "requests_update_owner_or_admin" ON public.emergency_requests;
CREATE POLICY "requests_update_owner_or_admin" ON public.emergency_requests FOR UPDATE USING (
  requester_id = auth.uid() OR public.is_admin()
);

-- 5. Push Subscriptions
DROP POLICY IF EXISTS "push_subs_insert" ON public.push_subscriptions;
CREATE POLICY "push_subs_insert" ON public.push_subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "push_subs_select_owner" ON public.push_subscriptions;
CREATE POLICY "push_subs_select_owner" ON public.push_subscriptions FOR SELECT USING (
  user_id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "push_subs_update_owner" ON public.push_subscriptions;
CREATE POLICY "push_subs_update_owner" ON public.push_subscriptions FOR UPDATE USING (
  user_id = auth.uid() OR public.is_admin()
);

-- 6. Reports Policies
DROP POLICY IF EXISTS "reports_insert_any" ON public.reports;
CREATE POLICY "reports_insert_any" ON public.reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "reports_select_owner_admin" ON public.reports;
CREATE POLICY "reports_select_owner_admin" ON public.reports FOR SELECT USING (
  reporter_id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "reports_admin_manage" ON public.reports;
CREATE POLICY "reports_admin_manage" ON public.reports FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
