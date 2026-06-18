const { Client } = require("pg");

const client = new Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.wefogwllfidvnkxgswjd",
  password: "Bhavya@12345@",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Connecting to Supabase PostgreSQL Database on port 6543...");
  await client.connect();
  console.log("Connected successfully!");
  await client.end();
}

main().catch(console.error);
