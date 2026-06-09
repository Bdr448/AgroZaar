import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const missingConfigMessage =
  "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting environment.";

if (!supabaseUrl || !supabaseAnonKey) {
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

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createUnavailableClient();
