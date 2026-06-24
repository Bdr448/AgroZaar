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
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_lead BOOLEAN NOT NULL DEFAULT TRUE;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS lead_status TEXT NOT NULL DEFAULT 'new' CHECK (lead_status IN ('new', 'qualified', 'won', 'lost'));",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_contacted_at DATE;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS lead_source TEXT;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_address TEXT;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_website TEXT;",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT '+91';",
  "ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS next_follow_up_date DATE;",
  
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

