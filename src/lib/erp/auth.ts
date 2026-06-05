import { useSyncExternalStore } from "react";
import { supabase } from "../supabase";

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
  name: string;
  email: string;
  role: RoleId;
  loginAt: number;
}

const listeners = new Set<() => void>();
let cachedUser: ErpUser | null = null;
let initialized = false;

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Fetch user profile from public.user_profiles
async function fetchUserProfile(userId: string, email: string): Promise<ErpUser> {
  console.log("fetchUserProfile: starting query for userId", userId);
  try {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("name, role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("fetchUserProfile: query error:", error);
    } else {
      console.log("fetchUserProfile: query success, profile:", profile);
    }

    return {
      name: profile?.name || "ERP User",
      email: email,
      role: (profile?.role || "warehouse") as RoleId,
      loginAt: Date.now(),
    };
  } catch (err) {
    console.error("fetchUserProfile: exception:", err);
    return {
      name: "ERP User",
      email: email,
      role: "warehouse" as RoleId,
      loginAt: Date.now(),
    };
  }
}

// Defer profile fetch to prevent deadlocks in Supabase client request queue
const fetchUserProfileDeferred = (userId: string, email: string) => {
  setTimeout(async () => {
    cachedUser = await fetchUserProfile(userId, email);
    emit();
  }, 10);
};

// Initialize session listener
if (typeof window !== "undefined" && !initialized) {
  initialized = true;
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("onAuthStateChange event:", event, "session user:", session?.user?.id);
    if (session?.user) {
      fetchUserProfileDeferred(session.user.id, session.user.email || "");
    } else {
      cachedUser = null;
      emit();
    }
  });

  // Get initial session
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    console.log("getInitialSession user:", session?.user?.id);
    if (session?.user) {
      fetchUserProfileDeferred(session.user.id, session.user.email || "");
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
  console.log("=== ERP LOGIN DIAGNOSTICS ===");
  console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("Supabase Anon Key:", import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 15) + "...");
  console.log("Submitting Email:", email);
  console.log("Submitting Password:", password);

  console.log("login: calling signInWithPassword...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password || "demo-password-123", // default fallback for demo mode
  });

  if (error) {
    console.error("login: signInWithPassword error:", error);
    throw error;
  }

  console.log("login: signInWithPassword success, user:", data.user?.id);
  if (data.user) {
    console.log("login: waiting for auth session to settle...");
    await new Promise((resolve) => setTimeout(resolve, 20));
    console.log("login: fetching user profile...");
    cachedUser = await fetchUserProfile(data.user.id, data.user.email || email);
    console.log("login: fetchUserProfile finished, cachedUser:", cachedUser);
    emit();
    return cachedUser;
  }
}

export function logout() {
  cachedUser = null;
  supabase.auth.signOut().catch(console.error);
  emit();
}

export function useSession(): ErpUser | null {
  return useSyncExternalStore(subscribe, getSession, () => null);
}
