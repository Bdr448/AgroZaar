import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/simple-router";
import { useState } from "react";
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/erp/AuthShell";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — Agrozaar Foods LLP ERP" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address.");
    setSent(true);
    toast.success("Reset link sent (demo).");
  };

  if (sent) {
    return (
      <AuthShell
        icon={<CheckCircle2 className="h-7 w-7" />}
        iconTone="accent"
        title="Check your inbox"
        description={`We've sent password reset instructions to ${email}.`}
      >
        <Link
          to="/reset-password"
          className="block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
        >
          Continue to reset
        </Link>
        <Link
          to="/login"
          className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      icon={<KeyRound className="h-7 w-7" />}
      title="Forgot your password?"
      description="Enter your registered email and we'll send you a secure reset link."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@agrozaarfoods.com"
            className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-3 text-sm shadow-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
        >
          Send reset link
        </button>
        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </form>
    </AuthShell>
  );
}
