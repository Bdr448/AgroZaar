import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  ShoppingCart,
  Factory,
  Boxes,
  Wallet,
  Receipt,
  Globe,
  AlertTriangle,
  Target,
  FileText,
  Bell,
  Beaker,
  ShieldCheck,
  Warehouse,
  Send,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { StatCard, Panel, StatusBadge, PageHeader } from "./widgets";
import { DataTable, type Column } from "./DataTable";
import type { RoleId } from "@/lib/erp/auth";
import { ROLE_LABELS } from "@/lib/erp/roles";
import { useAuditLog } from "@/lib/erp/delegation";
import { useSession } from "@/lib/erp/auth";
import { toast } from "sonner";

const CHART_COLOR = "var(--primary)";
const ACCENT_COLOR = "var(--accent)";
const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

const salesTrend = [
  { m: "Jan", v: 42 },
  { m: "Feb", v: 48 },
  { m: "Mar", v: 45 },
  { m: "Apr", v: 56 },
  { m: "May", v: 61 },
  { m: "Jun", v: 58 },
  { m: "Jul", v: 67 },
  { m: "Aug", v: 72 },
];
const prodTrend = [
  { m: "Mon", v: 320 },
  { m: "Tue", v: 410 },
  { m: "Wed", v: 380 },
  { m: "Thu", v: 460 },
  { m: "Fri", v: 520 },
  { m: "Sat", v: 290 },
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel title={title} className="overflow-hidden">
      <div className="h-64 p-4">{children}</div>
    </Panel>
  );
}

