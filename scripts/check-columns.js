import { createClient } from "@supabase/supabase-js";
import fs from "fs";

function loadEnv() {
  try {
    const envContent = fs.readFileSync(".env", "utf8");
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const index = trimmed.indexOf("=");
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        let value = trimmed.substring(index + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  } catch (err) {
    console.error("Error loading env:", err.message);
  }
}
loadEnv();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("Checking customers table columns...");
  const { data, error } = await supabase
    .from("customers")
    .select("is_lead, lead_status, customer_code")
    .limit(1);

  if (error) {
    console.error("Columns do not exist or query failed:", error.message);
  } else {
    console.log("Columns exist! Customers data:", data);
  }
}

main();
