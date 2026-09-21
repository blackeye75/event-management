import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Service-role client — bypasses RLS. Only ever import this from route
 * handlers or server actions that have already checked who is calling.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;

  return createSupabaseClient<Database>(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
