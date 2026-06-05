import { useSyncExternalStore } from "react";
import type { RoleId } from "./auth";
import { supabase } from "../supabase";

export const DELEGATABLE_PERMISSIONS = [
  "Purchase Approval",
  "Payment Approval",
  "Expense Approval",
  "Export Approval",
  "Sales Approval",
  "Inventory Adjustment Approval",
  "Product Price Change Approval",
  "Customer Credit Approval",
  "Supplier Payment Approval",
  "Financial Approval",
] as const;

export const PROTECTED_PERMISSIONS = [
  "Super Admin Email Change",
  "Super Admin Mobile Change",
  "Super Admin Password Change",
  "Ownership Transfer",
  "Create Super Admin",
  "Delete Audit Logs",
  "Delete Backups",
  "Disable Security",
  "Disable MFA",
  "Modify Core Permission Structure",
  "Access Owner Private Vault",
] as const;

export type DelegatablePermission = (typeof DELEGATABLE_PERMISSIONS)[number];
export type DurationOption = "until-revoked" | "1-day" | "3-days" | "7-days" | "custom";

export const DURATION_LABELS: Record<DurationOption, string> = {
  "until-revoked": "Until Revoked",
  "1-day": "1 Day",
  "3-days": "3 Days",
  "7-days": "7 Days",
  custom: "Custom Date Range",
};

export interface Delegation {
  id: string;
  userRole: RoleId;
  userName: string;
  permissions: string[];
  duration: DurationOption;
  startsAt: number;
  expiresAt: number | null;
  delegatedBy: string;
  status: "active" | "revoked" | "expired";
}

export interface DelegationAuditEntry {
  id: string;
  user: string;
  originalRole: RoleId;
  delegatedBy: string;
  permission: string;
  module: string;
  action: string;
  oldValue: string;
  newValue: string;
  timestamp: number;
  permissionSource: "Role Permission" | "Delegated Authority";
}

const listeners = new Set<() => void>();
let delegationsCache: Delegation[] = [];
let auditCache: DelegationAuditEntry[] = [];
let initialized = false;

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Fetch delegations and map to UI schema
async function fetchDelegations() {
  try {
    const { data, error } = await supabase
      .from("delegations")
      .select(`
        id,
        permissions,
        duration,
        starts_at,
        expires_at,
        status,
        delegator:delegator_id ( name ),
        delegatee:delegatee_id ( name, role )
      `)
      .order("starts_at", { ascending: false });

    if (error) throw error;

    delegationsCache = (data || []).map((row: any) => ({
      id: row.id,
      userRole: (row.delegatee?.role || "warehouse") as RoleId,
      userName: row.delegatee?.name || "ERP User",
      permissions: row.permissions,
      duration: row.duration as DurationOption,
      startsAt: new Date(row.starts_at).getTime(),
      expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : null,
      delegatedBy: row.delegator?.name || "System",
      status: row.status as "active" | "revoked" | "expired",
    }));

    emit();
  } catch (err) {
    console.error("Failed to fetch delegations:", err);
  }
}

// Fetch audit log entries
async function fetchAuditLog() {
  try {
    const { data, error } = await supabase
      .from("delegation_audit_logs")
      .select(`
        id,
        action,
        module,
        old_value,
        new_value,
        timestamp,
        permission_source,
        user:user_id ( name, role )
      `)
      .order("timestamp", { ascending: false });

    if (error) throw error;

    auditCache = (data || []).map((row: any) => ({
      id: row.id,
      user: row.user?.name || "ERP User",
      originalRole: (row.user?.role || "warehouse") as RoleId,
      delegatedBy: "Admin", // default representation
      permission: row.action,
      module: row.module,
      action: row.action,
      oldValue: row.old_value || "",
      newValue: row.new_value || "",
      timestamp: new Date(row.timestamp).getTime(),
      permissionSource: row.permission_source as "Role Permission" | "Delegated Authority",
    }));

    emit();
  } catch (err) {
    console.error("Failed to fetch audit log:", err);
  }
}

// Initialize Realtime subscription and initial load
if (typeof window !== "undefined" && !initialized) {
  initialized = true;

  fetchDelegations();
  fetchAuditLog();

  // Subscribe to delegations changes
  supabase
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "delegations" },
      () => {
        fetchDelegations();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "delegation_audit_logs" },
      () => {
        fetchAuditLog();
      }
    )
    .subscribe();
}

export function getDelegations(): Delegation[] {
  return delegationsCache;
}

export function getAuditLog(): DelegationAuditEntry[] {
  return auditCache;
}

function durationToExpiryDate(duration: DurationOption, customEnd?: string): string | null {
  const oneDay = 1000 * 60 * 60 * 24;
  switch (duration) {
    case "1-day":
      return new Date(Date.now() + oneDay).toISOString();
    case "3-days":
      return new Date(Date.now() + oneDay * 3).toISOString();
    case "7-days":
      return new Date(Date.now() + oneDay * 7).toISOString();
    case "custom":
      return customEnd ? new Date(customEnd).toISOString() : null;
    default:
      return null;
  }
}

export async function createDelegation(input: {
  userRole: RoleId;
  permissions: string[];
  duration: DurationOption;
  customEnd?: string;
  delegatedBy: string;
}) {
  // 1. Fetch delegatee user ID matching role
  const { data: delegatee } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("role", input.userRole)
    .limit(1)
    .maybeSingle();

  if (!delegatee) {
    throw new Error(`No user found with the role ${input.userRole}`);
  }

  // 2. Fetch delegator user ID (current active auth session)
  const { data: { session } } = await supabase.auth.getSession();
  const delegatorId = session?.user.id;

  if (!delegatorId) {
    throw new Error("You must be logged in to delegate authority.");
  }

  // 3. Insert new delegation record
  const expiryDate = durationToExpiryDate(input.duration, input.customEnd);
  const { error } = await supabase.from("delegations").insert({
    delegatee_id: delegatee.id,
    delegator_id: delegatorId,
    permissions: input.permissions,
    duration: input.duration,
    expires_at: expiryDate,
    status: "active",
  });

  if (error) throw error;
  
  // Refresh cache
  await fetchDelegations();
}

export async function revokeDelegation(id: string) {
  const { error } = await supabase
    .from("delegations")
    .update({ status: "revoked" })
    .eq("id", id);

  if (error) throw error;

  // Refresh cache
  await fetchDelegations();
}

export function useDelegations(): Delegation[] {
  return useSyncExternalStore(subscribe, getDelegations, () => []);
}

export function useAuditLog(): DelegationAuditEntry[] {
  return useSyncExternalStore(subscribe, getAuditLog, () => []);
}
