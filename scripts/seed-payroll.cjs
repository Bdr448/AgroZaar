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

const SALARY_SEED = [
  {
    code: "EMP-001",
    email: "supervisor@agrozaar.com",
    name: "Rakesh Mehta",
    dept: "Production",
    designation: "Plant Supervisor",
    basic: 32000,
    hra: 9600,
    allowances: 4000,
    deductions: 3800,
    net: 41800,
    status: "paid",
  },
  {
    code: "EMP-002",
    email: "qc@agrozaar.com",
    name: "Sunita Rao",
    dept: "Quality",
    designation: "QC Analyst",
    basic: 28000,
    hra: 8400,
    allowances: 3000,
    deductions: 3200,
    net: 36200,
    status: "paid",
  },
  {
    code: "EMP-003",
    email: "warehouse@agrozaar.com",
    name: "Imran Shaikh",
    dept: "Warehouse",
    designation: "Store Keeper",
    basic: 22000,
    hra: 6600,
    allowances: 2500,
    deductions: 2600,
    net: 28500,
    status: "pending",
  },
  {
    code: "EMP-004",
    email: "sales@agrozaar.com",
    name: "Priya Nair",
    dept: "Sales",
    designation: "Sales Executive",
    basic: 26000,
    hra: 7800,
    allowances: 5000,
    deductions: 3000,
    net: 35800,
    status: "pending",
  },
  {
    code: "EMP-005",
    email: "accountant@agrozaar.com",
    name: "Vikram Joshi",
    dept: "Accounts",
    designation: "Accountant",
    basic: 30000,
    hra: 9000,
    allowances: 3500,
    deductions: 3500,
    net: 39000,
    status: "paid",
  },
];

async function seedPayroll() {
  console.log("Starting payroll seeding...");

  // 1. Clean existing payroll data to avoid constraint issues
  console.log("Cleaning old payroll records...");
  await supabase.from("salary_slips").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("payroll_runs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("employee_salary_structure")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("employees").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 2. Fetch user profiles to link to employees
  const { data: profiles, error: errProf } = await supabase.from("user_profiles").select("*");
  if (errProf) {
    console.error("Error fetching profiles:", errProf.message);
    return;
  }
  const profilesMap = {};
  profiles.forEach((p) => {
    profilesMap[p.email] = p.id;
  });

  // 3. Create a payroll run
  console.log("Creating payroll run...");
  const { data: run, error: errRun } = await supabase
    .from("payroll_runs")
    .insert({
      cycle_month: "2026-06",
      status: "processed",
    })
    .select()
    .single();

  if (errRun) {
    console.error("Error creating payroll run:", errRun.message);
    return;
  }
  console.log(`Created payroll run ID: ${run.id}`);

  // 4. Seed Employees, structures, and slips
  for (const s of SALARY_SEED) {
    const profileId = profilesMap[s.email] || null;
    console.log(`Seeding employee ${s.name} (${s.code}) linked to profile: ${profileId}`);

    const { data: emp, error: errEmp } = await supabase
      .from("employees")
      .insert({
        profile_id: profileId,
        employee_code: s.code,
        designation: s.designation,
        department: s.dept,
        bank_account: "BANK" + Math.floor(100000000 + Math.random() * 900000000),
      })
      .select()
      .single();

    if (errEmp) {
      console.error(`  Error creating employee ${s.name}:`, errEmp.message);
      continue;
    }

    // Create salary structure
    const { error: errStruct } = await supabase.from("employee_salary_structure").insert({
      employee_id: emp.id,
      basic: s.basic,
      hra: s.hra,
      allowances: s.allowances,
      deductions: s.deductions,
    });

    if (errStruct) {
      console.error(`  Error creating structure for ${s.name}:`, errStruct.message);
    }

    // Create salary slip
    const { error: errSlip } = await supabase.from("salary_slips").insert({
      payroll_run_id: run.id,
      employee_id: emp.id,
      basic: s.basic,
      hra: s.hra,
      allowances: s.allowances,
      deductions: s.deductions,
      net_pay: s.net,
      status: s.status,
    });

    if (errSlip) {
      console.error(`  Error creating slip for ${s.name}:`, errSlip.message);
    } else {
      console.log(`  Successfully seeded all data for ${s.name}.`);
    }
  }

  console.log("Payroll seeding complete!");
}

seedPayroll().catch(console.error);
