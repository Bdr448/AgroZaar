const fs = require("fs");
const path = require("path");
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

  const migrationPath = path.join(__dirname, "../supabase/migrations/20260612000000_create_landing_page_settings.sql");
  console.log(`Reading migration file: ${migrationPath}`);
  const sql = fs.readFileSync(migrationPath, "utf8");

  console.log("Applying migration (get_user_role recursion fix + landing_page_settings table)...");
  await client.query(sql);
  console.log("Migration applied successfully!");

  await client.end();
}

main().catch((err) => {
  console.error("Migration execution error:", err);
  process.exit(1);
});
