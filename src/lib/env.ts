/**
 * The site is deliberately runnable before Supabase is wired up: the public
 * pages fall back to the demo catalogue in `src/lib/demo-data.ts` so a fresh
 * clone still looks like the real thing. Anything that writes (auth, bookings,
 * payments) requires a real project and says so in the UI.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;
