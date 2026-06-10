import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/* ---------- Page header ---------- */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Stat card ---------- */
export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  tone = "primary",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: { value: string; up: boolean };
  tone?: "primary" | "accent" | "brown" | "destructive";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    brown: "bg-spice-brown/10 text-spice-brown",
    destructive: "bg-destructive/10 text-destructive",
  } as const;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between">
        <span
          className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneMap[tone])}
        >
          <Icon className="h-5 w-5" />
        </span>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              delta.up ? "text-accent" : "text-destructive",
            )}
          >
            {delta.up ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {delta.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/* ---------- Status badge ---------- */
type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";
export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  const map: Record<BadgeTone, string> = {
    success: "bg-accent/12 text-accent",
    warning: "bg-primary/12 text-primary",
    danger: "bg-destructive/12 text-destructive",
    info: "bg-spice-brown/12 text-spice-brown",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        map[tone],
      )}
    >
      {label}
    </span>
  );
}

/* ---------- Card container ---------- */
export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card shadow-soft", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
