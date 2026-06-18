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

async function downloadSalarySlipPDF(row: SalaryRow) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  const BRAND = { r: 37, g: 99, b: 235 }; // royal blue #2563EB
  const DARK = { r: 30, g: 41, b: 59 }; // slate-800
  const LIGHT = { r: 248, g: 250, b: 252 }; // slate-50

  // Top edge brand color bar (print-friendly accent)
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, W, 8, "F");

  // Company name
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("AGROZAAR FOODS LLP", 40, 46);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text("Premium Spices & Food Products", 40, 60);
  doc.text("GSTIN: 24ABCDE1234F1Z5  |  FSSAI: 10023012000001", 40, 73);

  // SALARY SLIP badge (print-friendly right aligned border badge)
  doc.setDrawColor(BRAND.r, BRAND.g, BRAND.b);
  doc.setLineWidth(1.5);
  doc.roundedRect(W - 165, 28, 125, 34, 4, 4, "D");
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SALARY SLIP", W - 102, 50, { align: "center" });

  // Employee Info
  let y = 115;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.text("EMPLOYEE DETAILS", 40, y);

  doc.setFillColor(LIGHT.r, LIGHT.g, LIGHT.b);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.roundedRect(40, y + 8, W - 80, 56, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);

  // Left column
  doc.setFont("helvetica", "bold");
  doc.text("Employee Name:", 50, y + 26);
  doc.setFont("helvetica", "normal");
  doc.text(row.name, 140, y + 26);

  doc.setFont("helvetica", "bold");
  doc.text("Employee Code:", 50, y + 44);
  doc.setFont("helvetica", "normal");
  doc.text(row.code, 140, y + 44);

  // Right column
  doc.setFont("helvetica", "bold");
  doc.text("Department:", W / 2 + 10, y + 26);
  doc.setFont("helvetica", "normal");
  doc.text(row.dept, W / 2 + 90, y + 26);

  doc.setFont("helvetica", "bold");
  doc.text("Designation:", W / 2 + 10, y + 44);
  doc.setFont("helvetica", "normal");
  doc.text(row.designation, W / 2 + 90, y + 44);

  // Salary Components Table
  y = 200;
  const earnings = [
    ["Basic Salary", row.basic],
    ["HRA", row.hra],
    ["Allowances", row.allowances],
  ];
  const deductions = [
    ["Deductions (Taxes, PF, etc.)", row.deductions],
  ];

  const fmtVal = (val: number) => "Rs. " + val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  autoTable(doc, {
    startY: y,
    head: [["Component Type", "Description", "Amount"]],
    body: [
      ...earnings.map(([desc, amt]) => ["Earning", desc, fmtVal(amt as number)]),
      ...deductions.map(([desc, amt]) => ["Deduction", desc, fmtVal(amt as number)]),
    ],
    headStyles: {
      fillColor: [37, 99, 235], // royal blue
      textColor: [255, 255, 255], // white text
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: W - 320 },
      2: { cellWidth: 140, halign: "right" },
    },
    margin: { left: 40, right: 40 },
    tableLineWidth: 0.3,
    tableLineColor: [226, 232, 240],
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;

  // Net Pay Block (print-friendly border box with light blue background)
  doc.setFillColor(219, 234, 254); // blue-100
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.setLineWidth(1);
  doc.roundedRect(W - 240, finalY, 200, 36, 4, 4, "FD");

  doc.setTextColor(30, 58, 138); // blue-900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("NET TAKE-HOME PAY", W - 230, finalY + 22);

  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(fmtVal(row.net), W - 50, finalY + 22, { align: "right" });

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(40, pageH - 45, W - 40, pageH - 45);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    "Confidential Document. This is a computer-generated salary slip and does not require a signature.",
    W / 2,
    pageH - 28,
    { align: "center" },
  );

  doc.save(`Salary_Slip_${row.code}_${new Date().toISOString().split("T")[0]}.pdf`);
}

export default function PayrollPage() {
  const user = useSession();
  const [tab, setTab] = useState<"register" | "master" | "reports">("register");
  const [rows, setRows] = useState<SalaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const isEmployee = user
    ? !["super-admin", "admin", "accountant", "partner"].includes(user.role)
    : false;

  const handleRunPayroll = async () => {
    const loadingToast = toast.loading("Calculating payroll and generating slips...");
    try {
      // 1. Get all employees and their salary structures
      const { data: emps, error: empErr } = await supabase
        .from("employees")
        .select("id, employee_code, employee_salary_structure(basic, hra, allowances, deductions)");

      if (empErr) throw new Error(empErr.message);
      if (!emps || emps.length === 0) {
        throw new Error("No employees found in the database. Please seed the database first!");
      }

      // 2. Determine next cycle month (e.g. '2026-07')
      const { data: runs } = await supabase
        .from("payroll_runs")
        .select("cycle_month")
        .order("cycle_month", { ascending: false })
        .limit(1);

      let nextCycle = "2026-06";
      if (runs && runs.length > 0) {
        const lastCycle = runs[0].cycle_month;
        const [year, month] = lastCycle.split("-").map(Number);
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        nextCycle = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
      }

      // 3. Create a new payroll run record
      const { data: newRun, error: runErr } = await supabase
        .from("payroll_runs")
        .insert({
          cycle_month: nextCycle,
          status: "processed",
        })
        .select()
        .single();

      if (runErr) throw new Error(runErr.message);

      // 4. Generate salary slips for each employee based on their structure
      const slipsToInsert = emps.map((emp: any) => {
        const struct = emp.employee_salary_structure?.[0] || {
          basic: 25000,
          hra: 7500,
          allowances: 3000,
          deductions: 2500,
        };
        const basic = Number(struct.basic);
        const hra = Number(struct.hra);
        const allowances = Number(struct.allowances);
        const deductions = Number(struct.deductions);
        const net = basic + hra + allowances - deductions;

        return {
          payroll_run_id: newRun.id,
          employee_id: emp.id,
          basic,
          hra,
          allowances,
          deductions,
          net_pay: net,
          status: "paid",
        };
      });

      const { error: slipsErr } = await supabase.from("salary_slips").insert(slipsToInsert);
      if (slipsErr) throw new Error(slipsErr.message);

      toast.dismiss(loadingToast);
      toast.success(`Payroll processed successfully for cycle ${nextCycle}!`);
      
      // Reload page data by re-fetching
      window.location.reload();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to run payroll");
    }
  };

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
      render: (row) => (
        <button 
          onClick={() => downloadSalarySlipPDF(row)}
          className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-secondary"
        >
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
            <button 
              onClick={handleRunPayroll}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
            >
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
                <button 
                  onClick={() => {
                    const csv = `"Report","${r}"\n"Generated","${new Date().toLocaleString()}"\n"Company","Agrozaar Foods LLP"`;
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${r.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-input px-3 py-1.5 text-xs hover:bg-secondary"
                >
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
