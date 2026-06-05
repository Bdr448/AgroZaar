import { createFileRoute } from "@tanstack/react-router";
import { RoleDashboard } from "@/components/erp/dashboards";
import { useSession } from "@/lib/erp/auth";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Agrozaar Foods LLP ERP" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const user = useSession();
  if (!user) return null;
  return <RoleDashboard role={user.role} />;
}
