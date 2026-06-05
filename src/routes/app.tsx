import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ErpSidebar } from "@/components/erp/ErpSidebar";
import { ErpHeader } from "@/components/erp/ErpHeader";
import { useSession, isSessionExpired } from "@/lib/erp/auth";
import { ROLE_NAV } from "@/lib/erp/roles";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "ERP Workspace — Agrozaar Foods LLP" }] }),
  component: ErpLayout,
});

function ErpLayout() {
  const navigate = useNavigate();
  const user = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) {
      navigate({ to: isSessionExpired() ? "/session-expired" : "/login" });
      return;
    }
    setReady(true);
  }, [user, navigate]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const nav = ROLE_NAV[user.role];

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
