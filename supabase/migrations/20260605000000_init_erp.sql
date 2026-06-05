-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create custom user role type
CREATE TYPE user_role AS ENUM (
  'super-admin',
  'admin',
  'partner',
  'supervisor',
  'sales',
  'accountant',
  'warehouse',
  'qc-manager',
  'distributor',
  'retailer'
);

-- ====================================================================
-- USER MANAGEMENT & RBAC
-- ====================================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role user_role NOT NULL DEFAULT 'warehouse',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Automatically sync Supabase Auth users to public.user_profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'ERP User'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'warehouse'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ====================================================================
-- DELEGATED AUTHORITY
-- ====================================================================

CREATE TABLE delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delegatee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  delegator_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  permissions TEXT[] NOT NULL,
  duration TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_delegations_updated_at
BEFORE UPDATE ON delegations
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE delegation_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  permission_source TEXT NOT NULL CHECK (permission_source IN ('Role Permission', 'Delegated Authority'))
);

-- ====================================================================
-- CLIENTS, SUPPLIERS, PRODUCTS
-- ====================================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  gstin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL CHECK (address_type IN ('billing', 'shipping')),
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  pincode TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  gstin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  hsn_code TEXT,
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  shelf_life_days INT,
  batch_tracking BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('standard', 'distributor', 'retailer')),
  price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, tier)
);

-- ====================================================================
-- WAREHOUSE & INVENTORY (STOCK LEDGER)
-- ====================================================================

CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity NUMERIC(12,4) NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'production_input', 'production_output', 'sales_dispatch', 'adjustment', 'transfer')),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE VIEW warehouse_stock AS
SELECT 
  warehouse_id,
  product_id,
  SUM(quantity) as stock_quantity
FROM stock_movements
GROUP BY warehouse_id, product_id;

-- ====================================================================
-- PRODUCTION & QUALITY CONTROL
-- ====================================================================

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC(12,4) NOT NULL,
  UNIQUE(recipe_id, ingredient_product_id)
);

CREATE TABLE production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'grinding', 'packing', 'completed', 'cancelled')),
  planned_qty NUMERIC(12,4) NOT NULL,
  actual_qty NUMERIC(12,4),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE qc_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
  moisture NUMERIC(5,2) NOT NULL,
  aroma TEXT NOT NULL,
  color TEXT NOT NULL,
  lab_results JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  tested_by UUID REFERENCES user_profiles(id),
  tested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- SALES & EXPORT
-- ====================================================================

CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  valid_till DATE NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  tax_total NUMERIC(12,2) NOT NULL,
  grand_total NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'dispatched', 'delivered', 'cancelled')),
  grand_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE delivery_challans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  challan_number TEXT NOT NULL UNIQUE,
  dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vehicle_details TEXT
);

-- ====================================================================
-- ACCOUNTING & DOUBLE-ENTRY LEDGERS
-- ====================================================================

CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE NOT NULL,
  reference_number TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  debit_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  credit_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  CHECK (debit_amount >= 0 AND credit_amount >= 0),
  CHECK (debit_amount > 0 OR credit_amount > 0)
);

-- ====================================================================
-- PAYROLL
-- ====================================================================

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  employee_code TEXT NOT NULL UNIQUE,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  bank_account TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employee_salary_structure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
  basic NUMERIC(12,2) NOT NULL,
  hra NUMERIC(12,2) NOT NULL,
  allowances NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  deductions NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_month TEXT NOT NULL, -- Format: YYYY-MM
  status TEXT NOT NULL CHECK (status IN ('draft', 'processed', 'approved')),
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE salary_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  basic NUMERIC(12,2) NOT NULL,
  hra NUMERIC(12,2) NOT NULL,
  allowances NUMERIC(12,2) NOT NULL,
  deductions NUMERIC(12,2) NOT NULL,
  net_pay NUMERIC(12,2) NOT NULL,
  pdf_storage_path TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
  UNIQUE(payroll_run_id, employee_id)
);

-- ====================================================================
-- OWNER VAULT (ENCRYPTED)
-- ====================================================================

CREATE TABLE vault_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE vault_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES vault_categories(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  -- Storing standard values; but RLS policy restricts reading completely to super-admin
  secret_value BYTEA NOT NULL, -- PGP Encrypted
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vault_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- 1. Enable RLS on all public tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegation_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_salary_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_access_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create Security Helper Functions
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Define generic access policies
CREATE POLICY "Super Admins have full access on everything"
  ON user_profiles FOR ALL TO authenticated USING (get_user_role() = 'super-admin');

-- User Profiles policy
CREATE POLICY "Users can read their own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR get_user_role() IN ('super-admin', 'admin'));

-- Products and pricing policies
CREATE POLICY "Anyone authenticated can view products"
  ON products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only super-admin, admin, supervisor can edit products"
  ON products FOR ALL TO authenticated
  USING (get_user_role() IN ('super-admin', 'admin', 'supervisor'));

-- Stock ledger policies
CREATE POLICY "Anyone authenticated can view warehouses and inventory"
  ON warehouses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Warehouse staff, admin, and supervisor can edit stock"
  ON stock_movements FOR ALL TO authenticated
  USING (get_user_role() IN ('super-admin', 'admin', 'supervisor', 'warehouse'));

-- Accounting ledger policies
CREATE POLICY "Only Accountant and Admins can view or write journal entries"
  ON journal_entries FOR ALL TO authenticated
  USING (get_user_role() IN ('super-admin', 'admin', 'accountant'));

CREATE POLICY "Only Accountant and Admins can view or write journal lines"
  ON journal_lines FOR ALL TO authenticated
  USING (get_user_role() IN ('super-admin', 'admin', 'accountant'));

-- Owner vault policies: Strictly Super-Admin Only
CREATE POLICY "Vault Categories - super-admin only"
  ON vault_categories FOR ALL TO authenticated USING (get_user_role() = 'super-admin');

CREATE POLICY "Vault Records - super-admin only"
  ON vault_records FOR ALL TO authenticated USING (get_user_role() = 'super-admin');

CREATE POLICY "Vault Access Logs - super-admin only"
  ON vault_access_logs FOR ALL TO authenticated USING (get_user_role() = 'super-admin');
