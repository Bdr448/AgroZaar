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
  console.log("Connecting to PostgreSQL...");
  await client.connect();
  console.log("Connected successfully!");

  // Check trigger function definition
  const res = await client.query(`
    SELECT routine_definition 
    FROM information_schema.routines 
    WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';
  `);

  if (res.rows.length === 0) {
    console.log("Trigger function 'handle_new_user' not found!");
  } else {
    console.log("Trigger function definition:\n", res.rows[0].routine_definition);
  }

  // Check enum types
  const typesRes = await client.query(`
    SELECT typname FROM pg_type WHERE typname = 'user_role';
  `);
  console.log("User role type exists:", typesRes.rows.length > 0);

  await client.end();
}

main().catch((err) => {
  console.error("Database connection error:", err);
  process.exit(1);
});
