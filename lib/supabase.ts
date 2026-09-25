import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// A real-time index must never read Next.js's fetch Data Cache: identical
// PostgREST URLs would replay the first render's responses forever.
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

let client: SupabaseClient | null = null;

/**
 * Lazily constructs the public Supabase client. Failing env vars throw at
 * REQUEST time (rendered as the civic "service unavailable" panel), never at
 * import time — so `next build` succeeds even without credentials configured.
 */
export function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Configure .env.local — ARIA does not run against mock data."
    );
  }
  client = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  });
  return client;
}
