const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, "../.env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      envContent.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const index = trimmed.indexOf("=");
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          let value = trimmed.substring(index + 1).trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (err) {
    console.warn("Could not read .env file:", err.message);
  }
}
loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testJoin() {
  console.log("Testing join query...");
  const { data, error } = await supabase
    .from("salary_slips")
    .select(`
      id,
      basic,
      hra,
      allowances,
      deductions,
      net_pay,
      status,
      employees (
        employee_code,
        designation,
        department,
        profile_id,
        user_profiles (
          name
        )
      )
    `);

  if (error) {
    console.error("Error running query:", error.message);
  } else {
    console.log("Successfully fetched joined data:", JSON.stringify(data, null, 2));
  }
}

testJoin().catch(console.error);
