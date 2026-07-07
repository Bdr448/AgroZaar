const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const client = new Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.wefogwllfidvnkxgswjd",
  password: "Bhavya@12345@",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("Connected to Supabase Postgres database.");

  const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "20260624000000_extend_leads_and_customers.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  console.log("Executing SQL migration...");
  
  await client.query(sql);
  console.log("Migration executed successfully!");

  // Mark all existing customers as not leads (is_lead = false) so that only new entries default to leads
  console.log("Marking existing customers as is_lead = false...");
  const updateRes = await client.query("UPDATE public.customers SET is_lead = false WHERE is_lead IS NULL OR is_lead = true;");
  console.log(`Updated ${updateRes.rowCount} existing customer rows.`);

  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
