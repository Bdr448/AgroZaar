-- 1. Add soft delete columns
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Add missing SELECT policies for RLS tables so all authenticated roles can read them
DROP POLICY IF EXISTS "Employees select policy" ON public.employees;
CREATE POLICY "Employees select policy" ON public.employees FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Employee salary structure select policy" ON public.employee_salary_structure;
CREATE POLICY "Employee salary structure select policy" ON public.employee_salary_structure FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Payroll runs select policy" ON public.payroll_runs;
CREATE POLICY "Payroll runs select policy" ON public.payroll_runs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Salary slips select policy" ON public.salary_slips;
CREATE POLICY "Salary slips select policy" ON public.salary_slips FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Stock movements select policy" ON public.stock_movements;
CREATE POLICY "Stock movements select policy" ON public.stock_movements FOR SELECT TO authenticated USING (true);
