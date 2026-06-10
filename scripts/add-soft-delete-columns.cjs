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

  console.log("Adding is_deleted columns for soft delete support...");
  await client.query(`
    ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  console.log("Updating select policies to handle soft delete or keep it simple...");
  // Note: RLS policies will still allow SELECT, but we will filter is_deleted = false in frontend or policies if we want.
  // We'll filter it in the frontend queries.

  console.log("Soft delete columns added successfully!");
  await client.end();
}

main().catch((err) => {
  console.error("Database connection or execution error:", err);
  process.exit(1);
});
