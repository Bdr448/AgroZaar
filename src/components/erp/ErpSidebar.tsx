import { Link, useRouter } from "@/lib/simple-router";
import { useState } from "react";
import { Leaf, ChevronDown, ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/erp/roles";
import { ROLE_LABELS } from "@/lib/erp/roles";
import type { RoleId } from "@/lib/erp/auth";

export function ErpSidebar({
  nav,
  role,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  nav: NavItem[];
  role: RoleId;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { route } = useRouter();
  const pathname = route;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 lg:static",
          collapsed ? "w-[76px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          {!collapsed && (
            <span className="flex flex-col leading-none">
              <span className="font-heading text-base font-extrabold text-white">Agrozaar</span>
              <span className="text-[0.6rem] font-medium tracking-[0.2em] text-sidebar-muted">
                FOODS LLP
              </span>
            </span>
          )}
          <button
            className="ml-auto text-sidebar-muted hover:text-white lg:hidden"
            onClick={onCloseMobile}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role chip */}
        {!collapsed && (
          <div className="px-4 pt-4">
            <div className="rounded-lg bg-sidebar-accent px-3 py-2">
              <p className="text-[0.65rem] uppercase tracking-wider text-sidebar-muted">
                Signed in as
              </p>
              <p className="text-sm font-semibold text-white">{ROLE_LABELS[role]}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((it) => (
            <NavRow
              key={it.to}
              item={it}
              collapsed={collapsed}
              pathname={pathname}
              onNavigate={onCloseMobile}
            />
          ))}
        </nav>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={onToggleCollapse}
          className="hidden items-center gap-2 border-t border-sidebar-border px-4 py-3 text-sm text-sidebar-muted transition-colors hover:text-white lg:flex"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Collapse"}
        </button>
      </aside>
    </>
  );
}

function NavRow({
  item,
  collapsed,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = pathname === item.to || pathname.startsWith(item.to + "/");
  const [open, setOpen] = useState(active);
  const Icon = item.icon;

  if (item.children && !collapsed) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            active
              ? "bg-primary/15 text-white"
              : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-white",
          )}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="mt-1 space-y-0.5 pl-9">
            {item.children.map((c) => {
              const cActive = pathname === c.to;
              return (
                <Link
                  key={c.to}
                  to={c.to}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm transition-colors",
                    cActive ? "text-primary" : "text-sidebar-muted hover:text-white",
                  )}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "justify-center",
        active
          ? "bg-primary text-primary-foreground shadow-soft"
          : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-white",
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
