import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { useSession } from "@/lib/erp/auth";

// Lazy-load dashboards so recharts (~393KB) is NOT bundled into the login page
const RoleDashboard = lazy(() =>
  import("@/components/erp/dashboards").then((m) => ({ default: m.RoleDashboard })),
);

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Agrozaar Foods LLP ERP" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const user = useSession();
  if (!user) return null;
  return (
    <Suspense fallback={<div className="flex h-40 items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <RoleDashboard role={user.role} />
    </Suspense>
  );
}
