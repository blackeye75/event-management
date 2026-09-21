import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Request-scoped Supabase client. Returns `null` when the project is not
 * configured yet so callers can fall back to the demo catalogue instead of
 * throwing during a build.
 */
export async function createClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — the middleware refreshes the
          // session cookie instead, so this is safe to ignore.
        }
      },
    },
  });
}
