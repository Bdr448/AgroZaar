import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Contact,
  Users,
  Truck,
  Package,
  Boxes,
  ShoppingCart,
  Factory,
  ShieldCheck,
  TrendingUp,
  Wallet,
  FileBarChart,
  Globe,
  Bell,
  UserCog,
  Settings,
  Target,
  FileText,
  ClipboardList,
  PackageCheck,
  Send,
  Warehouse,
  Receipt,
  PieChart,
  Beaker,
  LineChart,
  Lock,
  BookOpen,
  KeyRound,
  CreditCard,
} from "lucide-react";
import type { RoleId } from "./auth";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  children?: { label: string; to: string }[];
}

export const ROLE_LABELS: Record<RoleId, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  partner: "Partner",
  supervisor: "Supervisor",
  sales: "Sales Team",
  accountant: "Accountant",
  warehouse: "Warehouse User",
  "qc-manager": "QC Manager",
  distributor: "Distributor",
  retailer: "Retailer",
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const item = (label: string, icon: LucideIcon, children?: string[]): NavItem => ({
  label,
  icon,
  to: `/app/${slug(label)}`,
  children: children?.map((c) => ({ label: c, to: `/app/${slug(label)}/${slug(c)}` })),
});

const dashboard: NavItem = { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard };

const superAdminNav: NavItem[] = [
  dashboard,
  item("CRM", Contact),
  item("Customers", Users),
  item("Suppliers", Truck),
  item("Products", Package),
  item("Inventory", Boxes),
  item("Purchases", ShoppingCart),
  item("Production", Factory),
  item("QC Management", ShieldCheck),
  item("Sales", TrendingUp),
  item("Accounts", Wallet),
  item("Billing", CreditCard),
  item("Accounting", BookOpen),
  item("Payroll", KeyRound),
  item("Reports", FileBarChart),
  item("Export Management", Globe),
  item("Delegated Authority", ShieldCheck),
  item("Owner Vault", Lock),
  item("Notifications", Bell),
  item("User Management", UserCog),
  item("Settings", Settings),
];

// Admin shares the full nav except the Owner-only private vault.
const adminNav: NavItem[] = superAdminNav.filter((n) => n.to !== "/app/owner-vault");

const salesNav: NavItem[] = [
  dashboard,
  item("Leads", Target),
  item("Customers", Users),
  item("Quotations", FileText),
  item("Sales Orders", ClipboardList),
  item("Follow Ups", Bell),
  item("Payroll", KeyRound),
];

const supervisorNav: NavItem[] = [
  dashboard,
  item("Raw Material Entry", PackageCheck),
  item("Production", Factory),
  item("Batch Creation", Beaker),
  item("Warehouse", Warehouse),
  item("Dispatch", Send),
  item("Payroll", KeyRound),
];

const partnerNav: NavItem[] = [
  dashboard,
  item("Sales Reports", TrendingUp),
  item("Purchase Reports", ShoppingCart),
  item("Outstanding Reports", Receipt),
  item("Profit & Loss", PieChart),
  item("Business Analytics", LineChart),
];

const accountantNav: NavItem[] = [
  dashboard,
  item("Invoices", Receipt),
  item("Billing", CreditCard),
  item("Payments", Wallet),
  item("Accounting", BookOpen),
  item("Payroll", KeyRound),
  item("Outstanding Reports", FileBarChart),
  item("Expenses", FileText),
  item("Profit & Loss", PieChart),
];

const qcNav: NavItem[] = [
  dashboard,
  item("Pending QC", ShieldCheck),
  item("Batch Testing", Beaker),
  item("QC Reports", FileBarChart),
  item("Standards", ClipboardList),
  item("Payroll", KeyRound),
];

const warehouseNav: NavItem[] = [
  dashboard,
  item("Inventory", Boxes),
  item("Stock Entry", PackageCheck),
  item("Dispatch", Send),
  item("Warehouse", Warehouse),
  item("Payroll", KeyRound),
];

const distributorNav: NavItem[] = [
  dashboard,
  item("My Orders", ClipboardList),
  item("Products", Package),
  item("Outstanding Reports", Receipt),
  item("Invoices", Receipt),
];

const retailerNav: NavItem[] = [
  dashboard,
  item("My Orders", ClipboardList),
  item("Products", Package),
  item("Invoices", Receipt),
];

export const ROLE_NAV: Record<RoleId, NavItem[]> = {
  "super-admin": superAdminNav,
  admin: adminNav,
  partner: partnerNav,
  supervisor: supervisorNav,
  sales: salesNav,
  accountant: accountantNav,
  warehouse: warehouseNav,
  "qc-manager": qcNav,
  distributor: distributorNav,
  retailer: retailerNav,
};
