import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, Lock, Mail, ShieldCheck, Eye, EyeOff, Globe, Award } from "lucide-react";
import { toast } from "sonner";
import { login, useSession, type RoleId } from "@/lib/erp/auth";
import { ROLE_LABELS } from "@/lib/erp/roles";
import heroTurmeric from "@/assets/hero-turmeric.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Secure ERP Login — Agrozaar Foods LLP" },
      { name: "description", content: "Secure access to the Agrozaar Foods LLP enterprise resource planning system." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const user = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleId>("super-admin");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/app/dashboard" });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, role, password);
      toast.success("Secure access granted.");
      navigate({ to: "/app/dashboard" });
    } catch (err: any) {
      // Show specific error messages in Hinglish for common failures
      const msg = err?.message || "";
      if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) {
        toast.error("Email ya password galat hai. Check karo.");
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Email verify nahi hua. Inbox check karo.");
      } else if (msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch")) {
        toast.error("Network error — internet connection check karo ya thodi der baad try karo.");
      } else {
        toast.error(msg || "Login nahi hua. Dobara try karo.");
      }
    } finally {
      // Always unfreeze the button — no matter what happens
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branding side */}
      <div className="relative hidden overflow-hidden lg:block">
        <img src={heroTurmeric} alt="Premium spice manufacturing" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-spice-brown/85 via-spice-brown/70 to-spice-brown/90" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-6 w-6" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-heading text-xl font-extrabold">Agrozaar</span>
              <span className="text-[0.65rem] font-medium tracking-[0.22em] text-white/70">FOODS LLP</span>
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="font-heading text-4xl font-extrabold leading-tight">Pure Spices.<br />Pure Trust.</h1>
            <p className="mt-4 text-white/80">
              Enterprise resource planning for premium spice manufacturing and export operations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, label: "ISO Quality" },
                { icon: Globe, label: "Export Ready" },
                { icon: Award, label: "FSSAI Certified" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                  <b.icon className="h-4 w-4" /> {b.label}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/60">© {new Date().getFullYear()} Agrozaar Foods LLP. Confidential ERP system.</p>
        </div>
      </div>

      {/* Login form side */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-heading text-lg font-extrabold text-spice-brown">Agrozaar Foods LLP</span>
          </div>

          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-spice-brown">
            <Lock className="h-3.5 w-3.5" /> Secure ERP Access
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Sign in to your workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back. Please enter your credentials to continue.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field label="Email Address">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@agrozaarfoods.com"
                  className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-3 text-sm shadow-soft outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-10 text-sm shadow-soft outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field label="Access Role (demo)">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleId)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm shadow-soft outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {Object.entries(ROLE_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </Field>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-input accent-[var(--primary)]" />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-primary hover:underline">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" /> {loading ? "Authenticating…" : "Secure Login"}
            </button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> 256-bit encrypted • Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
