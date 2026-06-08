-- RLS Policies for Payroll Tables

-- 1. Employees table policies
DROP POLICY IF EXISTS "Employees select policy" ON public.employees;
DROP POLICY IF EXISTS "Employees write policy" ON public.employees;

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees select policy" ON public.employees
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant'));

CREATE POLICY "Employees write policy" ON public.employees
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant'))
  WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant'));

-- 2. Employee salary structure table policies
DROP POLICY IF EXISTS "Employee salary structure select policy" ON public.employee_salary_structure;
DROP POLICY IF EXISTS "Employee salary structure write policy" ON public.employee_salary_structure;

ALTER TABLE public.employee_salary_structure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee salary structure select policy" ON public.employee_salary_structure
  FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM public.employees WHERE profile_id = auth.uid()) OR 
    public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant')
  );

CREATE POLICY "Employee salary structure write policy" ON public.employee_salary_structure
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant'))
  WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant'));

-- 3. Payroll runs table policies
DROP POLICY IF EXISTS "Payroll runs select policy" ON public.payroll_runs;
DROP POLICY IF EXISTS "Payroll runs write policy" ON public.payroll_runs;

ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payroll runs select policy" ON public.payroll_runs
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Payroll runs write policy" ON public.payroll_runs
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant'))
  WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant'));

-- 4. Salary slips table policies
DROP POLICY IF EXISTS "Salary slips select policy" ON public.salary_slips;
DROP POLICY IF EXISTS "Salary slips write policy" ON public.salary_slips;

ALTER TABLE public.salary_slips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salary slips select policy" ON public.salary_slips
  FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM public.employees WHERE profile_id = auth.uid()) OR 
    public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant')
  );

CREATE POLICY "Salary slips write policy" ON public.salary_slips
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant'))
  WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'accountant'));
