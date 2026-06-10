import { useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Plus,
  Circle,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout, type ErpUser } from "@/lib/erp/auth";
import { ROLE_LABELS } from "@/lib/erp/roles";

/* ─── Notification data ─────────────────────────────────── */
const NOTIFICATIONS = [
  {
    id: 1,
    icon: AlertTriangle,
    iconClass: "text-destructive bg-destructive/10",
    title: "Low stock alert",
    desc: "Turmeric Powder below reorder level (120 kg)",
    time: "10m ago",
    to: "/app/inventory",
    read: false,
  },
  {
    id: 2,
    icon: TrendingUp,
    iconClass: "text-accent bg-accent/10",
    title: "New export order confirmed",
    desc: "Order #EXP-2041 from Gulf Spice Trading LLC",
    time: "1h ago",
    to: "/app/export-management",
    read: false,
  },
  {
    id: 3,
    icon: ShieldCheck,
    iconClass: "text-primary bg-primary/10",
    title: "QC approval pending",
    desc: "Batch #B-1187 awaiting quality inspection",
    time: "3h ago",
    to: "/app/qc-management",
    read: false,
  },
  {
    id: 4,
    icon: Wallet,
    iconClass: "text-accent bg-accent/10",
    title: "Payment received",
    desc: "Rs. 4,80,000 from Spice Traders Co.",
    time: "Yesterday",
    to: "/app/accounts",
    read: true,
  },
];

/* ─── Search routes index ───────────────────────────────── */
const SEARCH_ROUTES: { label: string; to: string; keywords: string[] }[] = [
  { label: "Dashboard", to: "/app/dashboard", keywords: ["home", "overview"] },
  { label: "CRM", to: "/app/crm", keywords: ["leads", "pipeline"] },
  { label: "Customers", to: "/app/customers", keywords: ["customer", "client", "buyer"] },
  { label: "Suppliers", to: "/app/suppliers", keywords: ["supplier", "vendor", "farm"] },
  { label: "Products", to: "/app/products", keywords: ["product", "sku", "catalog", "spice"] },
  { label: "Inventory", to: "/app/inventory", keywords: ["stock", "warehouse", "inward"] },
  { label: "Purchases", to: "/app/purchases", keywords: ["purchase", "buy"] },
  { label: "Production", to: "/app/production", keywords: ["production", "batch", "grind"] },
  { label: "QC Management", to: "/app/qc-management", keywords: ["quality", "qc", "inspection"] },
  { label: "Sales", to: "/app/sales", keywords: ["sales", "order", "revenue"] },
  { label: "Billing", to: "/app/billing", keywords: ["billing", "invoice", "bill"] },
  { label: "Accounts", to: "/app/accounts", keywords: ["account", "bank", "ledger"] },
  { label: "Accounting", to: "/app/accounting", keywords: ["accounting", "voucher", "journal"] },
  { label: "Payroll", to: "/app/payroll", keywords: ["payroll", "salary", "pay", "slip"] },
  { label: "Reports", to: "/app/reports", keywords: ["report", "analytics"] },
  {
    label: "Export Management",
    to: "/app/export-management",
    keywords: ["export", "dispatch", "challan", "shipment"],
  },
  { label: "Notifications", to: "/app/notifications", keywords: ["notification", "alert"] },
  {
    label: "User Management",
    to: "/app/user-management",
    keywords: ["user", "role", "access", "employee"],
  },
  { label: "Settings", to: "/app/settings", keywords: ["settings", "config"] },
];

/* ─── Click-outside helper ──────────────────────────────── */
function useOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return ref;
}

