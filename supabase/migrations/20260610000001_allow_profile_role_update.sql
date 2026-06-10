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

-- 3. Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL, -- e.g., 'Factory Electricity', 'Freight & Transport', 'Raw Spices Inward', 'Packaging Materials', 'Office Stationery', 'Travel & Lodging', 'Employee Welfare', 'Miscellaneous'
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  payment_method TEXT NOT NULL, -- e.g., 'HDFC Bank', 'Cash', 'Petty Cash'
  paid_to TEXT,
  status TEXT NOT NULL DEFAULT 'Approved' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.user_profiles(id)
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Select policy
DROP POLICY IF EXISTS "Expenses select policy" ON public.expenses;
CREATE POLICY "Expenses select policy" ON public.expenses FOR SELECT TO authenticated USING (true);

-- Write policy (for super-admin, admin, partner, accountant)
DROP POLICY IF EXISTS "Expenses write policy" ON public.expenses;
CREATE POLICY "Expenses write policy" ON public.expenses FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant'))
  WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant'));
