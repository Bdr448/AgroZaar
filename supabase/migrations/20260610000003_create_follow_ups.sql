-- 1. Create follow_ups table
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Add soft delete column to quotations table
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Enable RLS
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS policies
DROP POLICY IF EXISTS "Follow ups select policy" ON public.follow_ups;
CREATE POLICY "Follow ups select policy" ON public.follow_ups
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Follow ups insert policy" ON public.follow_ups;
CREATE POLICY "Follow ups insert policy" ON public.follow_ups
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Follow ups update policy" ON public.follow_ups;
CREATE POLICY "Follow ups update policy" ON public.follow_ups
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
