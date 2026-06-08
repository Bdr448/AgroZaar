const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const index = trimmed.indexOf('=');
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
    console.warn("Could not read .env file, relying on environment variables:", err.message);
  }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function listJobs() {
  console.log("Fetching all user profiles (with service key)...");
  const { data: profiles, error: errProf } = await supabase.from('user_profiles').select('id, name, email, role');
  if (errProf) {
    console.error("Error fetching profiles:", errProf.message);
  } else {
    console.log(`Total profiles found: ${profiles.length}`);
    profiles.forEach(p => console.log(`- [${p.role}] ${p.name} (${p.email}) id: ${p.id}`));
  }

  console.log("Fetching all employees...");
  const { data: employees, error: errEmp } = await supabase.from('employees').select('id, employee_code, designation, department');
  if (errEmp) {
    console.error("Error fetching employees:", errEmp.message);
  } else {
    console.log(`Total employees found: ${employees.length}`);
    employees.forEach(e => console.log(`- ${e.employee_code}: ${e.designation} (${e.department})`));
  }

  console.log("Fetching all salary slips...");
  const { data: slips, error: errSlips } = await supabase.from('salary_slips').select('id, net_pay, status');
  if (errSlips) {
    console.error("Error fetching salary slips:", errSlips.message);
  } else {
    console.log(`Total salary slips found: ${slips.length}`);
    slips.forEach(s => console.log(`- Net Pay: ${s.net_pay}, Status: ${s.status}`));
  }
}

listJobs().catch(console.error);
