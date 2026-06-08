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
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { StatCard, Panel, StatusBadge, PageHeader } from "./widgets";
import { DataTable, type Column } from "./DataTable";
import type { RoleId } from "@/lib/erp/auth";
import { ROLE_LABELS } from "@/lib/erp/roles";
import { useAuditLog } from "@/lib/erp/delegation";

const CHART_COLOR = "var(--primary)";
const ACCENT_COLOR = "var(--accent)";
const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

const salesTrend = [
  { m: "Jan", v: 42 }, { m: "Feb", v: 48 }, { m: "Mar", v: 45 }, { m: "Apr", v: 56 },
  { m: "May", v: 61 }, { m: "Jun", v: 58 }, { m: "Jul", v: 67 }, { m: "Aug", v: 72 },
];
const prodTrend = [
  { m: "Mon", v: 320 }, { m: "Tue", v: 410 }, { m: "Wed", v: 380 },
  { m: "Thu", v: 460 }, { m: "Fri", v: 520 }, { m: "Sat", v: 290 },
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
        <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }} />
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
        <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }} cursor={{ fill: "var(--secondary)" }} />
        <Bar dataKey="v" fill={ACCENT_COLOR} radius={[6, 6, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------- Tables data ---------- */
interface OrderRow extends Record<string, unknown> { id: string; customer: string; product: string; amount: string; status: string }
const exportOrders: OrderRow[] = [
  { id: "EXP-2041", customer: "Gulf Spice Traders", product: "Turmeric Powder", amount: "₹4,80,000", status: "Confirmed" },
  { id: "EXP-2040", customer: "Saffron House UK", product: "Red Chilli", amount: "₹3,12,000", status: "Shipped" },
  { id: "EXP-2039", customer: "Asia Foods SG", product: "Garam Masala", amount: "₹1,95,000", status: "Pending" },
  { id: "EXP-2038", customer: "Dubai Mart LLC", product: "Cumin Seeds", amount: "₹2,64,000", status: "Confirmed" },
  { id: "EXP-2037", customer: "Spice World CA", product: "Coriander", amount: "₹1,42,000", status: "Processing" },
];

const lowStock = [
  { name: "Turmeric Powder", level: "120 kg", reorder: "500 kg" },
  { name: "Red Chilli Powder", level: "85 kg", reorder: "400 kg" },
  { name: "Cumin Seeds", level: "60 kg", reorder: "300 kg" },
];

const statusTone = (s: string) =>
  s === "Confirmed" || s === "Shipped" || s === "Approved" ? "success"
  : s === "Pending" || s === "Processing" ? "warning"
  : s === "Rejected" ? "danger" : "info";

const orderColumns: Column<OrderRow>[] = [
  { key: "id", header: "Order ID", sortable: true },
  { key: "customer", header: "Customer", sortable: true },
  { key: "product", header: "Product" },
  { key: "amount", header: "Amount", align: "right", sortable: true },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge label={r.status} tone={statusTone(r.status)} /> },
];

/* ---------- Dashboards ---------- */
function formatLakh(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    salesMtd: 0,
    purchasesMtd: 0,
    productionQty: 0,
    profitMtd: 0,
    stockValue: 0,
    outstanding: 0,
    exportOrdersCount: 0,
    lowStockCount: 0,
    recentOrders: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // 1. Fetch Sales Orders (MTD)
        const { data: sales } = await supabase.from("sales_orders").select("grand_total, status");
        const salesMtdSum = sales?.filter(s => s.status !== "cancelled").reduce((acc, s) => acc + Number(s.grand_total), 0) || 0;

        // 2. Fetch Purchases (Stock Movements of type 'purchase')
        const { data: movements } = await supabase.from("stock_movements").select("quantity, movement_type");
        const purchaseVolume = movements?.filter(m => m.movement_type === "purchase").reduce((acc, m) => acc + Number(m.quantity), 0) || 0;
        const purchasesMtdSum = purchaseVolume * 160; // Estimated cost multiplier of ₹160/kg for raw whole spices

        // 3. Fetch Production Output
        const { data: batches } = await supabase.from("production_batches").select("actual_qty, planned_qty, status");
        const productionQtySum = batches?.filter(b => b.status === "completed").reduce((acc, b) => acc + Number(b.actual_qty || b.planned_qty), 0) || 0;

        // 4. Fetch Outstanding Bills (sum of pending sales orders)
        const outstandingSum = sales?.filter(s => s.status === "pending" || s.status === "processing").reduce((acc, s) => acc + Number(s.grand_total), 0) || 0;

        // 5. Fetch Export Orders (delivery challans)
        const { count: exportCount } = await supabase.from("delivery_challans").select("*", { count: "exact", head: true });

        // 6. Fetch Low Stock Alerts
        const { data: stockByProd } = await supabase.from("warehouse_stock").select("stock_quantity");
        const lowStockItems = stockByProd?.filter(s => Number(s.stock_quantity) < 500).length || 0;

        // 7. Fetch Recent Orders
        const { data: recent } = await supabase
          .from("sales_orders")
          .select("*, customers(name)")
          .order("created_at", { ascending: false })
          .limit(5);

        const formattedOrders = (recent || []).map(o => ({
          id: o.order_number || "SO-?",
          customer: o.customers?.name || "Customer",
          product: "Seeded Spice SKUs",
          amount: inr(o.grand_total),
          status: o.status === "dispatched" ? "Shipped" : o.status === "delivered" ? "Confirmed" : "Processing"
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
          recentOrders: formattedOrders
        });
      } catch (err) {
        console.error("Dashboard load stats error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading Executive Dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Executive Dashboard" subtitle="Company-wide operations overview" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Sales (MTD)" value={formatLakh(stats.salesMtd)} icon={TrendingUp} tone="primary" />
        <StatCard label="Purchases (MTD)" value={formatLakh(stats.purchasesMtd)} icon={ShoppingCart} tone="brown" />
        <StatCard label="Production Output" value={`${(stats.productionQty / 1000).toFixed(2)} T`} icon={Factory} tone="accent" />
        <StatCard label="Net Profit (MTD)" value={formatLakh(stats.profitMtd)} icon={Wallet} tone="accent" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Inventory Value" value={formatLakh(stats.stockValue)} icon={Boxes} tone="brown" />
        <StatCard label="Outstanding" value={formatLakh(stats.outstanding)} icon={Receipt} tone="destructive" />
        <StatCard label="Export Orders" value={String(stats.exportOrdersCount)} icon={Globe} tone="primary" />
        <StatCard label="Low Stock Alerts" value={String(stats.lowStockCount)} icon={AlertTriangle} tone="destructive" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ChartCard title="Sales Trend (₹ Lakh)"><AreaTrend data={salesTrend} /></ChartCard></div>
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
              <p className="mt-1 text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}


function SupervisorDashboard() {
  return (
    <>
      <PageHeader title="Production Dashboard" subtitle="Today's plant operations" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today Production" value="4.6 T" icon={Factory} tone="primary" delta={{ value: "6%", up: true }} />
        <StatCard label="Pending QC" value="7 batches" icon={ShieldCheck} tone="destructive" />
        <StatCard label="Active Batches" value="12" icon={Beaker} tone="accent" />
        <StatCard label="Dispatch Queue" value="9 orders" icon={Send} tone="brown" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ChartCard title="Weekly Production (kg)"><BarTrend data={prodTrend} /></ChartCard></div>
        <Panel title="Warehouse Stock">
          <ul className="divide-y divide-border">
            {[
              { n: "Raw Turmeric", v: "3.2 T", t: "success" as const },
              { n: "Raw Chilli", v: "1.1 T", t: "warning" as const },
              { n: "Packaging", v: "8,200 units", t: "success" as const },
              { n: "Cumin Seeds", v: "640 kg", t: "warning" as const },
            ].map((s) => (
              <li key={s.n} className="flex items-center justify-between px-5 py-3.5">
                <p className="text-sm font-medium text-foreground">{s.n}</p>
                <StatusBadge label={s.v} tone={s.t} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

interface LeadRow extends Record<string, unknown> { name: string; company: string; value: string; status: string }
const leads: LeadRow[] = [
  { name: "Rahul Mehta", company: "Spice Bazaar", value: "₹2,40,000", status: "Confirmed" },
  { name: "Anita Shah", company: "Fresh Foods Ltd", value: "₹1,10,000", status: "Pending" },
  { name: "Imran Khan", company: "Gulf Imports", value: "₹3,80,000", status: "Processing" },
  { name: "Priya Nair", company: "Kerala Spices", value: "₹95,000", status: "Confirmed" },
];
const leadCols: Column<LeadRow>[] = [
  { key: "name", header: "Lead", sortable: true },
  { key: "company", header: "Company", sortable: true },
  { key: "value", header: "Value", align: "right", sortable: true },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge label={r.status} tone={statusTone(r.status)} /> },
];

function SalesDashboard() {
  return (
    <>
      <PageHeader title="Sales Dashboard" subtitle="Your pipeline and customer activity" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Leads" value="28" icon={Target} tone="primary" delta={{ value: "5", up: true }} />
        <StatCard label="Open Quotations" value="14" icon={FileText} tone="brown" />
        <StatCard label="Pending Follow-ups" value="9" icon={Bell} tone="destructive" />
        <StatCard label="Monthly Sales" value="₹16.2 L" icon={TrendingUp} tone="accent" delta={{ value: "9.5%", up: true }} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ChartCard title="Monthly Sales (₹ Lakh)"><AreaTrend data={salesTrend} /></ChartCard></div>
        <Panel title="Customer Activity">
          <ul className="divide-y divide-border">
            {["Quote sent — Spice Bazaar", "Call scheduled — Gulf Imports", "Order placed — Kerala Spices", "Follow-up due — Fresh Foods"].map((a, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <p className="text-sm text-foreground">{a}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <div className="mt-6">
        <PageHeader title="Recent Leads" />
        <DataTable columns={leadCols} data={leads} />
      </div>
    </>
  );
}

function PartnerDashboard() {
  return (
    <>
      <PageHeader title="Business Overview" subtitle="Partner financial performance" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (YTD)" value="₹6.8 Cr" icon={TrendingUp} tone="primary" delta={{ value: "14%", up: true }} />
        <StatCard label="Expenses (YTD)" value="₹4.1 Cr" icon={Receipt} tone="brown" delta={{ value: "6%", up: true }} />
        <StatCard label="Net Profit" value="₹2.7 Cr" icon={PieIcon} tone="accent" delta={{ value: "11%", up: true }} />
        <StatCard label="Outstanding" value="₹38.5 L" icon={LineIcon} tone="destructive" delta={{ value: "3%", up: false }} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Growth (₹ Lakh)"><AreaTrend data={salesTrend} /></ChartCard>
        <ChartCard title="Quarterly Output"><BarTrend data={prodTrend} /></ChartCard>
      </div>
    </>
  );
}

function GenericDashboard({ role }: { role: RoleId }) {
  return (
    <>
      <PageHeader title={`${ROLE_LABELS[role]} Dashboard`} subtitle="Your daily operations summary" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending Tasks" value="12" icon={Bell} tone="primary" />
        <StatCard label="Completed Today" value="34" icon={ShieldCheck} tone="accent" />
        <StatCard label="In Progress" value="8" icon={Warehouse} tone="brown" />
        <StatCard label="Alerts" value="2" icon={AlertTriangle} tone="destructive" />
      </div>
      <div className="mt-6"><ChartCard title="Weekly Activity"><BarTrend data={prodTrend} /></ChartCard></div>
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
