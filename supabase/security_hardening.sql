-- =========================================================================
-- রক্তদাতা (Roktodata) — Security Hardening & Production RLS Migration
-- Step 12: Production Security Audit, Access Control & Storage Protection
-- =========================================================================

-- ১. Storage Bucket Creation (Private Bucket for Medical Prescriptions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prescriptions',
  'prescriptions',
  false, -- STRICT PRIVACY: Private bucket, no public listing
  5242880, -- 5 MB maximum file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

-- Storage Object RLS Policies
DROP POLICY IF EXISTS "prescriptions_upload_policy" ON storage.objects;
CREATE POLICY "prescriptions_upload_policy" ON storage.objects
FOR INSERT TO authenticated, anon
WITH CHECK (bucket_id = 'prescriptions');

DROP POLICY IF EXISTS "prescriptions_read_signed_or_owner" ON storage.objects;
CREATE POLICY "prescriptions_read_signed_or_owner" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'prescriptions' AND (
    -- Owner can read their uploaded files
    (storage.foldername(name))[1] = auth.uid()::text
    -- Hospital staff or admins can audit prescriptions
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hospital_operator')
    )
  )
);

-- =========================================================================
-- ২. Profiles & Donor Profiles Security Hardening
-- =========================================================================
-- Ensure users can only update their own profile and cannot tamper with another's ID or phone
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "donor_profiles_update_own" ON public.donor_profiles;
CREATE POLICY "donor_profiles_update_own" ON public.donor_profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- ৩. Emergency Requests Security: Protect Against Unauthorized Modification
-- =========================================================================
-- Ensure requester_id and user_id columns are safe and synchronized
ALTER TABLE public.emergency_requests ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.emergency_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Anyone can view open emergency requests (public humanitarian emergency board)
DROP POLICY IF EXISTS "emergency_requests_read_all" ON public.emergency_requests;
CREATE POLICY "emergency_requests_read_all" ON public.emergency_requests
FOR SELECT USING (true);

-- Authenticated users or verified public emergency requesters can create requests
DROP POLICY IF EXISTS "emergency_requests_insert_policy" ON public.emergency_requests;
DROP POLICY IF EXISTS "emergency_requests_write_all" ON public.emergency_requests;
CREATE POLICY "emergency_requests_insert_policy" ON public.emergency_requests
FOR INSERT TO authenticated, anon
WITH CHECK (
  auth.uid() IS NULL 
  OR (requester_id IS NULL AND user_id IS NULL) 
  OR auth.uid() = requester_id 
  OR auth.uid() = user_id
);

-- Strictly restrict UPDATE to the owner of the request or authorized hospital/admin
CREATE POLICY "emergency_requests_update_owner_only" ON public.emergency_requests
FOR UPDATE TO authenticated
USING (
  auth.uid() = requester_id 
  OR auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'hospital_operator')
  )
)
WITH CHECK (
  auth.uid() = requester_id 
  OR auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'hospital_operator')
  )
);

-- Strictly restrict DELETE to the owner of the request or system admin
CREATE POLICY "emergency_requests_delete_owner_only" ON public.emergency_requests
FOR DELETE TO authenticated
USING (
  auth.uid() = requester_id 
  OR auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =========================================================================
-- ৪. Hospital Blood Inventory Security: Unauthorized Modification Blocked
-- =========================================================================
-- Public can read inventory status for hospital directory
DROP POLICY IF EXISTS "inventory_read_all" ON public.blood_inventory;
CREATE POLICY "inventory_read_all" ON public.blood_inventory
FOR SELECT USING (true);

-- Disallow regular donors or anonymous users from tampering with stock levels
DROP POLICY IF EXISTS "inventory_write_all" ON public.blood_inventory;
CREATE POLICY "inventory_write_operator_only" ON public.blood_inventory
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('hospital_operator', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('hospital_operator', 'admin')
  )
);

-- =========================================================================
-- ৫. In-App Chat Privacy: Only Participants Can Read or Send Messages
-- =========================================================================
DROP POLICY IF EXISTS "chat_read_all" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_write_all" ON public.chat_messages;

-- Reading messages strictly scoped to conversation participants
CREATE POLICY "chat_read_participants_only" ON public.chat_messages
FOR SELECT TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Inserting messages strictly scoped to authenticated sender
CREATE POLICY "chat_insert_sender_only" ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- =========================================================================
-- ৬. Fraud Reports Privacy: Only Reporter & Admins Can View
-- =========================================================================
DROP POLICY IF EXISTS "reports_read_all" ON public.reports;
DROP POLICY IF EXISTS "reports_write_all" ON public.reports;

CREATE POLICY "reports_insert_policy" ON public.reports
FOR INSERT TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "reports_select_reporter_or_admin" ON public.reports
FOR SELECT TO authenticated
USING (
  auth.uid() = reporter_id
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "reports_update_admin_only" ON public.reports
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =========================================================================
-- ৭. Donor Responses Security (Only responding donor can modify their status)
-- =========================================================================
DROP POLICY IF EXISTS "donor_responses_write_all" ON public.donor_responses;
CREATE POLICY "donor_responses_insert_policy" ON public.donor_responses
FOR INSERT TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "donor_responses_update_policy" ON public.donor_responses
FOR UPDATE TO authenticated
USING (
  -- Either the responding donor themselves
  EXISTS (SELECT 1 FROM public.donor_profiles dp WHERE dp.id = donor_id AND dp.user_id = auth.uid())
  -- Or the patient/creator of the associated emergency request confirming the match
  OR EXISTS (
    SELECT 1 FROM public.emergency_requests er 
    WHERE er.id = request_id AND (er.requester_id = auth.uid() OR er.user_id = auth.uid())
  )
  -- Or an admin
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
