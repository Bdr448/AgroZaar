import { createClient } from "@supabase/supabase-js";
import { log } from "./logger";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

log.network("SUPABASE", `URL = ${supabaseUrl || "(empty — NOT SET)"}`);
log.network("SUPABASE", `Anon key present = ${Boolean(supabaseAnonKey)}`);

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && isValidHttpUrl(supabaseUrl),
);

log.network("SUPABASE", `isSupabaseConfigured = ${isSupabaseConfigured}`);

// Intercept fetch to log every Supabase HTTP call
const _fetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : (input as Request).url;
  if (supabaseUrl && url.includes(supabaseUrl)) {
    const method = init?.method || "GET";
    const short = url.replace(supabaseUrl, "[supabase]");
    log.network("FETCH→", `${method} ${short}`);
    const end = log.time(`${method} ${short}`);
    try {
      const res = await _fetch(input, init);
      log.network("FETCH←", `${res.status} — ${short}`);
      end();
      return res;
    } catch (err) {
      log.error("FETCH", `FAILED — ${short}`, err);
      end();
      throw err;
    }
  }
  return _fetch(input, init);
};

// Simple in-memory fallback if localStorage is blocked
const inMemoryStorage = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  };
})()

function localStorageAvailable() {
  try {
    localStorage.setItem("__t__", "1");
    localStorage.removeItem("__t__");
    return true;
  } catch {
    return false;
  }
}

export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder", {
  auth: {
    storage: typeof window !== "undefined" && localStorageAvailable() ? localStorage : inMemoryStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
