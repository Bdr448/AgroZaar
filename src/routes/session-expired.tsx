import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/simple-router";
import { Clock, LogIn } from "lucide-react";
import { AuthShell } from "@/components/erp/AuthShell";

export const Route = createFileRoute("/session-expired")({
  head: () => ({ meta: [{ title: "Session Expired — Agrozaar Foods LLP ERP" }] }),
  component: SessionExpired,
});

function SessionExpired() {
  return (
    <AuthShell
      icon={<Clock className="h-7 w-7" />}
      iconTone="accent"
      title="Your session has expired"
      description="For your security, you've been signed out due to inactivity. Please sign in again to continue."
    >
      <Link
        to="/login"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
      >
        <LogIn className="h-4 w-4" /> Sign in again
      </Link>
    </AuthShell>
  );
}
