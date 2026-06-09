import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const missingConfigMessage =
  "Supabase is not configured. Please set VITE_SUPABASE_URL to a valid https:// URL and VITE_SUPABASE_ANON_KEY in your hosting environment.";

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

if (!isSupabaseConfigured) {
  console.warn(missingConfigMessage);
}

function createUnavailableClient(): SupabaseClient {
  const reject = () => Promise.reject(new Error(missingConfigMessage));

  return {
    auth: {
      getSession: reject,
      signInWithPassword: reject,
      signOut: reject,
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }),
    },
    from: () => {
      throw new Error(missingConfigMessage);
    },
  } as unknown as SupabaseClient;
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createUnavailableClient();
