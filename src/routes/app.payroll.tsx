import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Wallet, FileText, Download, Plus, BadgeIndianRupee, CalendarClock } from "lucide-react";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { useSession } from "@/lib/erp/auth";

export const Route = createFileRoute("/app/payroll")({
  head: () => ({ meta: [{ title: "Payroll & Salary — Agrozaar Foods LLP ERP" }] }),
  component: PayrollPage,
});

interface SalaryRow extends Record<string, unknown> {
  code: string;
  name: string;
  dept: string;
  designation: string;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  net: number;
  status: string;
}

const SALARY_DATA: SalaryRow[] = [
  { code: "EMP-001", name: "Rakesh Mehta", dept: "Production", designation: "Plant Supervisor", basic: 32000, hra: 9600, allowances: 4000, deductions: 3800, net: 41800, status: "Processed" },
  { code: "EMP-002", name: "Sunita Rao", dept: "Quality", designation: "QC Analyst", basic: 28000, hra: 8400, allowances: 3000, deductions: 3200, net: 36200, status: "Processed" },
  { code: "EMP-003", name: "Imran Shaikh", dept: "Warehouse", designation: "Store Keeper", basic: 22000, hra: 6600, allowances: 2500, deductions: 2600, net: 28500, status: "Pending" },
  { code: "EMP-004", name: "Priya Nair", dept: "Sales", designation: "Sales Executive", basic: 26000, hra: 7800, allowances: 5000, deductions: 3000, net: 35800, status: "Pending" },
  { code: "EMP-005", name: "Vikram Joshi", dept: "Accounts", designation: "Accountant", basic: 30000, hra: 9000, allowances: 3500, deductions: 3500, net: 39000, status: "Processed" },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function PayrollPage() {
  const user = useSession();
  const [tab, setTab] = useState<"register" | "master" | "reports">("register");
  if (!user) return null;

  // Employees see only their own salary.
  const isEmployee = !["super-admin", "admin", "accountant", "partner"].includes(user.role);
  const rows = isEmployee ? SALARY_DATA.slice(0, 1) : SALARY_DATA;

  const totalNet = rows.reduce((s, r) => s + r.net, 0);
  const processed = rows.filter((r) => r.status === "Processed").length;

  const columns: Column<SalaryRow>[] = [
    { key: "code", header: "Code", sortable: true },
    { key: "name", header: "Employee", sortable: true },
    { key: "dept", header: "Department" },
    { key: "designation", header: "Designation" },
    { key: "basic", header: "Basic", align: "right", render: (r) => inr(r.basic) },
    { key: "hra", header: "HRA", align: "right", render: (r) => inr(r.hra) },
    { key: "deductions", header: "Deductions", align: "right", render: (r) => inr(r.deductions) },
    { key: "net", header: "Net Pay", align: "right", render: (r) => <span className="font-semibold">{inr(r.net)}</span> },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge label={r.status} tone={r.status === "Processed" ? "success" : "warning"} />,
    },
    {
      key: "code",
      header: "Slip",
      align: "right",
      render: () => (
        <button className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-secondary">
          <Download className="h-3.5 w-3.5" /> PDF
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={isEmployee ? "My Salary" : "Payroll & Salary Management"}
        subtitle={isEmployee ? "Your salary details and slips" : "Monthly payroll processing, salary master and reports"}
        action={
          !isEmployee && (
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Run Payroll
            </button>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Net payable" value={inr(totalNet)} icon={Wallet} tone="primary" />
        <StatCard label="Employees" value={String(rows.length)} icon={Users} tone="brown" />
        <StatCard label="Processed" value={String(processed)} icon={BadgeIndianRupee} tone="accent" />
        <StatCard label="Pay cycle" value="Jun 2026" icon={CalendarClock} tone="primary" />
      </div>

      {!isEmployee && (
        <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-1">
          {(["register", "master", "reports"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {t === "master" ? "Salary Master" : t === "register" ? "Payroll Register" : "Reports"}
            </button>
          ))}
        </div>
      )}

      {(tab === "register" || isEmployee) && <DataTable columns={columns} data={rows} />}

      {!isEmployee && tab === "master" && (
        <Panel title="Salary Master Structure">
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {["Basic Salary", "HRA", "Allowances", "PF", "ESIC", "PT", "Bonus", "Incentives"].map((f) => (
              <div key={f} className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{f}</p>
                <p className="mt-1 text-sm font-medium text-foreground">Configurable component</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {!isEmployee && tab === "reports" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {["Salary Register", "Department Salary Cost", "Employee Salary History", "Payroll Analytics"].map((r) => (
            <Panel key={r}>
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium text-foreground">{r}</p>
                </div>
                <button className="inline-flex items-center gap-1 rounded-md border border-input px-3 py-1.5 text-xs hover:bg-secondary">
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {!isEmployee && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Approval flow:</span> HR → Accounts → Management
        </div>
      )}
    </>
  );
}
