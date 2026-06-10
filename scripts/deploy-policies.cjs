const { Client } = require("pg");

const client = new Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.wefogwllfidvnkxgswjd",
  password: "Bhavya@12345@",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Connecting to Supabase PostgreSQL Database...");
  await client.connect();
  console.log("Connected successfully!");

  console.log("Applying all missing Row Level Security (RLS) policies...");
  await client.query(`
    -- 1. Customers & Addresses
    DROP POLICY IF EXISTS "Customers select policy" ON public.customers;
    DROP POLICY IF EXISTS "Customers write policy" ON public.customers;
    CREATE POLICY "Customers select policy" ON public.customers FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Customers write policy" ON public.customers FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'sales'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'sales'));

    DROP POLICY IF EXISTS "Customer addresses select policy" ON public.customer_addresses;
    DROP POLICY IF EXISTS "Customer addresses write policy" ON public.customer_addresses;
    CREATE POLICY "Customer addresses select policy" ON public.customer_addresses FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Customer addresses write policy" ON public.customer_addresses FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'sales'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'sales'));

    -- 2. Suppliers
    DROP POLICY IF EXISTS "Suppliers select policy" ON public.suppliers;
    DROP POLICY IF EXISTS "Suppliers write policy" ON public.suppliers;
    CREATE POLICY "Suppliers select policy" ON public.suppliers FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Suppliers write policy" ON public.suppliers FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'warehouse', 'supervisor'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'warehouse', 'supervisor'));

    -- 3. Product Categories, Brands, Units
    DROP POLICY IF EXISTS "Product categories select policy" ON public.product_categories;
    DROP POLICY IF EXISTS "Product categories write policy" ON public.product_categories;
    CREATE POLICY "Product categories select policy" ON public.product_categories FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Product categories write policy" ON public.product_categories FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'supervisor'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'supervisor'));

    DROP POLICY IF EXISTS "Brands select policy" ON public.brands;
    DROP POLICY IF EXISTS "Brands write policy" ON public.brands;
    CREATE POLICY "Brands select policy" ON public.brands FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Brands write policy" ON public.brands FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'supervisor'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'supervisor'));

    DROP POLICY IF EXISTS "Units select policy" ON public.units;
    DROP POLICY IF EXISTS "Units write policy" ON public.units;
    CREATE POLICY "Units select policy" ON public.units FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Units write policy" ON public.units FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'supervisor'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'supervisor'));

    -- 4. Product Prices
    DROP POLICY IF EXISTS "Product prices select policy" ON public.product_prices;
    DROP POLICY IF EXISTS "Product prices write policy" ON public.product_prices;
    CREATE POLICY "Product prices select policy" ON public.product_prices FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Product prices write policy" ON public.product_prices FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'supervisor', 'partner'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'supervisor', 'partner'));

    -- 5. Warehouses
    DROP POLICY IF EXISTS "Warehouses write policy" ON public.warehouses;
    CREATE POLICY "Warehouses write policy" ON public.warehouses FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'supervisor', 'warehouse'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'supervisor', 'warehouse'));

    -- 6. Recipes & Recipe Items
    DROP POLICY IF EXISTS "Recipes select policy" ON public.recipes;
    DROP POLICY IF EXISTS "Recipes write policy" ON public.recipes;
    CREATE POLICY "Recipes select policy" ON public.recipes FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Recipes write policy" ON public.recipes FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'supervisor', 'qc-manager'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'supervisor', 'qc-manager'));

    DROP POLICY IF EXISTS "Recipe items select policy" ON public.recipe_items;
    DROP POLICY IF EXISTS "Recipe items write policy" ON public.recipe_items;
    CREATE POLICY "Recipe items select policy" ON public.recipe_items FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Recipe items write policy" ON public.recipe_items FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'supervisor', 'qc-manager'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'supervisor', 'qc-manager'));

    -- 7. Production Batches
    DROP POLICY IF EXISTS "Production batches select policy" ON public.production_batches;
    DROP POLICY IF EXISTS "Production batches write policy" ON public.production_batches;
    CREATE POLICY "Production batches select policy" ON public.production_batches FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Production batches write policy" ON public.production_batches FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'supervisor', 'qc-manager', 'warehouse'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'supervisor', 'qc-manager', 'warehouse'));

    -- 8. QC Tests
    DROP POLICY IF EXISTS "QC tests select policy" ON public.qc_tests;
    DROP POLICY IF EXISTS "QC tests write policy" ON public.qc_tests;
    CREATE POLICY "QC tests select policy" ON public.qc_tests FOR SELECT TO authenticated USING (true);
    CREATE POLICY "QC tests write policy" ON public.qc_tests FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'qc-manager', 'supervisor'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'qc-manager', 'supervisor'));

    -- 9. Quotations & Sales Orders & Delivery Challans
    DROP POLICY IF EXISTS "Quotations select policy" ON public.quotations;
    DROP POLICY IF EXISTS "Quotations write policy" ON public.quotations;
    CREATE POLICY "Quotations select policy" ON public.quotations FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Quotations write policy" ON public.quotations FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'sales'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'sales'));

    DROP POLICY IF EXISTS "Sales orders select policy" ON public.sales_orders;
    DROP POLICY IF EXISTS "Sales orders write policy" ON public.sales_orders;
    CREATE POLICY "Sales orders select policy" ON public.sales_orders FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Sales orders write policy" ON public.sales_orders FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'sales', 'warehouse'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'sales', 'warehouse'));

    DROP POLICY IF EXISTS "Delivery challans select policy" ON public.delivery_challans;
    DROP POLICY IF EXISTS "Delivery challans write policy" ON public.delivery_challans;
    CREATE POLICY "Delivery challans select policy" ON public.delivery_challans FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Delivery challans write policy" ON public.delivery_challans FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'sales', 'warehouse'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'partner', 'sales', 'warehouse'));

    -- 10. Chart of Accounts
    DROP POLICY IF EXISTS "Chart of accounts select policy" ON public.chart_of_accounts;
    DROP POLICY IF EXISTS "Chart of accounts write policy" ON public.chart_of_accounts;
    CREATE POLICY "Chart of accounts select policy" ON public.chart_of_accounts FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Chart of accounts write policy" ON public.chart_of_accounts FOR ALL TO authenticated 
      USING (public.get_user_role() IN ('super-admin', 'admin', 'accountant'))
      WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'accountant'));

    -- 11. Delegations & Audit logs
    DROP POLICY IF EXISTS "Delegations select policy" ON public.delegations;
    DROP POLICY IF EXISTS "Delegations write policy" ON public.delegations;
    CREATE POLICY "Delegations select policy" ON public.delegations FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Delegations write policy" ON public.delegations FOR ALL TO authenticated 
      USING (true)
      WITH CHECK (true);

    DROP POLICY IF EXISTS "Delegation audit logs select policy" ON public.delegation_audit_logs;
    DROP POLICY IF EXISTS "Delegation audit logs write policy" ON public.delegation_audit_logs;
    CREATE POLICY "Delegation audit logs select policy" ON public.delegation_audit_logs FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Delegation audit logs write policy" ON public.delegation_audit_logs FOR ALL TO authenticated 
      USING (true)
      WITH CHECK (true);
  `);

  console.log("All policies applied successfully!");
  await client.end();
}

main().catch((err) => {
  console.error("Database connection or execution error:", err);
  process.exit(1);
});
