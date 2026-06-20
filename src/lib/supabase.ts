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

/**
 * Automatically retries an asynchronous function with exponential backoff.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoff = 2
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > retries) {
        throw error;
      }
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      console.warn(`[Supabase Retry] Attempt ${attempt} failed. Retrying in ${waitTime}ms. Error:`, error);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}



