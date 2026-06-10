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
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSelect() {
  console.log("Signing in as supervisor@agrozaar.com...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "supervisor@agrozaar.com",
    password: "password123",
  });

  if (authError) {
    console.error("Auth failed:", authError.message);
    return;
  }

  console.log("Logged in successfully. User ID:", authData.user.id);

  console.log("Querying salary slips with anon client...");
  const { data, error } = await supabase.from("salary_slips").select(`
      id,
      basic,
      net_pay,
      status
    `);

  if (error) {
    console.error("Error fetching salary slips:", error.message);
  } else {
    console.log("Successfully fetched joined data:", JSON.stringify(data, null, 2));
  }
}

testSelect().catch(console.error);
