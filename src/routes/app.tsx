import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ErpSidebar } from "@/components/erp/ErpSidebar";
import { ErpHeader } from "@/components/erp/ErpHeader";
import { useSession, isSessionExpired } from "@/lib/erp/auth";
import { ROLE_NAV } from "@/lib/erp/roles";
import { initDelegationStore } from "@/lib/erp/delegation";
import { log } from "@/lib/logger";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "ERP Workspace — Agrozaar Foods LLP" }] }),
  component: ErpLayout,
});

let delegationInitialized = false;

function ErpLayout() {
  const user = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Init delegation store ONCE when user is first available
  useEffect(() => {
    if (user && !delegationInitialized) {
      delegationInitialized = true;
      log.info("ERP", "Initializing delegation store (once)");
      initDelegationStore();
    }
  }, [user]);

  // Redirect to login if no user — TanStack Router will handle this synchronously
  if (!user) {
    log.warn("ERP", "No user — redirecting to login");
    return <Navigate to={isSessionExpired() ? "/session-expired" : "/login"} />;
  }

  const nav = ROLE_NAV[user.role] || [];

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ErpSidebar
        nav={nav}
        role={user.role}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <ErpHeader user={user} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
