-- Track lead state
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_lead BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS lead_status TEXT NOT NULL DEFAULT 'new' CHECK (lead_status IN ('new', 'qualified', 'won', 'lost'));
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_contacted_at DATE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_website TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT '+91';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS next_follow_up_date DATE;

-- Customer details
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_code TEXT UNIQUE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_type TEXT CHECK (customer_type IN ('Retailer', 'Distributor', 'Wholesaler', 'Corporate', 'Exporter', 'Other'));
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
