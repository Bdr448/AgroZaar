const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load local .env variables
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

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// Initialize Supabase Client with Admin privilege (Service Role Key)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEMO_USERS = [
  { email: "owner@agrozaar.com", name: "Sharad Patel", role: "super-admin" },
  { email: "admin@agrozaar.com", name: "Admin User", role: "admin" },
  { email: "partner@agrozaar.com", name: "Business Partner", role: "partner" },
  { email: "supervisor@agrozaar.com", name: "Plant Supervisor", role: "supervisor" },
  { email: "sales@agrozaar.com", name: "Sales Executive", role: "sales" },
  { email: "accountant@agrozaar.com", name: "Accounts Manager", role: "accountant" },
  { email: "warehouse@agrozaar.com", name: "Warehouse User", role: "warehouse" },
  { email: "qc@agrozaar.com", name: "QC Manager", role: "qc-manager" },
  { email: "distributor@agrozaar.com", name: "Distributor User", role: "distributor" },
  { email: "retailer@agrozaar.com", name: "Retailer User", role: "retailer" },
];

async function seed() {
  console.log("Seeding ERP Demo Users in Supabase Auth...");

  for (const u of DEMO_USERS) {
    const password = "password123";
    console.log(`- Creating user: ${u.name} (${u.role}) -> ${u.email}`);

    // Create user in auth.users (will automatically trigger trigger to user_profiles)
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: u.name,
        role: u.role,
      },
    });

    if (error) {
      if (error.message.includes("already exists") || error.message.includes("already registered")) {
        console.log(`  User ${u.email} already exists. Skipping.`);
      } else {
        console.error(`  Error creating ${u.email}:`, error.message);
      }
    } else {
      console.log(`  User created successfully! ID: ${data.user.id}`);
      
      // Explicitly update profile role in case trigger defaulted it
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ role: u.role, name: u.name })
        .eq("id", data.user.id);
        
      if (updateError) {
        console.error(`  Profile sync update error:`, updateError.message);
      }
    }
  }

  console.log("\nSeeding complete! You can log in using these credentials with password 'password123'");
}

seed().catch(console.error);
