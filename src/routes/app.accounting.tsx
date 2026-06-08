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

const VOUCHER_TYPES = ["Journal Voucher", "Payment Voucher", "Receipt Voucher", "Contra Voucher", "Adjustment Voucher"];

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

const REPORTS = ["Trial Balance", "Balance Sheet", "Profit & Loss", "Cash Flow", "Cash Book", "Bank Book", "Day Book", "Ledger Statement"];
const MASTERS = ["Chart of Accounts", "Ledger Groups", "Ledgers", "Opening Balances", "Cost Centers"];

function AccountingPage() {
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
          status: "Active"
        };
      });
      setData(mapped);
    } else {
      // Fallback to static mock entries only if DB is completely empty (before seeding)
      setData([
        { vno: "JV-1042", date: "2026-06-02", type: "Journal Voucher", debit: "Purchases", credit: "Sundry Creditors", amount: 184000, status: "Active" },
        { vno: "PV-0931", date: "2026-06-02", type: "Payment Voucher", debit: "Sundry Creditors", credit: "HDFC Bank", amount: 95000, status: "Active" },
        { vno: "RV-0772", date: "2026-06-01", type: "Receipt Voucher", debit: "HDFC Bank", credit: "Sundry Debtors", amount: 142000, status: "Active" }
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
    { key: "amount", header: "Amount", align: "right", render: (r) => <span className="font-semibold">{inr(r.amount)}</span> },
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
        <StatCard label="Total debits" value={inr(data.reduce((acc, r) => acc + r.amount, 0))} icon={Scale} tone="primary" />
        <StatCard label="Bank balance" value={inr(312500)} icon={Wallet} tone="brown" />
        <StatCard label="Vouchers (MTD)" value={String(data.length)} icon={BookOpen} tone="accent" />
        <StatCard label="Ledgers" value="74" icon={Building2} tone="primary" />
      </div>

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-1">
        {(["vouchers", "masters", "reports"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t === "masters" ? "Accounting Masters" : t === "reports" ? "Financial Reports" : "Vouchers"}
          </button>
        ))}
      </div>

      {tab === "vouchers" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {VOUCHER_TYPES.map((v) => (
              <span key={v} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                {v}
              </span>
            ))}
          </div>
          {loading ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-card/60">
              <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading vouchers...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={data} />
          )}
          <div className="mt-4 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Approval:</span> Large entries route Accountant → Finance Manager → Owner. Transactions are never deleted — only Active, Cancelled or Reversed.
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
                <button className="inline-flex items-center gap-1 self-start rounded-md border border-input px-3 py-1.5 text-xs hover:bg-secondary">
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
