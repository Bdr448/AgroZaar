import { useSyncExternalStore } from "react";
import { isSupabaseConfigured, supabase } from "../supabase";
import { log } from "../logger";

export type RoleId =
  | "super-admin"
  | "admin"
  | "partner"
  | "supervisor"
  | "sales"
  | "accountant"
  | "warehouse"
  | "qc-manager"
  | "distributor"
  | "retailer";

export interface ErpUser {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  loginAt: number;
}

const listeners = new Set<() => void>();
let cachedUser: ErpUser | null = null;
let fetchingUserId: string | null = null;
let initialized = false;
const TIMEOUT_MS = 12_000;

function withTimeout<T>(p: PromiseLike<T>, msg: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(msg)), TIMEOUT_MS);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

function emit() { listeners.forEach((l) => l()); }

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

async function fetchProfile(userId: string, email: string): Promise<ErpUser> {
  log.info("AUTH", `fetchProfile → ${userId}`);
  const end = log.time("fetchProfile");
  try {
    const { data, error } = await withTimeout(
      supabase.from("user_profiles").select("name, role").eq("id", userId).maybeSingle(),
      "Profile fetch timed out.",
    );
    if (error) log.warn("AUTH", "profile query error", error);
    log.info("AUTH", `fetchProfile ← ${JSON.stringify(data)}`);
    end();
    return { id: userId, name: data?.name || "ERP User", email, role: (data?.role || "warehouse") as RoleId, loginAt: Date.now() };
  } catch (err) {
    log.error("AUTH", "fetchProfile failed — fallback", err);
    end();
    return { id: userId, name: "ERP User", email, role: "warehouse", loginAt: Date.now() };
  }
}

function fetchProfileDeferred(userId: string, email: string) {
  if (cachedUser?.id === userId || fetchingUserId === userId) return;
  fetchingUserId = userId;
  setTimeout(async () => {
    try {
      if (cachedUser?.id === userId) return;
      cachedUser = await fetchProfile(userId, email);
      log.info("AUTH", `profile ready → role=${cachedUser.role}`);
      emit();
    } finally {
      fetchingUserId = null;
    }
  }, 10);
}

// Called on first login form submit — keeps Supabase auth off the page-load critical path
export function initAuthListener() {
  if (initialized || !isSupabaseConfigured) return;
  initialized = true;
  log.info("AUTH", "Starting auth listener...");

  withTimeout(supabase.auth.getSession(), "getSession timed out.")
    .then(({ data: { session } }) => {
      log.info("AUTH", `getSession → ${session ? session.user.email : "no session"}`);
      if (session?.user) fetchProfileDeferred(session.user.id, session.user.email ?? "");
    })
    .catch((err) => log.warn("AUTH", "getSession failed", err));

  supabase.auth.onAuthStateChange((event, session) => {
    log.event("AUTH", `onAuthStateChange → ${event} user=${session?.user?.email ?? "null"}`);
    if (session?.user) {
      fetchProfileDeferred(session.user.id, session.user.email ?? "");
    } else {
      const wasLoggedIn = cachedUser !== null;
      cachedUser = null;
      if (wasLoggedIn) { log.info("AUTH", "logged out"); emit(); }
    }
  });
}

export function getSession(): ErpUser | null { return cachedUser; }
export function isSessionExpired(): boolean { return false; }

export const ROLE_NAMES_BY_ROLE: Record<RoleId, string> = {
  "super-admin": "Sharad Patel",
  admin: "Admin User",
  partner: "Business Partner",
  supervisor: "Plant Supervisor",
  sales: "Sales Executive",
  accountant: "Accounts Manager",
  warehouse: "Warehouse User",
  "qc-manager": "QC Manager",
  distributor: "Distributor User",
  retailer: "Retailer User",
};

export async function login(email: string, _role: RoleId, password?: string) {
  log.group(`LOGIN — ${email} role=${_role}`);
  if (!isSupabaseConfigured) {
    log.warn("AUTH", "Supabase not configured. Falling back to local demo login.");
    cachedUser = {
      id: "demo-user-id",
      name: ROLE_NAMES_BY_ROLE[_role] || "Demo User",
      email: email || "demo@example.com",
      role: _role,
      loginAt: Date.now(),
    };
    emit();
    log.groupEnd();
    return cachedUser;
  }

  log.info("AUTH", "signInWithPassword...");
  const end = log.time("signInWithPassword");
  const { data, error } = await withTimeout(
    supabase.auth.signInWithPassword({ email, password: password || "demo-password-123" }),
    "Login timed out.",
  );
  end();

  if (error) { log.error("AUTH", error.message, error); log.groupEnd(); throw error; }
  log.info("AUTH", `signed in → userId=${data.user?.id}`);

  if (data.user) {
    fetchingUserId = data.user.id;
    try {
      // Update the user's role in the user_profiles table so they get the chosen access rights in both client and RLS policies
      const { error: roleUpdateError } = await supabase
        .from("user_profiles")
        .update({ role: _role })
        .eq("id", data.user.id);

      if (roleUpdateError) {
        log.warn("AUTH", "Failed to update profile role in database on login:", roleUpdateError.message);
      } else {
        log.info("AUTH", `Updated user profile role to ${_role} in database`);
      }

      cachedUser = await fetchProfile(data.user.id, data.user.email || email);
      log.info("AUTH", `login complete → role=${cachedUser.role}`);
      emit();
      log.groupEnd();
      return cachedUser;
    } finally {
      fetchingUserId = null;
    }
  }

  log.groupEnd();
  throw new Error("Login failed — no user returned.");
}

export function logout() {
  cachedUser = null;
  supabase.auth.signOut().catch(console.error);
  emit();
}

export function useSession(): ErpUser | null {
  return useSyncExternalStore(subscribe, getSession, () => null);
}
