-- 1. Allow authenticated users to update their own profile (required for role switching in demo mode)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 2. Allow public (anonymous) website visitors to submit contact forms (inserts into the customers table as CRM leads)
DROP POLICY IF EXISTS "Customers public insert policy" ON public.customers;
CREATE POLICY "Customers public insert policy" ON public.customers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