/* ─── Main Header ───────────────────────────────────────── */
export function ErpHeader({ user, onOpenMobile }: { user: ErpUser; onOpenMobile: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results =
    query.trim().length > 0
      ? SEARCH_ROUTES.filter(
          (r) =>
            r.label.toLowerCase().includes(query.toLowerCase()) ||
            r.keywords.some((k) => k.includes(query.toLowerCase())),
        ).slice(0, 7)
      : [];

  const handleSearchSelect = (to: string) => {
    navigate({ to: to as any });
    setQuery("");
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-md lg:px-6">
      {/* Mobile menu trigger */}
      <button className="text-foreground lg:hidden" onClick={onOpenMobile} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <div className="relative hidden flex-1 md:block md:max-w-md" ref={searchRef}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search modules, products, orders…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          className="w-full rounded-lg border border-input bg-secondary/60 py-2 pl-10 pr-8 text-sm outline-none transition-colors focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
        />
        {/* Clear button */}
        {query.length > 0 && (
          <button
            onClick={() => {
              setQuery("");
              setSearchOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {/* Search results dropdown */}
        {searchOpen && results.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-card">
            <p className="border-b border-border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Modules
            </p>
            {results.map((r) => (
              <button
                key={r.to}
                onMouseDown={() => handleSearchSelect(r.to)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
              >
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {r.label}
              </button>
            ))}
          </div>
        )}
        {searchOpen && query.trim().length > 0 && results.length === 0 && (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-card px-4 py-3 text-sm text-muted-foreground">
            No modules found for "{query}"
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* New Invoice quick-action */}
        <button
          onClick={() => navigate({ to: "/app/billing" as any })}
          className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </button>

        <NotificationBell />
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}

/* ─── Notification Bell ─────────────────────────────────── */
function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(new Set([4])); // id 4 starts read
  const ref = useOutside(() => setOpen(false));

  const unreadCount = NOTIFICATIONS.filter((n) => !readIds.has(n.id)).length;

  const markRead = (id: number) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const handleNotifClick = (n: (typeof NOTIFICATIONS)[0]) => {
    markRead(n.id);
    setOpen(false);
    navigate({ to: n.to as any });
  };

  const markAllRead = () => {
    setReadIds(new Set(NOTIFICATIONS.map((n) => n.id)));
    setOpen(false);
    navigate({ to: "/app/notifications" as any });
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ""}`}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[0.6rem] font-bold text-white ring-2 ring-card">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-84 min-w-[320px] overflow-hidden rounded-xl border border-border bg-popover shadow-card">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              {unreadCount > 0 && (
                <span className="rounded-full bg-destructive px-2 py-0.5 text-[0.65rem] font-bold text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => setReadIds(new Set(NOTIFICATIONS.map((n) => n.id)))}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification rows */}
          <div className="max-h-[340px] overflow-y-auto">
            {NOTIFICATIONS.map((n) => {
              const Icon = n.icon;
              const isRead = readIds.has(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={cn(
                    "flex w-full gap-3 border-b border-border/50 px-4 py-3.5 text-left transition-colors hover:bg-secondary/60",
                    !isRead && "bg-primary/[0.03]",
                  )}
                >
                  {/* Icon */}
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      n.iconClass,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm",
                          !isRead
                            ? "font-semibold text-foreground"
                            : "font-medium text-foreground/80",
                        )}
                      >
                        {n.title}
                      </p>
                      {!isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{n.desc}</p>
                    <p className="mt-1 text-[0.68rem] text-muted-foreground/70">{n.time}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <button
            onClick={markAllRead}
            className="flex w-full items-center justify-center gap-1.5 bg-secondary/40 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-secondary"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Profile Menu ──────────────────────────────────────── */
function ProfileMenu({ user }: { user: ErpUser }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const go = (to: string) => {
    setOpen(false);
    navigate({ to: to as any });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors hover:bg-secondary"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-spice-brown text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-semibold text-foreground">{user.name}</span>
          <span className="block text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
        </span>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-muted-foreground transition-transform sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-card">
          {/* User info */}
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {ROLE_LABELS[user.role]}
            </span>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <MenuLink icon={User} label="My Profile" onClick={() => go("/app/user-management")} />
            <MenuLink icon={Settings} label="Settings" onClick={() => go("/app/settings")} />
            <MenuLink icon={Bell} label="Notifications" onClick={() => go("/app/notifications")} />
          </div>

          {/* Sign out */}
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="flex w-full items-center gap-2.5 border-t border-border px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Menu link helper ──────────────────────────────────── */
function MenuLink({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof User;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </button>
  );
}
