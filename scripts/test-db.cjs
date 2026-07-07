const { Client } = require("pg");

const client = new Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.wefogwllfidvnkxgswjd",
  password: "Bhavya@12345@",
  ssl: false,
});

async function main() {
  console.log("Testing connection on port 6543...");
  await client.connect();
  console.log("Connected successfully!");
  const res = await client.query("SELECT 1 as val;");
  console.log("Query success! Result:", res.rows);
  await client.end();
}

main().catch(console.error);
