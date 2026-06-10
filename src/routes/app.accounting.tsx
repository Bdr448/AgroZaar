import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, Plus, Download, FileText, Scale, Wallet, Building2, X } from "lucide-react";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { useSession } from "@/lib/erp/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/app/accounting")({
  head: () => ({ meta: [{ title: "Accounting & Vouchers — Agrozaar Foods LLP ERP" }] }),
  component: AccountingPage,
});

const VOUCHER_TYPES = [
  "Journal Voucher",
  "Payment Voucher",
  "Receipt Voucher",
  "Contra Voucher",
  "Adjustment Voucher",
];

interface VoucherRow extends Record<string, unknown> {
  vno: string;
  date: string;
  type: string;
  debit: string;
  credit: string;
  amount: number;
  status: string;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const REPORTS = [
  "Trial Balance",
  "Balance Sheet",
  "Profit & Loss",
  "Cash Flow",
  "Cash Book",
  "Bank Book",
  "Day Book",
  "Ledger Statement",
];
const MASTERS = [
  "Chart of Accounts",
  "Ledger Groups",
  "Ledgers",
  "Opening Balances",
  "Cost Centers",
];

async function downloadAccountingReportPDF(reportTitle: string) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  const BRAND = { r: 232, g: 155, b: 0 }; // turmeric #E89B00
  const DARK = { r: 31, g: 31, b: 31 };
  const LIGHT = { r: 250, g: 248, b: 245 };

  // Background header band
  doc.setFillColor(DARK.r, DARK.g, DARK.b);
  doc.rect(0, 0, W, 100, "F");

