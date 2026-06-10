import { useSyncExternalStore } from "react";
import { isSupabaseConfigured, supabase } from "../supabase";

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
let initialized = false;
const AUTH_TIMEOUT_MS = 12_000;

function withTimeout<T>(promise: PromiseLike<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = globalThis.setTimeout(() => {
      reject(new Error(message));
    }, AUTH_TIMEOUT_MS);

    promise.then(
      (value) => {
        globalThis.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        globalThis.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Fetch user profile from public.user_profiles
async function fetchUserProfile(userId: string, email: string): Promise<ErpUser> {
  try {
    const { data: profile } = await withTimeout(
      supabase
        .from("user_profiles")
        .select("name, role")
        .eq("id", userId)
        .maybeSingle(),
      "Profile request timed out.",
    );

    return {
      id: userId,
      name: profile?.name || "ERP User",
      email,
      role: (profile?.role || "warehouse") as RoleId,
      loginAt: Date.now(),
    };
  } catch {
    return { id: userId, name: "ERP User", email, role: "warehouse" as RoleId, loginAt: Date.now() };
  }
}

// Defer profile fetch to prevent deadlocks in Supabase client request queue
const fetchUserProfileDeferred = (userId: string, email: string) => {
  if (cachedUser && cachedUser.id === userId) return;
  setTimeout(async () => {
    if (cachedUser && cachedUser.id === userId) return;
    cachedUser = await fetchUserProfile(userId, email);
    emit();
  }, 10);
};

// Initialize session listener
if (typeof window !== "undefined" && isSupabaseConfigured && !initialized) {
  initialized = true;

  withTimeout(supabase.auth.getSession(), "Session request timed out.")
    .then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfileDeferred(session.user.id, session.user.email || "");
      }
    })
    .catch(console.warn);

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      fetchUserProfileDeferred(session.user.id, session.user.email || "");
    } else {
      const wasLoggedIn = cachedUser !== null;
      cachedUser = null;
      // Only emit if we actually had a user before (logout), not on initial load
      if (wasLoggedIn) emit();
    }
  });
}

export function getSession(): ErpUser | null {
  return cachedUser;
}

export function isSessionExpired(): boolean {
  // Supabase manages session tokens automatically
  return false;
}

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

export async function login(email: string, role: RoleId, password?: string) {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Render, then redeploy.",
    );
  }

  const { data, error } = await withTimeout(
    supabase.auth.signInWithPassword({
      email,
      password: password || "demo-password-123",
    }),
    "Login request timed out. Please check the Vercel Supabase environment variables and try again.",
  );

  if (error) throw error;

  if (data.user) {
    cachedUser = await fetchUserProfile(data.user.id, data.user.email || email);
    emit();
    return cachedUser;
  }

  // Fallback — if Supabase returns no user but also no error (edge case)
  throw new Error("Login failed — no user returned. Check Supabase credentials.");
}

export function logout() {
  cachedUser = null;
  supabase.auth.signOut().catch(console.error);
  emit();
}

export function useSession(): ErpUser | null {
  return useSyncExternalStore(subscribe, getSession, () => null);
}
