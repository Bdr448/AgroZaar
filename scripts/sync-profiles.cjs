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

async function sync() {
  console.log("Fetching auth.users list...");
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Error listing users:", error.message);
    return;
  }

  console.log(`Found ${users.length} users in auth.`);

  const DEMO_USERS_MAP = {
    "owner@agrozaar.com": { name: "Sharad Patel", role: "super-admin" },
    "admin@agrozaar.com": { name: "Admin User", role: "admin" },
    "partner@agrozaar.com": { name: "Business Partner", role: "partner" },
    "supervisor@agrozaar.com": { name: "Plant Supervisor", role: "supervisor" },
    "sales@agrozaar.com": { name: "Sales Executive", role: "sales" },
    "accountant@agrozaar.com": { name: "Accounts Manager", role: "accountant" },
    "warehouse@agrozaar.com": { name: "Warehouse User", role: "warehouse" },
    "qc@agrozaar.com": { name: "QC Manager", role: "qc-manager" },
    "distributor@agrozaar.com": { name: "Distributor User", role: "distributor" },
    "retailer@agrozaar.com": { name: "Retailer User", role: "retailer" },
  };

  for (const user of users) {
    const email = user.email;
    const metadata = DEMO_USERS_MAP[email] || {
      name: user.user_metadata?.name || "ERP User",
      role: user.user_metadata?.role || "warehouse",
    };

    console.log(`Syncing profile for ${email} with ID: ${user.id}...`);

    const { error: insertError } = await supabase.from("user_profiles").upsert({
      id: user.id,
      email: email,
      name: metadata.name,
      role: metadata.role,
    });

    if (insertError) {
      console.error(`  Error syncing profile for ${email}:`, insertError.message);
    } else {
      console.log(`  Profile synced successfully.`);
    }
  }

  console.log("Profile sync complete.");
}

sync().catch(console.error);
