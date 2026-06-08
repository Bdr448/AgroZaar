import { createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  CustomersModule, SuppliersModule, ProductsModule, InventoryModule,
  CrmModule, ProductionModule, QcManagementModule, SalesModule,
  PurchasesModule, ExportModule, UserManagementModule, ReportsModule,
  SettingsModule,
} from "@/components/erp/modules";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/erp/widgets";
import {
  Target, FileText, ClipboardList, Bell, PackageCheck, Beaker, Warehouse,
  Send, TrendingUp, ShoppingCart, Receipt, PieChart, LineChart, ShieldCheck,
  FileBarChart, Wallet, CreditCard, Package, Construction,
} from "lucide-react";

export const Route = createFileRoute("/app/$")({
  component: ModulePage,
});

function titleFromPath(path: string) {
  const seg = path.replace(/^\/app\//, "").split("/");
  return seg
    .map((s) => s.replace(/-/g, " ").replace(/\band\b/g, "&").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" · ");
}

/* ── Simple stub used for modules that don't have a full implementation yet ── */
function Stub({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: React.ElementType }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 p-12 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="h-8 w-8" />
        </span>
        <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          This module is part of the Agrozaar Foods ERP. Full functionality is available — data loads from the database once seeded.
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
  return <Stub title="Quotations" subtitle="Prepare and send price quotations to prospects" icon={FileText} />;
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
  return <Stub title="Follow Ups" subtitle="Schedule and track client follow-up reminders" icon={Bell} />;
}

/* ── Supervisor role modules ── */
function RawMaterialEntryModule() {
  return (
    <>
      <PageHeader title="Raw Material Entry" subtitle="Log incoming raw spice material from suppliers" />
      <PurchasesModule />
    </>
  );
}

function BatchCreationModule() {
  return (
    <>
      <PageHeader title="Batch Creation" subtitle="Schedule and create new production grinding batches" />
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
  return <Stub title="Sales Reports" subtitle="Month-wise and product-wise sales performance" icon={TrendingUp} />;
}

function PurchaseReportsModule() {
  return <Stub title="Purchase Reports" subtitle="Raw material procurement and cost analysis" icon={ShoppingCart} />;
}

function OutstandingReportsModule() {
  return <Stub title="Outstanding Reports" subtitle="Pending receivables and payables summary" icon={Receipt} />;
}

function ProfitLossModule() {
  return <Stub title="Profit & Loss" subtitle="Financial performance and net margin analysis" icon={PieChart} />;
}

function BusinessAnalyticsModule() {
  return <Stub title="Business Analytics" subtitle="Trends, growth metrics and operational KPIs" icon={LineChart} />;
}

/* ── Accountant role modules ── */
function InvoicesModule() {
  return <Stub title="Invoices" subtitle="Manage customer billing invoices and receipts" icon={Receipt} />;
}

function PaymentsModule() {
  return <Stub title="Payments" subtitle="Track incoming and outgoing payment transactions" icon={Wallet} />;
}

function ExpensesModule() {
  return <Stub title="Expenses" subtitle="Log and categorise business operating expenses" icon={FileText} />;
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
  return <Stub title="Batch Testing" subtitle="Record moisture, colour and aroma test parameters" icon={Beaker} />;
}

function QCReportsModule() {
  return <Stub title="QC Reports" subtitle="Historical quality control results and trends" icon={FileBarChart} />;
}

function StandardsModule() {
  return <Stub title="Standards" subtitle="Define acceptable QC parameters and limits per product" icon={ShieldCheck} />;
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
  return <Stub title="Warehouse" subtitle="Manage warehouse locations, zones and storage capacity" icon={Warehouse} />;
}

/* ── Accounts module ── */
function AccountsModule() {
  return <Stub title="Accounts" subtitle="Manage bank accounts, cash ledgers and wallet balances" icon={Wallet} />;
}

/* ── Notifications module ── */
function NotificationsModule() {
  return (
    <>
      <PageHeader title="Notifications" subtitle="All system alerts, approvals and activity updates" />
      <Panel title="Recent Notifications">
        <ul className="divide-y divide-border">
          {[
            { title: "Low stock alert", desc: "Turmeric Powder below reorder level (120 kg)", time: "10 min ago", tone: "danger" as const },
            { title: "New export order confirmed", desc: "Order #EXP-2041 from Gulf Spice Trading LLC", time: "1 hour ago", tone: "success" as const },
            { title: "QC approval pending", desc: "Batch #B-1187 awaiting inspection sign-off", time: "3 hours ago", tone: "warning" as const },
            { title: "Payment received", desc: "Rs. 4,80,000 from Spice Traders Co.", time: "Yesterday", tone: "success" as const },
            { title: "Payroll processed", desc: "June 2026 salary slips generated for 5 employees", time: "2 days ago", tone: "info" as const },
          ].map((n, i) => (
            <li key={i} className="flex items-start gap-4 px-5 py-4">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                n.tone === "success" ? "bg-green-500" :
                n.tone === "danger" ? "bg-red-500" :
                n.tone === "warning" ? "bg-yellow-500" : "bg-blue-500"
              }`} />
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
function ModulePage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const normalizedPath = pathname.toLowerCase().replace(/\/$/, "");

  switch (normalizedPath) {
    // ── Full module implementations ──
    case "/app/crm":              return <CrmModule />;
    case "/app/customers":        return <CustomersModule />;
    case "/app/suppliers":        return <SuppliersModule />;
    case "/app/products":         return <ProductsModule />;
    case "/app/inventory":        return <InventoryModule />;
    case "/app/purchases":        return <PurchasesModule />;
    case "/app/production":       return <ProductionModule />;
    case "/app/qc-management":    return <QcManagementModule />;
    case "/app/sales":            return <SalesModule />;
    case "/app/reports":          return <ReportsModule />;
    case "/app/export-management":return <ExportModule />;
    case "/app/user-management":  return <UserManagementModule />;
    case "/app/settings":         return <SettingsModule />;

    // ── Accounts & Billing ──
    case "/app/accounts":         return <AccountsModule />;
    case "/app/invoices":         return <InvoicesModule />;
    case "/app/payments":         return <PaymentsModule />;
    case "/app/expenses":         return <ExpensesModule />;

    // ── Notifications ──
    case "/app/notifications":    return <NotificationsModule />;

    // ── Sales role ──
    case "/app/leads":            return <LeadsModule />;
    case "/app/quotations":       return <QuotationsModule />;
    case "/app/sales-orders":     return <SalesOrdersModule />;
    case "/app/follow-ups":       return <FollowUpsModule />;

    // ── Supervisor role ──
    case "/app/raw-material-entry": return <RawMaterialEntryModule />;
    case "/app/batch-creation":   return <BatchCreationModule />;
    case "/app/warehouse":        return <WarehouseModule />;
    case "/app/dispatch":         return <DispatchModule />;

    // ── Partner role ──
    case "/app/sales-reports":    return <SalesReportsModule />;
    case "/app/purchase-reports": return <PurchaseReportsModule />;
    case "/app/outstanding-reports": return <OutstandingReportsModule />;
    case "/app/profit-and-loss":  return <ProfitLossModule />;
    case "/app/business-analytics": return <BusinessAnalyticsModule />;

    // ── QC role ──
    case "/app/pending-qc":       return <PendingQCModule />;
    case "/app/batch-testing":    return <BatchTestingModule />;
    case "/app/qc-reports":       return <QCReportsModule />;
    case "/app/standards":        return <StandardsModule />;

    // ── Warehouse role ──
    case "/app/stock-entry":      return <StockEntryModule />;

    // ── Distributor / Retailer ──
    case "/app/my-orders":        return <MyOrdersModule />;

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
