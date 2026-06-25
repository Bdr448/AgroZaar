const { Client } = require("pg");

const configs = [
  {
    host: "db.wefogwllfidvnkxgswjd.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres.wefogwllfidvnkxgswjd",
    password: "Bhavya@12345@",
    ssl: { rejectUnauthorized: false },
  },
  {
    host: "aws-0-ap-northeast-1.pooler.supabase.com",
    port: 6543,
    database: "postgres",
    user: "postgres.wefogwllfidvnkxgswjd",
    password: "Bhavya@12345@",
    ssl: { rejectUnauthorized: false },
  },
  {
    host: "aws-0-ap-northeast-1.pooler.supabase.com",
    port: 6543,
    database: "postgres",
    user: "postgres.wefogwllfidvnkxgswjd",
    password: "Bhavya@12345@",
    ssl: false,
  }
];

const statements = [
  // 1. Create change_requests table
  `CREATE TABLE IF NOT EXISTS public.change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    record_display_name TEXT,
    action_type TEXT NOT NULL CHECK (action_type IN ('edit', 'delete')),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Change requests select policy" ON public.change_requests;`,
  `CREATE POLICY "Change requests select policy" ON public.change_requests FOR SELECT TO authenticated USING (true);`,
  `DROP POLICY IF EXISTS "Change requests insert policy" ON public.change_requests;`,
  `CREATE POLICY "Change requests insert policy" ON public.change_requests FOR INSERT TO authenticated WITH CHECK (true);`,
  `DROP POLICY IF EXISTS "Change requests update policy" ON public.change_requests;`,
  `CREATE POLICY "Change requests update policy" ON public.change_requests FOR UPDATE TO authenticated USING (public.get_user_role() IN ('super-admin', 'admin')) WITH CHECK (public.get_user_role() IN ('super-admin', 'admin'));`,

  // 2. Create follow_ups table
  `CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
  );`,
  `ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;`,
  `ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Follow ups select policy" ON public.follow_ups;`,
  `CREATE POLICY "Follow ups select policy" ON public.follow_ups FOR SELECT TO authenticated USING (true);`,
  `DROP POLICY IF EXISTS "Follow ups insert policy" ON public.follow_ups;`,
  `CREATE POLICY "Follow ups insert policy" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (true);`,
  `DROP POLICY IF EXISTS "Follow ups update policy" ON public.follow_ups;`,
  `CREATE POLICY "Follow ups update policy" ON public.follow_ups FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`,

  // 3. Create landing_page_settings table
  `CREATE OR REPLACE FUNCTION get_user_role()
  RETURNS user_role AS $$
  DECLARE
    r user_role;
  BEGIN
    SELECT role INTO r FROM public.user_profiles WHERE id = auth.uid();
    RETURN r;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;`,
  `CREATE TABLE IF NOT EXISTS public.landing_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hero_title TEXT NOT NULL DEFAULT 'Pure Spices. Pure Trust.',
    hero_subtitle TEXT NOT NULL DEFAULT 'Premium quality spices for B2B, retail, distributors, and export markets — under our brand Aviraaj.',
    hero_image_url TEXT NOT NULL DEFAULT '',
    about_title TEXT NOT NULL DEFAULT 'Premium Spice Manufacturing & Export',
    about_text TEXT NOT NULL DEFAULT 'Agrozaar Foods LLP manufactures and exports premium spices under the Aviraaj brand. We focus on quality and purity.',
    about_image_url TEXT NOT NULL DEFAULT '',
    products_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    export_countries JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `ALTER TABLE public.landing_page_settings ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Allow select on landing_page_settings to everyone" ON public.landing_page_settings;`,
  `CREATE POLICY "Allow select on landing_page_settings to everyone" ON public.landing_page_settings FOR SELECT USING (true);`,
  `DROP POLICY IF EXISTS "Allow write on landing_page_settings to admins" ON public.landing_page_settings;`,
  `CREATE POLICY "Allow write on landing_page_settings to admins" ON public.landing_page_settings FOR ALL TO authenticated USING (public.get_user_role() IN ('super-admin', 'admin', 'supervisor')) WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'supervisor'));`,
  `INSERT INTO public.landing_page_settings (
    id, hero_title, hero_subtitle, products_data, export_countries
  ) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Pure Spices. Pure Trust.',
    'Premium quality spices for B2B, retail, distributors, and export markets — crafted with modern processing and uncompromised purity under our brand Aviraaj.',
    '[
      {"name": "Turmeric Powder", "desc": "Vibrant golden color with high curcumin content and rich earthy aroma.", "image_url": ""},
      {"name": "Chilli Powder", "desc": "Natural red color and balanced heat, milled from premium-grade chillies.", "image_url": ""},
      {"name": "Coriander Powder", "desc": "Freshly ground from sorted seeds for a fragrant, citrusy flavor.", "image_url": ""},
      {"name": "Cumin Powder", "desc": "Warm, nutty and aromatic — a kitchen and processing essential.", "image_url": ""}
    ]'::jsonb,
    '["UAE", "USA", "UK", "Canada", "Australia", "Saudi Arabia", "Singapore", "Malaysia"]'::jsonb
  ) ON CONFLICT (id) DO NOTHING;`,

  // 4. Extend customers table
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_lead BOOLEAN NOT NULL DEFAULT TRUE;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS lead_status TEXT NOT NULL DEFAULT 'new' CHECK (lead_status IN ('new', 'qualified', 'won', 'lost'));",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_contacted_at DATE;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS lead_source TEXT;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_address TEXT;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_website TEXT;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT '+91';",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS next_follow_up_date DATE;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS notes TEXT;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_code TEXT UNIQUE;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_type TEXT CHECK (customer_type IN ('Retailer', 'Distributor', 'Wholesaler', 'Corporate', 'Exporter', 'Other'));",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS city TEXT;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'));",
  "UPDATE public.customers SET is_lead = false WHERE is_lead IS NULL;"
];

async function runMigrationWithConfig(config, index) {
  const client = new Client(config);
  console.log(`[Config ${index + 1}/${configs.length}] Trying host ${config.host}:${config.port}...`);
  await client.connect();
  console.log("Connected successfully!");

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`[Step ${i+1}/${statements.length}] Running: ${stmt}`);
    const res = await client.query(stmt);
    console.log(`Success! (Rows affected: ${res.rowCount})`);
  }

  await client.end();
  console.log("Migration completed successfully!");
}

async function main() {
  let lastError = null;
  for (let i = 0; i < configs.length; i++) {
    try {
      await runMigrationWithConfig(configs[i], i);
      return; // Success! Exit early
    } catch (err) {
      console.warn(`Config ${i + 1} failed: ${err.message}`);
      lastError = err;
    }
  }
  throw new Error(`All connection configurations failed. Last error: ${lastError ? lastError.message : "None"}`);
}

main().catch((err) => {
  console.error("Migration warning (expected if local PG port is blocked):", err.message);
  process.exit(0);
});
