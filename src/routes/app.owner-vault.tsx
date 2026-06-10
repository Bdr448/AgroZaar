import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/simple-router";
import { useState } from "react";
import {
  Lock,
  KeyRound,
  FileText,
  Landmark,
  FileSignature,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { PageHeader, Panel } from "@/components/erp/widgets";
import { useSession } from "@/lib/erp/auth";

export const Route = createFileRoute("/app/owner-vault")({
  head: () => ({
    meta: [
      { title: "Owner Private Vault — Agrozaar Foods LLP ERP" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OwnerVaultPage,
});

const VAULT_ITEMS = [
  {
    icon: Landmark,
    label: "Banking Information",
    value: "HDFC •••• 4821 · Current A/c",
    group: "Banking",
  },
  {
    icon: FileSignature,
    label: "Export Contract — Gulf Spice Trading LLC",
    value: "Valid till Mar 2027",
    group: "Contracts",
  },
  {
    icon: FileText,
    label: "FSSAI & APEDA Certificates",
    value: "3 confidential documents",
    group: "Documents",
  },
  {
    icon: KeyRound,
    label: "Payment Gateway API Key",
    value: "sk_live_••••••••••••8f2a",
    group: "API Keys",
  },
  {
    icon: FileText,
    label: "5-Year Expansion Strategy",
    value: "Strategic plan 2026–2031",
    group: "Strategic",
  },
  {
    icon: Lock,
    label: "Supplier Pricing Secrets",
    value: "Confidential margin sheet",
    group: "Business Secrets",
  },
];

export default function OwnerVaultPage() {
  const user = useSession();
  const [revealed, setRevealed] = useState(false);

  if (!user) return null;
  // Owner-only. Hidden from all other roles, including delegated users.
  if (user.role !== "super-admin") return <Navigate to="/app/dashboard" />;

  return (
    <>
      <PageHeader
        title="Owner Private Vault"
        subtitle="Owner-only secure storage. Hidden from all roles and delegated users."
      />

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-4 text-sm text-destructive">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        <p>
          This vault is not searchable, not URL-accessible to non-owners, and excluded from global
          search.
        </p>
      </div>

      <Panel
        title="Confidential Records"
        action={
          <button
            onClick={() => setRevealed((r) => !r)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm font-medium hover:bg-secondary"
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {revealed ? "Hide" : "Reveal"}
          </button>
        }
      >
        <div className="divide-y divide-border">
          {VAULT_ITEMS.map((it) => (
            <div key={it.label} className="flex items-center gap-3 px-5 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-spice-brown/10 text-spice-brown">
                <it.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{it.label}</p>
                <p className="truncate text-xs text-muted-foreground">{it.group}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {revealed ? it.value : "••••••••••••"}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