function AreaTrend({ data }: { data: { m: string; v: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="m"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }}
        />
        <Area type="monotone" dataKey="v" stroke={CHART_COLOR} strokeWidth={2.5} fill="url(#g)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function BarTrend({ data }: { data: { m: string; v: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="m"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }}
          cursor={{ fill: "var(--secondary)" }}
        />
        <Bar dataKey="v" fill={ACCENT_COLOR} radius={[6, 6, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------- Tables data ---------- */
interface OrderRow extends Record<string, unknown> {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: string;
}
const exportOrders: OrderRow[] = [
  {
    id: "EXP-2041",
    customer: "Gulf Spice Traders",
    product: "Turmeric Powder",
    amount: "₹4,80,000",
    status: "Confirmed",
  },
  {
    id: "EXP-2040",
    customer: "Saffron House UK",
    product: "Red Chilli",
    amount: "₹3,12,000",
    status: "Shipped",
  },
  {
    id: "EXP-2039",
    customer: "Asia Foods SG",
    product: "Garam Masala",
    amount: "₹1,95,000",
    status: "Pending",
  },
  {
    id: "EXP-2038",
    customer: "Dubai Mart LLC",
    product: "Cumin Seeds",
    amount: "₹2,64,000",
    status: "Confirmed",
  },
  {
    id: "EXP-2037",
    customer: "Spice World CA",
    product: "Coriander",
    amount: "₹1,42,000",
    status: "Processing",
  },
];

const lowStock = [
  { name: "Turmeric Powder", level: "120 kg", reorder: "500 kg" },
  { name: "Red Chilli Powder", level: "85 kg", reorder: "400 kg" },
  { name: "Cumin Seeds", level: "60 kg", reorder: "300 kg" },
];

const statusTone = (s: string) =>
  s === "Confirmed" || s === "Shipped" || s === "Approved"
    ? "success"
    : s === "Pending" || s === "Processing"
      ? "warning"
      : s === "Rejected"
        ? "danger"
        : "info";

const orderColumns: Column<OrderRow>[] = [
  { key: "id", header: "Order ID", sortable: true },
  { key: "customer", header: "Customer", sortable: true },
  { key: "product", header: "Product" },
  { key: "amount", header: "Amount", align: "right", sortable: true },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <StatusBadge label={r.status} tone={statusTone(r.status)} />,
  },
];

/* ---------- Dashboards ---------- */
function formatLakh(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function SuperAdminDashboard() {
  const session = useSession();
  const [stats, setStats] = useState({
    salesMtd: 0,
    purchasesMtd: 0,
    productionQty: 0,
    profitMtd: 0,
    stockValue: 0,
    outstanding: 0,
    exportOrdersCount: 0,
    lowStockCount: 0,
    recentOrders: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("change_requests")
        .select(`
          *,
          user_profiles:requester_id (
            name,
            role
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      console.error("Failed to load change requests:", err.message);
    }
  };

  const handleApprove = async (id: string) => {
    const toastId = toast.loading("Approving change request...");
    try {
      const { error } = await supabase
        .from("change_requests")
        .update({ status: "approved", approved_by: session?.id })
        .eq("id", id);
      if (error) throw error;
      toast.dismiss(toastId);
      toast.success("Request approved. The user is now permitted to execute this action.");
      loadRequests();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to approve request");
    }
  };

  const handleReject = async (id: string) => {
    const toastId = toast.loading("Rejecting change request...");
    try {
      const { error } = await supabase
        .from("change_requests")
        .update({ status: "rejected", approved_by: session?.id })
        .eq("id", id);
      if (error) throw error;
      toast.dismiss(toastId);
      toast.success("Request rejected.");
      loadRequests();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to reject request");
    }
  };

  useEffect(() => {
    async function loadStats() {
      try {
        // 1. Fetch Sales Orders (MTD)
        const { data: sales } = await supabase.from("sales_orders").select("grand_total, status");
        const salesMtdSum =
          sales
            ?.filter((s) => s.status !== "cancelled")
            .reduce((acc, s) => acc + Number(s.grand_total), 0) || 0;

        // 2. Fetch Purchases (Stock Movements of type 'purchase')
        const { data: movements } = await supabase
          .from("stock_movements")
          .select("quantity, movement_type");
        const purchaseVolume =
          movements
            ?.filter((m) => m.movement_type === "purchase")
            .reduce((acc, m) => acc + Number(m.quantity), 0) || 0;
        const purchasesMtdSum = purchaseVolume * 160; // Estimated cost multiplier of ₹160/kg for raw whole spices

        // 3. Fetch Production Output
        const { data: batches } = await supabase
          .from("production_batches")
          .select("actual_qty, planned_qty, status");
        const productionQtySum =
          batches
            ?.filter((b) => b.status === "completed")
            .reduce((acc, b) => acc + Number(b.actual_qty || b.planned_qty), 0) || 0;

        // 4. Fetch Outstanding Bills (sum of pending sales orders)
        const outstandingSum =
          sales
            ?.filter((s) => s.status === "pending" || s.status === "processing")
            .reduce((acc, s) => acc + Number(s.grand_total), 0) || 0;

        // 5. Fetch Export Orders (delivery challans)
        const { count: exportCount } = await supabase
          .from("delivery_challans")
          .select("*", { count: "exact", head: true });

        // 6. Fetch Low Stock Alerts
        const { data: stockByProd } = await supabase
          .from("warehouse_stock")
          .select("stock_quantity");
        const lowStockItems =
          stockByProd?.filter((s) => Number(s.stock_quantity) < 500).length || 0;

        // 7. Fetch Recent Orders
        const { data: recent } = await supabase
          .from("sales_orders")
          .select("*, customers(name)")
          .order("created_at", { ascending: false })
          .limit(5);

        const formattedOrders = (recent || []).map((o) => ({
          id: o.order_number || "SO-?",
          customer: o.customers?.name || "Customer",
          product: "Seeded Spice SKUs",
          amount: inr(o.grand_total),
          status:
            o.status === "dispatched"
              ? "Shipped"
              : o.status === "delivered"
                ? "Confirmed"
                : "Processing",
        }));

        setStats({
          salesMtd: salesMtdSum,
          purchasesMtd: purchasesMtdSum,
          productionQty: productionQtySum,
          profitMtd: salesMtdSum * 0.45, // 45% estimated profit margin
          stockValue: (movements?.reduce((acc, m) => acc + Number(m.quantity), 0) || 0) * 250, // Average stock value ₹250/kg
          outstanding: outstandingSum,
          exportOrdersCount: exportCount || 0,
          lowStockCount: lowStockItems,
          recentOrders: formattedOrders,
        });
      } catch (err) {
        console.error("Dashboard load stats error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
    loadRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse font-medium">
          Loading Executive Dashboard...
        </p>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <>
      <PageHeader title="Executive Dashboard" subtitle="Company-wide operations overview" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Sales (MTD)"
          value={formatLakh(stats.salesMtd)}
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard
          label="Purchases (MTD)"
          value={formatLakh(stats.purchasesMtd)}
          icon={ShoppingCart}
          tone="brown"
        />
        <StatCard
          label="Production Output"
          value={`${(stats.productionQty / 1000).toFixed(2)} T`}
          icon={Factory}
          tone="accent"
        />
        <StatCard
          label="Net Profit (MTD)"
          value={formatLakh(stats.profitMtd)}
          icon={Wallet}
          tone="accent"
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Inventory Value"
          value={formatLakh(stats.stockValue)}
          icon={Boxes}
          tone="brown"
        />
        <StatCard
          label="Outstanding"
          value={formatLakh(stats.outstanding)}
          icon={Receipt}
          tone="destructive"
        />
        <StatCard
          label="Export Orders"
          value={String(stats.exportOrdersCount)}
          icon={Globe}
          tone="primary"
        />
        <StatCard
          label="Low Stock Alerts"
          value={String(stats.lowStockCount)}
          icon={AlertTriangle}
          tone="destructive"
        />
      </div>

      {pendingRequests.length > 0 && (
        <div className="mt-6">
          <Panel
            title="Pending Data Change Requests"
            subtitle="Security authorization checks required for restricted data edits or deletes"
            icon={ShieldAlert}
          >
            <div className="divide-y divide-border">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-card/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {req.user_profiles?.name || "Requester"}
                      </span>
                      <span className="text-xs rounded-full bg-secondary px-2 py-0.5 capitalize text-muted-foreground font-medium">
                        {req.user_profiles?.role || "user"}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(req.created_at).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      Requested{" "}
                      <span
                        className={`font-semibold ${
                          req.action_type === "delete" ? "text-destructive" : "text-primary"
                        }`}
                      >
                        {req.action_type.toUpperCase()}
                      </span>{" "}
                      permission for record <span className="font-semibold">"{req.record_display_name}"</span> in{" "}
                      <span className="font-semibold text-accent">{req.module_name}</span> module.
                    </p>
                    <p className="text-xs text-muted-foreground font-medium italic">
                      Reason: "{req.reason}"
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-soft transition-colors cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Sales Trend (₹ Lakh)">
            <AreaTrend data={salesTrend} />
          </ChartCard>
        </div>
        <Panel title="Low Stock Alerts">
          <ul className="divide-y divide-border">
            {lowStock.map((s) => (
              <li key={s.name} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Reorder at {s.reorder}</p>
                </div>
                <StatusBadge label={s.level} tone="danger" />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <div className="mt-6">
        <PageHeader title="Recent Export Orders" subtitle="Latest international shipments" />
        <DataTable columns={orderColumns} data={stats.recentOrders} />
      </div>
      <div className="mt-6">
        <ActivityTimeline />
      </div>
    </>
  );
}

function ActivityTimeline() {
  const audit = useAuditLog();
  return (
    <Panel title="Activity Timeline">
      <ul className="divide-y divide-border">
        {audit.slice(0, 8).map((a) => (
          <li key={a.id} className="flex flex-wrap items-start justify-between gap-2 px-5 py-3.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {a.user} · {a.action}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {a.module} · {a.oldValue} → <span className="text-foreground">{a.newValue}</span>
              </p>
            </div>
            <div className="text-right">
              <StatusBadge
                label={a.permissionSource}
                tone={a.permissionSource === "Delegated Authority" ? "info" : "neutral"}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(a.timestamp).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function SupervisorDashboard() {
  const [stats, setStats] = useState({
    todayProduction: 0,
    pendingQc: 0,
    activeBatches: 0,
    dispatchQueue: 0,
    warehouseStock: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // 1. Production batches for today production and active batches
        const { data: batches } = await supabase
          .from("production_batches")
          .select("actual_qty, planned_qty, status");

        const completedQty = batches
          ?.filter((b) => b.status === "completed")
          .reduce((acc, b) => acc + Number(b.actual_qty || b.planned_qty), 0) || 0;

        const activeCount = batches
          ?.filter((b) => b.status === "grinding" || b.status === "packing").length || 0;

        // 2. Pending QC tests
        const { count: qcCount } = await supabase
          .from("qc_tests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // 3. Dispatch queue (pending sales orders)
        const { count: dispatchCount } = await supabase
          .from("sales_orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // 4. Warehouse Stock
        const { data: stock } = await supabase
          .from("warehouse_stock")
          .select("stock_quantity, products(name)")
          .limit(5);

        const formattedStock = (stock || []).map((s: any) => {
          const qty = Number(s.stock_quantity);
          return {
            n: s.products?.name || "Spice Product",
            v: qty >= 1000 ? `${(qty / 1000).toFixed(2)} T` : `${qty} kg`,
            t: qty < 500 ? ("warning" as const) : ("success" as const),
          };
        });

        setStats({
          todayProduction: completedQty,
          pendingQc: qcCount || 0,
          activeBatches: activeCount || 0,
          dispatchQueue: dispatchCount || 0,
          warehouseStock: formattedStock,
        });
      } catch (err) {
        console.error("SupervisorDashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse font-medium">
          Loading Production Dashboard...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Production Dashboard" subtitle="Today's plant operations" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Production"
          value={stats.todayProduction >= 1000 ? `${(stats.todayProduction / 1000).toFixed(2)} T` : `${stats.todayProduction} kg`}
          icon={Factory}
          tone="primary"
        />
        <StatCard label="Pending QC Tests" value={`${stats.pendingQc} batches`} icon={ShieldCheck} tone="destructive" />
        <StatCard label="Active Batches" value={String(stats.activeBatches)} icon={Beaker} tone="accent" />
        <StatCard label="Dispatch Queue" value={`${stats.dispatchQueue} orders`} icon={Send} tone="brown" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Weekly Production (kg)">
            <BarTrend data={prodTrend} />
          </ChartCard>
        </div>
        <Panel title="Warehouse Stock">
          <ul className="divide-y divide-border">
            {stats.warehouseStock.length > 0 ? (
              stats.warehouseStock.map((s, i) => (
                <li key={i} className="flex items-center justify-between px-5 py-3.5">
                  <p className="text-sm font-medium text-foreground">{s.n}</p>
                  <StatusBadge label={s.v} tone={s.t} />
                </li>
              ))
            ) : (
              <li className="px-5 py-3.5 text-sm text-muted-foreground">No stock data available</li>
            )}
          </ul>
        </Panel>
      </div>
    </>
  );
}

function SalesDashboard() {
  const [stats, setStats] = useState({
    activeLeads: 0,
    openQuotes: 0,
    pendingFollowups: 0,
    monthlySales: 0,
    recentLeads: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // 1. Active Leads count
        const { count: leadsCount } = await supabase
          .from("customers")
          .select("*", { count: "exact", head: true })
          .eq("is_deleted", false);

        // 2. Open Quotations count
        const { count: quotesCount } = await supabase
          .from("quotations")
          .select("*", { count: "exact", head: true });

        // 3. Pending Follow-ups (pending sales orders)
        const { count: pendingSO } = await supabase
          .from("sales_orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // 4. Monthly Sales (total sum of non-cancelled sales orders)
        const { data: sales } = await supabase
          .from("sales_orders")
          .select("grand_total, status");
        const salesSum = sales
          ?.filter((s) => s.status !== "cancelled")
          .reduce((acc, s) => acc + Number(s.grand_total), 0) || 0;

        // 5. Recent Leads (new inquiries/customers)
        const { data: recent } = await supabase
          .from("customers")
          .select("*")
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .limit(5);

        setStats({
          activeLeads: leadsCount || 0,
          openQuotes: quotesCount || 0,
          pendingFollowups: pendingSO || 0,
          monthlySales: salesSum,
          recentLeads: recent || [],
        });
      } catch (err) {
        console.error("SalesDashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse font-medium">
          Loading Sales Dashboard...
        </p>
      </div>
    );
  }

  const salesLeadCols: Column<any>[] = [
    { key: "name", header: "Lead Name", sortable: true },
    { key: "company", header: "Company", sortable: true },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
  ];

  return (
    <>
      <PageHeader title="Sales Dashboard" subtitle="Your pipeline and customer activity" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Leads"
          value={String(stats.activeLeads)}
          icon={Target}
          tone="primary"
        />
        <StatCard label="Open Quotations" value={String(stats.openQuotes)} icon={FileText} tone="brown" />
        <StatCard label="Pending Orders" value={String(stats.pendingFollowups)} icon={Bell} tone="destructive" />
        <StatCard
          label="Total Sales"
          value={formatLakh(stats.monthlySales)}
          icon={TrendingUp}
          tone="accent"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Monthly Sales (₹ Lakh)">
            <AreaTrend data={salesTrend} />
          </ChartCard>
        </div>
        <Panel title="Customer Activity">
          <ul className="divide-y divide-border">
            {stats.recentLeads.length > 0 ? (
              stats.recentLeads.map((lead, i) => (
                <li key={lead.id || i} className="flex items-start gap-3 px-5 py-3.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.company} · {lead.email || "No email"}</p>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-5 py-3.5 text-sm text-muted-foreground">No recent customer activity</li>
            )}
          </ul>
        </Panel>
      </div>
      <div className="mt-6">
        <PageHeader title="Recent Leads (Inquiries)" />
        <DataTable columns={salesLeadCols} data={stats.recentLeads} />
      </div>
    </>
  );
}

function PartnerDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    expenses: 0,
    netProfit: 0,
    outstanding: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // 1. Fetch Sales Orders (Revenue)
        const { data: sales } = await supabase.from("sales_orders").select("grand_total, status");
        const salesSum =
          sales
            ?.filter((s) => s.status !== "cancelled")
            .reduce((acc, s) => acc + Number(s.grand_total), 0) || 0;

        // 2. Fetch Purchases (Stock Movements of type 'purchase' * ₹160 multiplier)
        const { data: movements } = await supabase
          .from("stock_movements")
          .select("quantity, movement_type");
        const purchaseVolume =
          movements
            ?.filter((m) => m.movement_type === "purchase")
            .reduce((acc, m) => acc + Number(m.quantity), 0) || 0;
        const purchasesSum = purchaseVolume * 160;

        // 3. Outstanding sum
        const outstandingSum =
          sales
            ?.filter((s) => s.status === "pending" || s.status === "processing")
            .reduce((acc, s) => acc + Number(s.grand_total), 0) || 0;

        setStats({
          revenue: salesSum,
          expenses: purchasesSum,
          netProfit: salesSum * 0.45,
          outstanding: outstandingSum,
        });
      } catch (err) {
        console.error("PartnerDashboard load stats error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse font-medium">
          Loading Business Overview...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Business Overview" subtitle="Partner financial performance" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (YTD)"
          value={formatLakh(stats.revenue)}
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard
          label="Expenses (YTD)"
          value={formatLakh(stats.expenses)}
          icon={Receipt}
          tone="brown"
        />
        <StatCard
          label="Net Profit"
          value={formatLakh(stats.netProfit)}
          icon={PieIcon}
          tone="accent"
        />
        <StatCard
          label="Outstanding"
          value={formatLakh(stats.outstanding)}
          icon={LineIcon}
          tone="destructive"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Growth (₹ Lakh)">
          <AreaTrend data={salesTrend} />
        </ChartCard>
        <ChartCard title="Quarterly Output">
          <BarTrend data={prodTrend} />
        </ChartCard>
      </div>
    </>
  );
}

function GenericDashboard({ role }: { role: RoleId }) {
  const [stats, setStats] = useState({
    pendingTasks: 12,
    completedToday: 34,
    inProgress: 8,
    alerts: 2,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Query some live counts from the DB to make it feel alive!
        const { count: prodCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_deleted", false);

        const { count: warehouseCount } = await supabase
          .from("warehouses")
          .select("*", { count: "exact", head: true });

        const { count: movementsCount } = await supabase
          .from("stock_movements")
          .select("*", { count: "exact", head: true });

        // Generate semi-dynamic stats
        setStats({
          pendingTasks: (prodCount || 0) + 2,
          completedToday: (movementsCount || 0),
          inProgress: warehouseCount || 4,
          alerts: (movementsCount && movementsCount % 3 === 0) ? 1 : 0,
        });
      } catch (err) {
        console.error("GenericDashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse font-medium">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`${ROLE_LABELS[role]} Dashboard`}
        subtitle="Your daily operations summary"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tracked Products" value={String(stats.pendingTasks)} icon={Bell} tone="primary" />
        <StatCard label="Total Stock Actions" value={String(stats.completedToday)} icon={ShieldCheck} tone="accent" />
        <StatCard label="Active Warehouses" value={String(stats.inProgress)} icon={Warehouse} tone="brown" />
        <StatCard label="System Alerts" value={String(stats.alerts)} icon={AlertTriangle} tone="destructive" />
      </div>
      <div className="mt-6">
        <ChartCard title="Weekly Activity">
          <BarTrend data={prodTrend} />
        </ChartCard>
      </div>
    </>
  );
}

export function RoleDashboard({ role }: { role: RoleId }) {
  switch (role) {
    case "super-admin":
    case "admin":
      return <SuperAdminDashboard />;
    case "supervisor":
      return <SupervisorDashboard />;
    case "sales":
      return <SalesDashboard />;
    case "partner":
      return <PartnerDashboard />;
    default:
      return <GenericDashboard role={role} />;
  }
}
