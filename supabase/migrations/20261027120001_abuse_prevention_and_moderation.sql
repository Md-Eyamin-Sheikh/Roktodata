-- =========================================================================
-- রক্তদাতা (Roktodata) — Abuse Prevention, Rate Limiting & Moderation Queue
-- Migration: 20261027120001_abuse_prevention_and_moderation.sql
-- =========================================================================

-- 1. Table: request_rate_limits
CREATE TABLE IF NOT EXISTS public.request_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(100) NOT NULL, -- IP address or normalized phone
  action_type VARCHAR(50) NOT NULL, -- 'request_create', 'auth_attempt', etc.
  request_count INT DEFAULT 1,
  first_request_at TIMESTAMPTZ DEFAULT NOW(),
  last_request_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier ON public.request_rate_limits(identifier, action_type);

-- 2. Table: banned_users
CREATE TABLE IF NOT EXISTS public.banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  phone VARCHAR(25) NOT NULL,
  reason TEXT NOT NULL,
  banned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banned_users_phone ON public.banned_users(phone);

-- 3. Table: data_deletion_requests (Facebook / Google GDPR Compliance)
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_identifier VARCHAR(150) NOT NULL, -- Email or phone or OAuth ID
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  confirmation_code VARCHAR(64) NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_data_deletion_code ON public.data_deletion_requests(confirmation_code);

-- 4. Enable RLS
ALTER TABLE public.request_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "rate_limits_service_role" ON public.request_rate_limits FOR ALL USING (public.is_admin());
CREATE POLICY "banned_users_admin" ON public.banned_users FOR ALL USING (public.is_admin());
CREATE POLICY "data_deletion_insert" ON public.data_deletion_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "data_deletion_select" ON public.data_deletion_requests FOR SELECT USING (
  auth.uid() = user_id OR public.is_admin()
);
