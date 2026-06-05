import { useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut, Plus, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout, type ErpUser } from "@/lib/erp/auth";
import { ROLE_LABELS } from "@/lib/erp/roles";

const NOTIFICATIONS = [
  { id: 1, title: "Low stock alert", desc: "Turmeric Powder below reorder level", time: "10m ago", tone: "destructive" },
  { id: 2, title: "New export order", desc: "Order #EXP-2041 from UAE confirmed", time: "1h ago", tone: "accent" },
  { id: 3, title: "QC approval pending", desc: "Batch #B-1187 awaiting inspection", time: "3h ago", tone: "primary" },
  { id: 4, title: "Payment received", desc: "₹4,80,000 from Spice Traders Co.", time: "Yesterday", tone: "accent" },
];

export function ErpHeader({ user, onOpenMobile }: { user: ErpUser; onOpenMobile: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-md lg:px-6">
      <button className="text-foreground lg:hidden" onClick={onOpenMobile} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 md:block md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search orders, products, customers…"
          className="w-full rounded-lg border border-input bg-secondary/60 py-2 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 sm:inline-flex">
          <Plus className="h-4 w-4" /> New
        </button>
        <NotificationBell />
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}

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

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary" aria-label="Notifications">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">4 new</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {NOTIFICATIONS.map((n) => (
              <div key={n.id} className="flex gap-3 border-b border-border/60 px-4 py-3 transition-colors hover:bg-secondary/50">
                <Circle className={cn("mt-1 h-2 w-2 shrink-0 fill-current", n.tone === "destructive" ? "text-destructive" : n.tone === "accent" ? "text-accent" : "text-primary")} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{n.desc}</p>
                  <p className="mt-0.5 text-[0.7rem] text-muted-foreground/70">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full bg-secondary/40 py-2.5 text-center text-sm font-medium text-primary hover:bg-secondary">View all activity</button>
        </div>
      )}
    </div>
  );
}

function ProfileMenu({ user }: { user: ErpUser }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  const initials = user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors hover:bg-secondary">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-spice-brown text-xs font-semibold text-white">{initials}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-semibold text-foreground">{user.name}</span>
          <span className="block text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{ROLE_LABELS[user.role]}</span>
          </div>
          <div className="py-1">
            <MenuLink icon={User} label="My Profile" />
            <MenuLink icon={Settings} label="Settings" />
          </div>
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="flex w-full items-center gap-2.5 border-t border-border px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary">
      <Icon className="h-4 w-4 text-muted-foreground" /> {label}
    </button>
  );
}
