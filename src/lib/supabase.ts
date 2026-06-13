import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl = rawUrl.replace(/['"]/g, "").trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  /^(https?:\/\/)/.test(supabaseUrl)
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Synchronize Supabase auth session with a cookie for middleware / server-side protection
if (typeof window !== "undefined" && supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      // Store full session JSON containing access_token
      document.cookie = `sb-session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=604800; SameSite=Lax; Secure`;
    } else {
      // Delete cookie
      document.cookie = "sb-session=; path=/; max-age=0; SameSite=Lax; Secure";
    }
  });
}


