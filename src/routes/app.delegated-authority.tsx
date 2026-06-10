import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/simple-router";
import { useState } from "react";
import { ShieldCheck, Plus, Ban, History, Clock } from "lucide-react";
import { PageHeader, Panel, StatusBadge, StatCard } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { useSession } from "@/lib/erp/auth";
import { ROLE_LABELS } from "@/lib/erp/roles";
import { toast } from "sonner";
import type { RoleId } from "@/lib/erp/auth";
import {
  DELEGATABLE_PERMISSIONS,
  PROTECTED_PERMISSIONS,
  DURATION_LABELS,
  type DurationOption,
  type Delegation,
  useDelegations,
  useAuditLog,
  createDelegation,
  revokeDelegation,
} from "@/lib/erp/delegation";

export const Route = createFileRoute("/app/delegated-authority")({
  head: () => ({ meta: [{ title: "Delegated Authority — Agrozaar Foods LLP ERP" }] }),
  component: DelegatedAuthorityPage,
});

const ASSIGNABLE_ROLES: RoleId[] = [
  "partner",
  "supervisor",
  "sales",
  "accountant",
  "warehouse",
  "qc-manager",
  "admin",
];

export default function DelegatedAuthorityPage() {
  const user = useSession();
  const delegations = useDelegations();
  const audit = useAuditLog();

  const [role, setRole] = useState<RoleId>("partner");
  const [perms, setPerms] = useState<string[]>([]);
  const [duration, setDuration] = useState<DurationOption>("7-days");
  const [customEnd, setCustomEnd] = useState("");

  if (!user) return null;
  if (user.role !== "super-admin" && user.role !== "admin") return <Navigate to="/app/dashboard" />;

  const activeCount = delegations.filter((d) => d.status === "active").length;

  const togglePerm = (p: string) =>
    setPerms((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const activate = async () => {
    if (perms.length === 0) return;
    try {
      await createDelegation({
        userRole: role,
        permissions: perms,
        duration,
        customEnd,
        delegatedBy: user.name,
      });
      setPerms([]);
      toast.success("Delegated authority activated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to activate authority.");
    }
  };

  const delColumns: Column<Delegation & Record<string, unknown>>[] = [
    { key: "userName", header: "User", sortable: true },
    {
      key: "permissions",
      header: "Permissions",
      render: (r) => <span className="text-xs">{r.permissions.join(", ")}</span>,
    },
    { key: "duration", header: "Duration", render: (r) => DURATION_LABELS[r.duration] },
    {
      key: "expiresAt",
      header: "Expires",
      render: (r) => (r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : "Until revoked"),
    },
    { key: "delegatedBy", header: "Delegated By" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge
          label={r.status}
          tone={r.status === "active" ? "success" : r.status === "expired" ? "warning" : "neutral"}
        />
      ),
    },
    {
      key: "id",
      header: "Action",
      align: "right",
      render: (r) =>
        r.status === "active" ? (
          <button
            onClick={async () => {
              try {
                await revokeDelegation(r.id);
                toast.success("Delegated authority revoked.");
              } catch (err: any) {
                toast.error(err.message || "Failed to revoke authority.");
              }
            }}
            className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
          >
            <Ban className="h-3.5 w-3.5" /> Revoke
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Delegated Authority"
        subtitle="Grant temporary permissions on top of a user's role. Delegation never replaces the original role."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active delegations"
          value={String(activeCount)}
          icon={ShieldCheck}
          tone="primary"
        />
        <StatCard
          label="Total grants"
          value={String(delegations.length)}
          icon={Clock}
          tone="brown"
        />
        <StatCard label="Audit entries" value={String(audit.length)} icon={History} tone="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grant panel */}
        <Panel title="Grant Authority">
          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Select User
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleId)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Additional Permissions
              </label>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {DELEGATABLE_PERMISSIONS.map((p) => (
                  <label
                    key={p}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-secondary/50"
                  >
                    <input
                      type="checkbox"
                      checked={perms.includes(p)}
                      onChange={() => togglePerm(p)}
                      className="accent-[var(--primary)]"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as DurationOption)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {Object.entries(DURATION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {duration === "custom" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <button
              onClick={activate}
              disabled={perms.length === 0}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Activate Authority
            </button>
          </div>
        </Panel>

        {/* Protected perms */}
        <Panel title="Ownership-Protected Permissions">
          <div className="p-5">
            <p className="mb-3 text-sm text-muted-foreground">
              These permissions can never be delegated and remain Owner-only.
            </p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {PROTECTED_PERMISSIONS.map((p) => (
                <span
                  key={p}
                  className="flex items-center gap-2 rounded-md bg-destructive/8 px-2.5 py-1.5 text-xs text-destructive"
                >
                  <Ban className="h-3.5 w-3.5 shrink-0" /> {p}
                </span>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-heading text-base font-semibold text-foreground">
          Active & Past Delegations
        </h3>
        <DataTable
          columns={delColumns}
          data={delegations as (Delegation & Record<string, unknown>)[]}
          emptyLabel="No delegations granted yet"
        />
      </div>
    </>
  );
}
