-- 1. Create Change Requests Table
CREATE TABLE IF NOT EXISTS public.change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL, -- e.g., 'QC', 'Customers', 'Suppliers', 'Products'
  record_id UUID NOT NULL, -- ID of the target record to modify
  record_display_name TEXT, -- e.g., 'Batch #B-1042', 'Gulf Foods'
  action_type TEXT NOT NULL CHECK (action_type IN ('edit', 'delete')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

-- 2. Create select, insert, and update policies
DROP POLICY IF EXISTS "Change requests select policy" ON public.change_requests;
CREATE POLICY "Change requests select policy" ON public.change_requests
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Change requests insert policy" ON public.change_requests;
CREATE POLICY "Change requests insert policy" ON public.change_requests
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Change requests update policy" ON public.change_requests;
CREATE POLICY "Change requests update policy" ON public.change_requests
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('super-admin', 'admin'))
  WITH CHECK (public.get_user_role() IN ('super-admin', 'admin'));
