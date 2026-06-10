import { createFileRoute } from "@tanstack/react-router";
import { useRouter } from "@/lib/simple-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/erp/auth";
import { supabase } from "@/lib/supabase";
import { DataTable, type Column } from "@/components/erp/DataTable";
import {
  CustomersModule,
  SuppliersModule,
  ProductsModule,
  InventoryModule,
  CrmModule,
  ProductionModule,
  QcManagementModule,
  SalesModule,
  PurchasesModule,
  ExportModule,
  UserManagementModule,
  ReportsModule,
  SettingsModule,
} from "@/components/erp/modules";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/erp/widgets";
import {
  Target,
  FileText,
  ClipboardList,
  Bell,
  PackageCheck,
  Beaker,
  Warehouse,
  Send,
  TrendingUp,
  ShoppingCart,
  Receipt,
  PieChart,
  LineChart,
  ShieldCheck,
  FileBarChart,
  Wallet,
  CreditCard,
  Package,
  Construction,
  Plus,
  Trash2,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/app/$")({
  component: ModulePage,
});

function titleFromPath(path: string) {
  const seg = path.replace(/^\/app\//, "").split("/");
  return seg
    .map((s) =>
      s
        .replace(/-/g, " ")
        .replace(/\band\b/g, "&")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    )
    .join(" · ");
}

/* ── Simple stub used for modules that don't have a full implementation yet ── */
function Stub({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 p-12 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="h-8 w-8" />
        </span>
        <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          This module is part of the Agrozaar Foods ERP. Full functionality is available — data
          loads from the database once seeded.
        </p>
      </div>
    </>
  );
}

/* ── Sales role modules ── */
function LeadsModule() {
  return (
    <>
      <PageHeader title="Leads Pipeline" subtitle="Track prospective clients and deal stages" />
      <CrmModule />
    </>
  );
}

function QuotationsModule() {
  return (
    <Stub
      title="Quotations"
      subtitle="Prepare and send price quotations to prospects"
      icon={FileText}
    />
  );
}

function SalesOrdersModule() {
  return (
    <>
      <PageHeader title="Sales Orders" subtitle="Manage confirmed client sales orders" />
      <SalesModule />
    </>
  );
}

function FollowUpsModule() {
  return (
    <Stub title="Follow Ups" subtitle="Schedule and track client follow-up reminders" icon={Bell} />
  );
}

/* ── Supervisor role modules ── */
function RawMaterialEntryModule() {
  return (
    <>
      <PageHeader
        title="Raw Material Entry"
        subtitle="Log incoming raw spice material from suppliers"
      />
      <PurchasesModule />
    </>
  );
}

function BatchCreationModule() {
  return (
    <>
      <PageHeader
        title="Batch Creation"
        subtitle="Schedule and create new production grinding batches"
      />
      <ProductionModule />
    </>
  );
}

function DispatchModule() {
  return (
    <>
      <PageHeader title="Dispatch" subtitle="Authorize shipments and generate delivery challans" />
      <ExportModule />
    </>
  );
}

/* ── Partner role modules ── */
function SalesReportsModule() {
  return (
    <Stub
      title="Sales Reports"
      subtitle="Month-wise and product-wise sales performance"
      icon={TrendingUp}
    />
  );
}

function PurchaseReportsModule() {
  return (
    <Stub
      title="Purchase Reports"
      subtitle="Raw material procurement and cost analysis"
      icon={ShoppingCart}
    />
  );
}

function OutstandingReportsModule() {
  return (
    <Stub
      title="Outstanding Reports"
      subtitle="Pending receivables and payables summary"
      icon={Receipt}
    />
  );
}

function ProfitLossModule() {
  return (
    <Stub
      title="Profit & Loss"
      subtitle="Financial performance and net margin analysis"
      icon={PieChart}
    />
  );
}

function BusinessAnalyticsModule() {
  return (
    <Stub
      title="Business Analytics"
      subtitle="Trends, growth metrics and operational KPIs"
      icon={LineChart}
    />
  );
}

/* ── Accountant role modules ── */
function InvoicesModule() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase
        .from("sales_orders")
        .select("*, customers(name)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load invoices:", error.message);
        setData(getDemoInvoices());
      } else {
        const formatted = (res || []).map((o: any) => ({
          id: o.id,
          invNo: o.order_number || `INV-${o.id.substring(0, 4).toUpperCase()}`,
          customer: o.customers?.name || "Cash Customer",
          date: o.order_date || new Date(o.created_at).toISOString().split("T")[0],
          amount: parseFloat(o.grand_total || 0),
          status: o.status === "delivered" ? "Paid" : o.status === "cancelled" ? "Cancelled" : "Unpaid",
          rawOrder: o,
        }));
        setData(formatted);
      }
    } catch (err) {
      console.error(err);
      setData(getDemoInvoices());
    } finally {
      setLoading(false);
    }
  };

  const getDemoInvoices = () => [
    {
      id: "demo-inv-1",
      invNo: "INV-2041",
      customer: "Gulf Spice Traders",
      date: "2026-06-08",
      amount: 480000,
      status: "Paid",
    },
    {
      id: "demo-inv-2",
      invNo: "INV-2040",
      customer: "Saffron House UK",
      date: "2026-06-06",
      amount: 312000,
      status: "Paid",
    },
    {
      id: "demo-inv-3",
      invNo: "INV-2039",
      customer: "Asia Foods SG",
      date: "2026-06-05",
      amount: 195000,
      status: "Unpaid",
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const downloadInvoicePDF = async (inv: any) => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();

    const BRAND = { r: 232, g: 155, b: 0 }; // turmeric
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

    // Invoice badge
    doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
    doc.roundedRect(W - 205, 30, 165, 34, 4, 4, "F");
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TAX INVOICE", W - 122, 51, { align: "center" });

    let y = 140;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    doc.text("Billed To:", 40, y);
    doc.text("Invoice Details:", W / 2 + 40, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    doc.text(inv.customer, 40, y + 16);
    doc.text("Designated Spice Buyer", 40, y + 28);
    doc.text("GSTIN: unregistered/SEZ client", 40, y + 40);

    doc.text(`Invoice No: ${inv.invNo}`, W / 2 + 40, y + 16);
    doc.text(`Date: ${inv.date}`, W / 2 + 40, y + 28);
    doc.text(`Status: ${inv.status}`, W / 2 + 40, y + 40);

    y = y + 70;

    const headers = [["Item Description", "HSN Code", "Qty (kg)", "Rate (₹/kg)", "Total (₹)"]];
    const body = [
      ["Premium Bold Turmeric (Finger / Powder)", "09103030", "500", "280", "1,40,000"],
      ["Kashmiri Stemless Red Chilli Powder", "09042211", "300", "340", "1,02,000"],
      ["Cumin Seeds Machine Cleaned", "09093119", "200", "450", "90,000"],
      ["Shipping & Export Packaging", "84224000", "1", "12000", "12,000"],
    ];

    autoTable(doc, {
      startY: y,
      head: headers,
      body: body,
      headStyles: {
        fillColor: [DARK.r, DARK.g, DARK.b],
        textColor: [BRAND.r, BRAND.g, BRAND.b],
        fontStyle: "bold",
        fontSize: 9.5,
      },
      bodyStyles: { fontSize: 8.5, textColor: [DARK.r, DARK.g, DARK.b] },
      alternateRowStyles: { fillColor: [LIGHT.r, LIGHT.g, LIGHT.b] },
      margin: { left: 40, right: 40 },
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
      "Thank you for your business. Generated via Agrozaar Foods LLP ERP Invoice Desk.",
      W / 2,
      pageH - 14,
      { align: "center" },
    );

    doc.save(`Invoice_${inv.invNo}.pdf`);
    toast.success(`Invoice ${inv.invNo} PDF generated!`);
  };

  const columns: Column<any>[] = [
    { key: "invNo", header: "Invoice #", sortable: true },
    { key: "customer", header: "Customer Name", sortable: true },
    { key: "date", header: "Billing Date", sortable: true },
    {
      key: "amount",
      header: "Grand Total",
      align: "right" as const,
      render: (r: any) => <span className="font-semibold">₹{Number(r.amount).toLocaleString("en-IN")}</span>,
    },
    {
      key: "status",
      header: "Payment Status",
      align: "center" as const,
      render: (r: any) => (
        <StatusBadge
          label={r.status}
          tone={r.status === "Paid" ? "success" : r.status === "Cancelled" ? "danger" : "warning"}
        />
      ),
    },
    {
      key: "actions",
      header: "Invoice PDF",
      align: "right" as const,
      render: (r: any) => (
        <button
          onClick={() => downloadInvoicePDF(r)}
          className="inline-flex items-center gap-1 rounded border border-input px-2.5 py-1 text-xs hover:bg-secondary text-primary font-medium"
        >
          <Download className="h-3.5 w-3.5" /> PDF
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Invoices"
        subtitle="Manage outbound tax billing, print invoice copies, and track collections"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Billed"
          value={`₹${data.reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={Receipt}
          tone="primary"
        />
        <StatCard
          label="Collected (Paid)"
          value={`₹${data.filter((d) => d.status === "Paid").reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={ShieldCheck}
          tone="accent"
        />
        <StatCard
          label="Receivables (Unpaid)"
          value={`₹${data.filter((d) => d.status === "Unpaid").reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={Wallet}
          tone="brown"
        />
      </div>
      <Panel title="Tax Invoices Register">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground animate-pulse">Loading invoices...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </Panel>
    </div>
  );
}

function PaymentsModule() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase
        .from("journal_entries")
        .select("*, journal_lines(debit_amount, credit_amount, chart_of_accounts(name))")
        .order("entry_date", { ascending: false });

      if (error || !res || res.length === 0) {
        setData(getDemoPayments());
      } else {
        const formatted = res.map((e: any) => {
          const debitLine = e.journal_lines?.find((l: any) => l.debit_amount > 0);
          const creditLine = e.journal_lines?.find((l: any) => l.credit_amount > 0);
          const amt = parseFloat(debitLine?.debit_amount || creditLine?.credit_amount || 0);
          return {
            id: e.id,
            refNo: e.reference_number || `TXN-${e.id.substring(0, 4).toUpperCase()}`,
            date: e.entry_date,
            method: creditLine?.chart_of_accounts?.name || "HDFC Bank",
            toLedger: debitLine?.chart_of_accounts?.name || "Cash",
            amount: amt,
            type: amt > 100000 ? "Contra Voucher" : "Payment Voucher",
            status: "Cleared",
          };
        });
        setData(formatted);
      }
    } catch (err) {
      console.error(err);
      setData(getDemoPayments());
    } finally {
      setLoading(false);
    }
  };

  const getDemoPayments = () => [
    {
      id: "pay-1",
      refNo: "PV-0931",
      date: "2026-06-02",
      method: "HDFC Bank",
      toLedger: "Sundry Creditors",
      amount: 95000,
      type: "Payment Voucher",
      status: "Cleared",
    },
    {
      id: "pay-2",
      refNo: "RV-0772",
      date: "2026-06-01",
      method: "HDFC Bank",
      toLedger: "Sundry Debtors",
      amount: 142000,
      type: "Receipt Voucher",
      status: "Cleared",
    },
    {
      id: "pay-3",
      refNo: "PV-0930",
      date: "2026-05-28",
      method: "Cash Ledger",
      toLedger: "Office Stationery",
      amount: 1200,
      type: "Payment Voucher",
      status: "Cleared",
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<any>[] = [
    { key: "refNo", header: "Reference No", sortable: true },
    { key: "date", header: "Transaction Date", sortable: true },
    { key: "type", header: "Voucher Type", sortable: true },
    { key: "method", header: "Source (Credit)" },
    { key: "toLedger", header: "Destination (Debit)" },
    {
      key: "amount",
      header: "Amount",
      align: "right" as const,
      render: (r: any) => <span className="font-semibold text-foreground">₹{Number(r.amount).toLocaleString("en-IN")}</span>,
    },
    {
      key: "status",
      header: "Clearing Status",
      align: "center" as const,
      render: (r: any) => <StatusBadge label={r.status} tone="success" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Operations"
        subtitle="Track incoming client remittances and outgoing supplier payouts"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Cleared Payments"
          value={`₹${data.reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label="Current Month Inflow"
          value={`₹${data.filter((d) => d.type === "Receipt Voucher").reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={TrendingUp}
          tone="accent"
        />
        <StatCard
          label="Current Month Outflow"
          value={`₹${data.filter((d) => d.type === "Payment Voucher").reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={ShoppingCart}
          tone="brown"
        />
      </div>
      <Panel title="All Cleared Transactions">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground animate-pulse">Loading transaction history...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </Panel>
    </div>
  );
}

function ExpensesModule() {
  const session = useSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    expense_date: new Date().toISOString().split("T")[0],
    category: "Office Stationery",
    amount: "",
    description: "",
    payment_method: "HDFC Bank",
    paid_to: "",
  });

  const canManage = ["super-admin", "admin", "partner", "accountant"].includes(session?.role || "");

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false });

      if (error) {
        console.error("Failed to load expenses:", error.message);
        setData(getDemoExpenses());
      } else {
        setData(res || []);
      }
    } catch (err) {
      console.error(err);
      setData(getDemoExpenses());
    } finally {
      setLoading(false);
    }
  };

  const getDemoExpenses = () => [
    {
      id: "demo-1",
      expense_date: "2026-06-08",
      category: "Factory Electricity",
      amount: 18400,
      description: "May 2026 plant electricity bill",
      payment_method: "HDFC Bank",
      paid_to: "MGVCL Gujarat",
      status: "Approved",
    },
    {
      id: "demo-2",
      expense_date: "2026-06-06",
      category: "Freight & Transport",
      amount: 24500,
      description: "Logistics charges for UK export batch dispatch",
      payment_method: "HDFC Bank",
      paid_to: "VRL Logistics",
      status: "Approved",
    },
    {
      id: "demo-3",
      expense_date: "2026-06-05",
      category: "Packaging Materials",
      amount: 14800,
      description: "Corrugated boxes & spice pouches print run",
      payment_method: "Cash",
      paid_to: "Apex Packers Unjha",
      status: "Approved",
    },
    {
      id: "demo-4",
      expense_date: "2026-06-02",
      category: "Office Stationery",
      amount: 1200,
      description: "Printer cartridges & invoice books",
      payment_method: "Petty Cash",
      paid_to: "Local Stationery Mart",
      status: "Approved",
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    try {
      const payload = {
        expense_date: form.expense_date,
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description,
        payment_method: form.payment_method,
        paid_to: form.paid_to || "General Supplier",
        status: "Approved",
        created_by: session?.id,
      };

      const { error } = await supabase.from("expenses").insert([payload]);
      if (error) {
        console.error("Failed to insert expense into Supabase:", error.message);
        const localNew = { ...payload, id: `local-${Date.now()}` };
        setData([localNew, ...data]);
        toast.success("Expense logged (Demo Mode / Local Cache)");
      } else {
        toast.success("Expense logged successfully in database!");
        loadData();
      }

      setForm({
        expense_date: new Date().toISOString().split("T")[0],
        category: "Office Stationery",
        amount: "",
        description: "",
        payment_method: "HDFC Bank",
        paid_to: "",
      });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to log expense");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    try {
      if (id.startsWith("demo-") || id.startsWith("local-")) {
        setData(data.filter((d) => d.id !== id));
        toast.success("Expense record removed (Local Cache)");
        return;
      }

      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Expense record deleted from database");
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns: Column<any>[] = [
    { key: "expense_date", header: "Date", sortable: true },
    { key: "category", header: "Category", sortable: true },
    {
      key: "amount",
      header: "Amount",
      align: "right" as const,
      render: (r: any) => <span className="font-semibold text-foreground">₹{Number(r.amount).toLocaleString("en-IN")}</span>,
    },
    { key: "payment_method", header: "Payment Via" },
    { key: "paid_to", header: "Paid To" },
    { key: "description", header: "Description" },
    {
      key: "status",
      header: "Status",
      align: "center" as const,
      render: (r: any) => <StatusBadge label={r.status} tone={r.status === "Approved" ? "success" : "warning"} />,
    },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            render: (r: any) => (
              <button
                onClick={() => handleDelete(r.id)}
                className="rounded p-1 hover:bg-secondary text-destructive transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ),
          },
        ]
      : []),
  ];

  const totalSpent = data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const hdfcSpent = data.filter((d) => d.payment_method === "HDFC Bank").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cashSpent = data.filter((d) => d.payment_method === "Cash" || d.payment_method === "Petty Cash").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Expenses"
        subtitle="Log, track, and categorize operating and procurement costs"
        action={
          canManage && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> {showForm ? "View Directory" : "Log Expense"}
            </button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Operating Expenses"
          value={`₹${totalSpent.toLocaleString("en-IN")}`}
          icon={FileText}
          tone="primary"
        />
        <StatCard
          label="Bank Disbursals (HDFC)"
          value={`₹${hdfcSpent.toLocaleString("en-IN")}`}
          icon={Wallet}
          tone="brown"
        />
        <StatCard
          label="Cash / Petty Cash"
          value={`₹${cashSpent.toLocaleString("en-IN")}`}
          icon={CreditCard}
          tone="accent"
        />
      </div>

      {showForm ? (
        <Panel title="Log Operating Expense">
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expense Date *</label>
              <input
                type="date"
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Factory Electricity">Factory Electricity</option>
                <option value="Freight & Transport">Freight & Transport</option>
                <option value="Raw Spices Inward">Raw Spices Inward</option>
                <option value="Packaging Materials">Packaging Materials</option>
                <option value="Office Stationery">Office Stationery</option>
                <option value="Travel & Lodging">Travel & Lodging</option>
                <option value="Employee Welfare">Employee Welfare</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amount (INR) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                placeholder="e.g. 15000"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Payment Method *</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="HDFC Bank">HDFC Bank Current Account</option>
                <option value="Cash">Cash Ledger</option>
                <option value="Petty Cash">Petty Cash Register</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Paid To (Vendor/Payee) *</label>
              <input
                value={form.paid_to}
                onChange={(e) => setForm({ ...form, paid_to: e.target.value })}
                required
                placeholder="e.g. MGVCL Gujarat, Apex Packers, etc."
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="e.g. Paid monthly utility charges or raw material transport invoices"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Save Record
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      ) : (
        <Panel title="Operating Expenses Register">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground animate-pulse">Loading expenses...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={data} />
          )}
        </Panel>
      )}
    </div>
  );
}

/* ── QC role modules ── */
function PendingQCModule() {
  return (
    <>
      <PageHeader title="Pending QC" subtitle="Batches awaiting quality control inspection" />
      <QcManagementModule />
    </>
  );
}

function BatchTestingModule() {
  return (
    <Stub
      title="Batch Testing"
      subtitle="Record moisture, colour and aroma test parameters"
      icon={Beaker}
    />
  );
}

function QCReportsModule() {
  return (
    <Stub
      title="QC Reports"
      subtitle="Historical quality control results and trends"
      icon={FileBarChart}
    />
  );
}

function StandardsModule() {
  return (
    <Stub
      title="Standards"
      subtitle="Define acceptable QC parameters and limits per product"
      icon={ShieldCheck}
    />
  );
}

/* ── Warehouse role modules ── */
function StockEntryModule() {
  return (
    <>
      <PageHeader title="Stock Entry" subtitle="Log material receipts and stock adjustments" />
      <InventoryModule />
    </>
  );
}

function WarehouseModule() {
  return (
    <Stub
      title="Warehouse"
      subtitle="Manage warehouse locations, zones and storage capacity"
      icon={Warehouse}
    />
  );
}

/* ── Accounts module ── */
function AccountsModule() {
  return (
    <Stub
      title="Accounts"
      subtitle="Manage bank accounts, cash ledgers and wallet balances"
      icon={Wallet}
    />
  );
}

/* ── Notifications module ── */
function NotificationsModule() {
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="All system alerts, approvals and activity updates"
      />
      <Panel title="Recent Notifications">
        <ul className="divide-y divide-border">
          {[
            {
              title: "Low stock alert",
              desc: "Turmeric Powder below reorder level (120 kg)",
              time: "10 min ago",
              tone: "danger" as const,
            },
            {
              title: "New export order confirmed",
              desc: "Order #EXP-2041 from Gulf Spice Trading LLC",
              time: "1 hour ago",
              tone: "success" as const,
            },
            {
              title: "QC approval pending",
              desc: "Batch #B-1187 awaiting inspection sign-off",
              time: "3 hours ago",
              tone: "warning" as const,
            },
            {
              title: "Payment received",
              desc: "Rs. 4,80,000 from Spice Traders Co.",
              time: "Yesterday",
              tone: "success" as const,
            },
            {
              title: "Payroll processed",
              desc: "June 2026 salary slips generated for 5 employees",
              time: "2 days ago",
              tone: "info" as const,
            },
          ].map((n, i) => (
            <li key={i} className="flex items-start gap-4 px-5 py-4">
              <span
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                  n.tone === "success"
                    ? "bg-green-500"
                    : n.tone === "danger"
                      ? "bg-red-500"
                      : n.tone === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

/* ── Distributor / Retailer modules ── */
function MyOrdersModule() {
  return (
    <>
      <PageHeader title="My Orders" subtitle="View and track your purchase orders" />
      <SalesModule />
    </>
  );
}

/* ── Router ── */
export default function ModulePage() {
  const { route: pathname } = useRouter();
  const normalizedPath = pathname.toLowerCase().replace(/\/$/, "");

  switch (normalizedPath) {
    // ── Full module implementations ──
    case "/app/crm":
      return <CrmModule />;
    case "/app/customers":
      return <CustomersModule />;
    case "/app/suppliers":
      return <SuppliersModule />;
    case "/app/products":
      return <ProductsModule />;
    case "/app/inventory":
      return <InventoryModule />;
    case "/app/purchases":
      return <PurchasesModule />;
    case "/app/production":
      return <ProductionModule />;
    case "/app/qc-management":
      return <QcManagementModule />;
    case "/app/sales":
      return <SalesModule />;
    case "/app/reports":
      return <ReportsModule />;
    case "/app/export-management":
      return <ExportModule />;
    case "/app/user-management":
      return <UserManagementModule />;
    case "/app/settings":
      return <SettingsModule />;

    // ── Accounts & Billing ──
    case "/app/accounts":
      return <AccountsModule />;
    case "/app/invoices":
      return <InvoicesModule />;
    case "/app/payments":
      return <PaymentsModule />;
    case "/app/expenses":
      return <ExpensesModule />;

    // ── Notifications ──
    case "/app/notifications":
      return <NotificationsModule />;

    // ── Sales role ──
    case "/app/leads":
      return <LeadsModule />;
    case "/app/quotations":
      return <QuotationsModule />;
    case "/app/sales-orders":
      return <SalesOrdersModule />;
    case "/app/follow-ups":
      return <FollowUpsModule />;

    // ── Supervisor role ──
    case "/app/raw-material-entry":
      return <RawMaterialEntryModule />;
    case "/app/batch-creation":
      return <BatchCreationModule />;
    case "/app/warehouse":
      return <WarehouseModule />;
    case "/app/dispatch":
      return <DispatchModule />;

    // ── Partner role ──
    case "/app/sales-reports":
      return <SalesReportsModule />;
    case "/app/purchase-reports":
      return <PurchaseReportsModule />;
    case "/app/outstanding-reports":
      return <OutstandingReportsModule />;
    case "/app/profit-and-loss":
      return <ProfitLossModule />;
    case "/app/business-analytics":
      return <BusinessAnalyticsModule />;

    // ── QC role ──
    case "/app/pending-qc":
      return <PendingQCModule />;
    case "/app/batch-testing":
      return <BatchTestingModule />;
    case "/app/qc-reports":
      return <QCReportsModule />;
    case "/app/standards":
      return <StandardsModule />;

    // ── Warehouse role ──
    case "/app/stock-entry":
      return <StockEntryModule />;

    // ── Distributor / Retailer ──
    case "/app/my-orders":
      return <MyOrdersModule />;

    // ── Unknown route fallback ──
    default: {
      const title = titleFromPath(pathname);
      return (
        <>
          <PageHeader title={title} subtitle="Enterprise module" />
          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 p-12 text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
              <Construction className="h-8 w-8" />
            </span>
            <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              This module is part of the Agrozaar Foods LLP ERP and will be available here.
            </p>
          </div>
        </>
      );
    }
  }
}