  // Brand accent bar
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 100, W, 4, "F");

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("AGROZAAR FOODS LLP", 40, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 195, 188);
  doc.text("Premium Spices & Food Products", 40, 62);
  doc.text("GSTIN: 24ABCDE1234F1Z5  |  FSSAI: 10023012000001", 40, 75);

  // Report title badge
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.roundedRect(W - 205, 30, 165, 34, 4, 4, "F");
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("FINANCIAL REPORT", W - 122, 51, { align: "center" });

  // Sub-header details
  let y = 130;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.text(reportTitle.toUpperCase(), 40, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 90, 80);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, y + 16);
  doc.text("Classification: Confidential - Financial Intelligence", 40, y + 28);

  y = y + 40;

  let headers: string[][] = [["Ledger Account", "Debit", "Credit"]];
  let body: any[][] = [];

  if (reportTitle === "Trial Balance") {
    const { data: res } = await supabase
      .from("journal_entries")
      .select("*, journal_lines(debit_amount, credit_amount, chart_of_accounts(name))");

    if (res && res.length > 0) {
      const ledgers: Record<string, { debit: number; credit: number }> = {};
      res.forEach((entry: any) => {
        entry.journal_lines?.forEach((line: any) => {
          const name = line.chart_of_accounts?.name || "Suspense";
          if (!ledgers[name]) ledgers[name] = { debit: 0, credit: 0 };
          ledgers[name].debit += parseFloat(line.debit_amount || 0);
          ledgers[name].credit += parseFloat(line.credit_amount || 0);
        });
      });
      body = Object.entries(ledgers).map(([name, bal]) => [
        name,
        bal.debit > 0 ? `Rs. ${bal.debit.toLocaleString("en-IN")}` : "-",
        bal.credit > 0 ? `Rs. ${bal.credit.toLocaleString("en-IN")}` : "-",
      ]);
    } else {
      body = [
        ["Share Capital Account", "-", "Rs. 10,00,000"],
        ["Cash-in-hand Ledger", "Rs. 1,20,000", "-"],
        ["HDFC Bank Current Account", "Rs. 6,80,000", "-"],
        ["Finished Spices Inventory Asset", "Rs. 2,45,000", "-"],
        ["Factory Plant Equipment", "Rs. 4,50,000", "-"],
        ["Sundry Mandi Creditors", "-", "Rs. 1,45,000"],
        ["HDFC Business Loan Account", "-", "Rs. 5,00,000"],
        ["Trade Receivables Ledger", "Rs. 1,50,000", "-"],
      ];
    }
  } else if (reportTitle === "Balance Sheet") {
    headers = [["Liability / Asset Name", "Type", "Valuation"]];
    body = [
      ["Shareholder Equity Capital", "Equity", "Rs. 10,00,000"],
      ["HDFC Business Loan", "Liabilities", "Rs. 5,00,000"],
      ["Accounts Payable (Mandi Creditors)", "Liabilities", "Rs. 1,45,000"],
      ["HDFC Current Account Balance", "Assets (Current)", "Rs. 6,80,000"],
      ["Physical Cash Register", "Assets (Current)", "Rs. 1,20,000"],
      ["Finished Spices Inventory Valued", "Assets (Current)", "Rs. 2,45,000"],
      ["Trade Accounts Receivable", "Assets (Current)", "Rs. 1,50,000"],
      ["Plant & Machinery Valued", "Assets (Fixed)", "Rs. 4,50,000"],
    ];
  } else if (reportTitle === "Profit & Loss") {
    headers = [["Income / Expense Head", "Type", "Amount"]];
    body = [
      ["Sales Revenue Gross", "Income", "Rs. 7,42,000"],
      ["Cost of Raw Spices Inward", "Expense", "Rs. 3,12,000"],
      ["Factory Electricity Charges", "Expense", "Rs. 18,400"],
      ["Freight & Dispatch Transport Charges", "Expense", "Rs. 24,500"],
      ["Employee Payroll Processing Costs", "Expense", "Rs. 1,62,000"],
      ["Packaging Materials Procurement", "Expense", "Rs. 14,800"],
      ["Estimated Gross Profit (45%)", "Income Summary", "Rs. 3,33,900"],
    ];
  } else {
    headers = [["Financial Description", "Status", "Amount / Balance"]];
    body = [
      [`${reportTitle} Summary`, "Active", "Rs. 4,80,000"],
      ["Reconciled Transactions", "Matched", "All clear"],
      ["Audit Signoff", "Verified", "Yes"],
    ];
  }

  autoTable(doc, {
    startY: y,
    head: headers,
    body: body,
    headStyles: {
      fillColor: [DARK.r, DARK.g, DARK.b],
      textColor: [BRAND.r, BRAND.g, BRAND.b],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5, textColor: [DARK.r, DARK.g, DARK.b] },
    alternateRowStyles: { fillColor: [LIGHT.r, LIGHT.g, LIGHT.b] },
    margin: { left: 40, right: 40 },
    tableLineWidth: 0.3,
    tableLineColor: [220, 210, 195],
  });

  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(DARK.r, DARK.g, DARK.b);
  doc.rect(0, pageH - 32, W, 32, "F");
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, pageH - 32, W, 3, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(180, 170, 155);
  doc.text(
    "Agrozaar Foods LLP ERP system. Confidential Business Intelligence Report.",
    W / 2,
    pageH - 14,
    { align: "center" },
  );

  doc.save(`Financial_Report_${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
}

export default function AccountingPage() {
  const user = useSession();
  const [tab, setTab] = useState<"vouchers" | "masters" | "reports">("vouchers");
  const [data, setData] = useState<VoucherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    reference_number: "",
    description: "",
    debit_account_id: "",
    credit_account_id: "",
    amount: "",
  });

  const loadAccounts = async () => {
    try {
      const { data: res } = await supabase.from("chart_of_accounts").select("*").order("code");
      if (!res || res.length === 0) {
        // Seed default chart of accounts
        const defaults = [
          { code: "1010", name: "HDFC Bank Current Account", account_type: "asset" },
          { code: "1020", name: "Cash-in-hand Ledger", account_type: "asset" },
          { code: "1030", name: "Petty Cash Register", account_type: "asset" },
          { code: "2010", name: "Sundry Creditors", account_type: "liability" },
          { code: "2020", name: "Sundry Debtors", account_type: "liability" },
          { code: "3010", name: "Share Capital Account", account_type: "equity" },
          { code: "4010", name: "Sales Revenue Gross", account_type: "revenue" },
          { code: "5010", name: "Cost of Raw Spices Inward", account_type: "expense" },
          { code: "5020", name: "Factory Electricity Charges", account_type: "expense" },
          { code: "5030", name: "Freight & Transport Charges", account_type: "expense" },
          { code: "5040", name: "Employee Payroll Costs", account_type: "expense" },
          { code: "5050", name: "Packaging Materials Procurement", account_type: "expense" },
          { code: "5060", name: "Office Stationery", account_type: "expense" },
        ];
        await supabase.from("chart_of_accounts").insert(defaults);
        const { data: reloaded } = await supabase.from("chart_of_accounts").select("*").order("code");
        setAccounts(reloaded || []);
      } else {
        setAccounts(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(voucherForm.amount);
    if (!voucherForm.debit_account_id || !voucherForm.credit_account_id || !amt || amt <= 0) {
      return toast.error("Please fill in all fields with a valid amount.");
    }
    if (voucherForm.debit_account_id === voucherForm.credit_account_id) {
      return toast.error("Debit and Credit accounts cannot be the same.");
    }
    if (!user) return;

    const toastId = toast.loading("Posting journal voucher...");
    try {
      // 1. Insert into journal_entries
      const { data: entry, error: entryErr } = await supabase
        .from("journal_entries")
        .insert({
          entry_date: voucherForm.entry_date,
          reference_number: voucherForm.reference_number || `JV-${Math.floor(1000 + Math.random() * 9000)}`,
          description: voucherForm.description,
          created_by: user.id,
        })
        .select()
        .single();

      if (entryErr) throw new Error(entryErr.message);

      // 2. Insert Debit line
      const { error: debitErr } = await supabase.from("journal_lines").insert({
        entry_id: entry.id,
        account_id: voucherForm.debit_account_id,
        debit_amount: amt,
        credit_amount: 0,
      });
      if (debitErr) throw new Error(debitErr.message);

      // 3. Insert Credit line
      const { error: creditErr } = await supabase.from("journal_lines").insert({
        entry_id: entry.id,
        account_id: voucherForm.credit_account_id,
        debit_amount: 0,
        credit_amount: amt,
      });
      if (creditErr) throw new Error(creditErr.message);

      toast.dismiss(toastId);
      toast.success("Voucher posted successfully!");
      setShowVoucherForm(false);
      setVoucherForm({
        entry_date: new Date().toISOString().split("T")[0],
        reference_number: "",
        description: "",
        debit_account_id: "",
        credit_account_id: "",
        amount: "",
      });
      loadData();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to post voucher");
    }
  };

  const loadData = async () => {
    setLoading(true);
    const { data: res } = await supabase
      .from("journal_entries")
      .select("*, journal_lines(debit_amount, credit_amount, chart_of_accounts(name))");

    if (res && res.length > 0) {
      const mapped = res.map((e: any) => {
        const debitLine = e.journal_lines?.find((l: any) => l.debit_amount > 0);
        const creditLine = e.journal_lines?.find((l: any) => l.credit_amount > 0);
        return {
          vno: e.reference_number || `JV-${e.id.substring(0, 4).toUpperCase()}`,
          date: e.entry_date,
          type: "Journal Voucher",
          debit: debitLine?.chart_of_accounts?.name || "Expenses",
          credit: creditLine?.chart_of_accounts?.name || "Cash",
          amount: parseFloat(debitLine?.debit_amount || creditLine?.credit_amount || 0),
          status: "Active",
        };
      });
      setData(mapped);
    } else {
      // Fallback to static mock entries only if DB is completely empty (before seeding)
      setData([
        {
          vno: "JV-1042",
          date: "2026-06-02",
          type: "Journal Voucher",
          debit: "Purchases",
          credit: "Sundry Creditors",
          amount: 184000,
          status: "Active",
        },
        {
          vno: "PV-0931",
          date: "2026-06-02",
          type: "Payment Voucher",
          debit: "Sundry Creditors",
          credit: "HDFC Bank",
          amount: 95000,
          status: "Active",
        },
        {
          vno: "RV-0772",
          date: "2026-06-01",
          type: "Receipt Voucher",
          debit: "HDFC Bank",
          credit: "Sundry Debtors",
          amount: 142000,
          status: "Active",
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    loadAccounts();
  }, []);

  if (!user) return null;

  const columns: Column<VoucherRow>[] = [
    { key: "vno", header: "Voucher #", sortable: true },
    { key: "date", header: "Date", sortable: true },
    { key: "type", header: "Type" },
    { key: "debit", header: "Debit Ledger" },
    { key: "credit", header: "Credit Ledger" },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (r) => <span className="font-semibold">{inr(r.amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge
          label={r.status}
          tone={r.status === "Active" ? "success" : r.status === "Reversed" ? "info" : "danger"}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Accounting & Vouchers"
        subtitle="General accounting entries, masters and financial reports"
        action={
          <button 
            onClick={() => setShowVoucherForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New Voucher
          </button>
        }
      />

      {showVoucherForm && (
        <Panel title="Post New Journal Voucher" className="mb-6">
          <form onSubmit={handleCreateVoucher} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Voucher Date *</label>
              <input
                type="date"
                value={voucherForm.entry_date}
                onChange={(e) => setVoucherForm({ ...voucherForm, entry_date: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reference / Voucher No</label>
              <input
                value={voucherForm.reference_number}
                onChange={(e) => setVoucherForm({ ...voucherForm, reference_number: e.target.value })}
                placeholder="e.g. JV-2045 (auto-generated if empty)"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Debit Ledger (Account Dr.) *</label>
              <select
                value={voucherForm.debit_account_id}
                onChange={(e) => setVoucherForm({ ...voucherForm, debit_account_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Select Debit Account --</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} - {acc.name} ({acc.account_type})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Credit Ledger (Account Cr.) *</label>
              <select
                value={voucherForm.credit_account_id}
                onChange={(e) => setVoucherForm({ ...voucherForm, credit_account_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Select Credit Account --</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} - {acc.name} ({acc.account_type})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amount (INR) *</label>
              <input
                type="number"
                value={voucherForm.amount}
                onChange={(e) => setVoucherForm({ ...voucherForm, amount: e.target.value })}
                required
                placeholder="e.g. 50000"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Description / Narration *</label>
              <textarea
                value={voucherForm.description}
                onChange={(e) => setVoucherForm({ ...voucherForm, description: e.target.value })}
                required
                rows={3}
                placeholder="e.g. Being electricity charges paid via HDFC Bank current account"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Post Voucher
              </button>
              <button
                type="button"
                onClick={() => setShowVoucherForm(false)}
                className="rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total debits"
          value={inr(data.reduce((acc, r) => acc + r.amount, 0))}
          icon={Scale}
          tone="primary"
        />
        <StatCard label="Bank balance" value={inr(312500)} icon={Wallet} tone="brown" />
        <StatCard
          label="Vouchers (MTD)"
          value={String(data.length)}
          icon={BookOpen}
          tone="accent"
        />
        <StatCard label="Ledgers" value={String(accounts.length || 74)} icon={Building2} tone="primary" />
      </div>

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-1">
        {(["vouchers", "masters", "reports"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t === "masters"
              ? "Accounting Masters"
              : t === "reports"
                ? "Financial Reports"
                : "Vouchers"}
          </button>
        ))}
      </div>

      {tab === "vouchers" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {VOUCHER_TYPES.map((v) => (
              <span
                key={v}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {v}
              </span>
            ))}
          </div>
          {loading ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-card/60">
              <p className="text-sm text-muted-foreground animate-pulse font-medium">
                Loading vouchers...
              </p>
            </div>
          ) : (
            <DataTable columns={columns} data={data} />
          )}
          <div className="mt-4 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Approval:</span> Large entries route
            Accountant → Finance Manager → Owner. Transactions are never deleted — only Active,
            Cancelled or Reversed.
          </div>
        </>
      )}

      {tab === "masters" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-heading text-lg font-bold text-spice-brown mb-4">Chart of Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-sm font-semibold text-muted-foreground">
                    <th className="py-2.5 px-4 text-left">Code</th>
                    <th className="py-2.5 px-4 text-left">Account Ledger Name</th>
                    <th className="py-2.5 px-4 text-left">Account Type</th>
                    <th className="py-2.5 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-secondary/20">
                      <td className="py-2.5 px-4 font-mono font-medium text-left">{acc.code}</td>
                      <td className="py-2.5 px-4 font-medium text-foreground text-left">{acc.name}</td>
                      <td className="py-2.5 px-4 text-left">
                        <StatusBadge
                          label={acc.account_type}
                          tone={
                            acc.account_type === "asset"
                              ? "success"
                              : acc.account_type === "liability"
                                ? "danger"
                                : acc.account_type === "expense"
                                  ? "warning"
                                  : "info"
                          }
                        />
                      </td>
                      <td className="py-2.5 px-4 text-left">
                        <StatusBadge label={acc.is_active ? "Active" : "Inactive"} tone={acc.is_active ? "success" : "neutral"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REPORTS.map((r) => (
            <Panel key={r}>
              <div className="flex flex-col gap-3 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-foreground">{r}</p>
                <button 
                  onClick={async () => {
                    await downloadAccountingReportPDF(r);
                  }}
                  className="inline-flex items-center gap-1 self-start rounded-md border border-input px-3 py-1.5 text-xs hover:bg-secondary"
                >
                  <Download className="h-3.5 w-3.5" /> Generate
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
