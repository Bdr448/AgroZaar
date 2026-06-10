import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/simple-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { AuthShell } from "@/components/erp/AuthShell";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({ meta: [{ title: "Access Denied — Agrozaar Foods LLP ERP" }] }),
  component: Unauthorized,
});

function Unauthorized() {
  return (
    <AuthShell
      icon={<ShieldAlert className="h-7 w-7" />}
      iconTone="destructive"
      title="Unauthorized access"
      description="You don't have permission to view this page. Contact your administrator if you believe this is an error."
    >
      <Link
        to="/app/dashboard"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
    </AuthShell>
  );
}
