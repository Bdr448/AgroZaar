import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users,
  Wallet,
  FileText,
  Download,
  Plus,
  BadgeIndianRupee,
  CalendarClock,
} from "lucide-react";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { useSession } from "@/lib/erp/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function PayrollPage() {
  const user = useSession();
  const [tab, setTab] = useState<"register" | "master" | "reports">("register");
  const [rows, setRows] = useState<SalaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const isEmployee = user
    ? !["super-admin", "admin", "accountant", "partner"].includes(user.role)
    : false;

  useEffect(() => {
    async function loadPayroll() {
      if (!user) return;
      setLoading(true);
      try {
        const { data: slips, error } = await supabase.from("salary_slips").select(`
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
          console.error("Error loading payroll:", error);
          toast.error("Failed to load payroll data: " + error.message);
          return;
        }

        if (slips) {
          const formatted: SalaryRow[] = slips.map((s: any) => {
            const emp = s.employees || {};
            const prof = emp.user_profiles || {};
            return {
              code: emp.employee_code || "EMP-?",
              name: prof.name || "Employee",
              dept: emp.department || "General",
              designation: emp.designation || "Staff",
              basic: Number(s.basic) || 0,
              hra: Number(s.hra) || 0,
              allowances: Number(s.allowances) || 0,
              deductions: Number(s.deductions) || 0,
              net: Number(s.net_pay) || 0,
              status: s.status === "paid" ? "Processed" : "Pending",
            };
          });
          setRows(formatted);
        }
      } catch (err: any) {
        console.error("Exception in loadPayroll:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadPayroll();
    }
  }, [user]);

  if (!user) return null;

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
    {
      key: "net",
      header: "Net Pay",
      align: "right",
      render: (r) => <span className="font-semibold">{inr(r.net)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge label={r.status} tone={r.status === "Processed" ? "success" : "warning"} />
      ),
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
        subtitle={
          isEmployee
            ? "Your salary details and slips"
            : "Monthly payroll processing, salary master and reports"
        }
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
        <StatCard
          label="Processed"
          value={String(processed)}
          icon={BadgeIndianRupee}
          tone="accent"
        />
        <StatCard label="Pay cycle" value="Jun 2026" icon={CalendarClock} tone="primary" />
      </div>

      {!isEmployee && (
        <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-1">
          {(["register", "master", "reports"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {t === "master" ? "Salary Master" : t === "register" ? "Payroll Register" : "Reports"}
            </button>
          ))}
        </div>
      )}

      {(tab === "register" || isEmployee) &&
        (loading ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-card/60">
            <p className="text-sm text-muted-foreground animate-pulse font-medium">
              Loading payroll records...
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={rows} emptyLabel="No salary slips found." />
        ))}

      {!isEmployee && tab === "master" && (
        <Panel title="Salary Master Structure">
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {["Basic Salary", "HRA", "Allowances", "PF", "ESIC", "PT", "Bonus", "Incentives"].map(
              (f) => (
                <div key={f} className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{f}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">Configurable component</p>
                </div>
              ),
            )}
          </div>
        </Panel>
      )}

      {!isEmployee && tab === "reports" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Salary Register",
            "Department Salary Cost",
            "Employee Salary History",
            "Payroll Analytics",
          ].map((r) => (
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
          <span className="font-medium text-foreground">Approval flow:</span> HR → Accounts →
          Management
        </div>
      )}
    </>
  );
}
