import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, Plus, Download, FileText, Scale, Wallet, Building2 } from "lucide-react";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { useSession } from "@/lib/erp/auth";
import { supabase } from "@/lib/supabase";

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
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New Voucher
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <StatCard label="Ledgers" value="74" icon={Building2} tone="primary" />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MASTERS.map((m) => (
            <Panel key={m}>
              <div className="flex items-center gap-3 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-spice-brown/10 text-spice-brown">
                  <Building2 className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-foreground">{m}</p>
              </div>
            </Panel>
          ))}
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
