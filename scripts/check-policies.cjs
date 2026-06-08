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

async function checkPolicies() {
  console.log("Querying database policies...");
  
  // We can run raw SQL query using RPC or read it from a system view if postgrest allows it?
  // Wait, does PostgREST allow reading from pg_catalog or pg_policies?
  // Let's try to select from the pg_policies table or pg_catalog.pg_policies.
  // Note: pg_policies is a system view. Let's see if we can query it directly.
  try {
    const { data, error } = await supabase
      .from("pg_policies")
      .select("*");
    
    if (error) {
      console.log("Could not query pg_policies directly via PostgREST:", error.message);
      
      // Let's try checking if RPC functions exist or if we can query RLS state using standard tables.
      // Wait, we can query table RLS status from information_schema if allowed.
    } else {
      console.log("Policies:", data);
    }
  } catch (e) {
    console.error("Exception:", e);
  }
}

checkPolicies().catch(console.error);
