import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
  Server-side Supabase client using the SERVICE ROLE key (bypasses RLS).
  ONLY import this from server code — never ship the service role key to the
  browser.

  Resilience:
  - fetch has a 7s timeout so a dead/unreachable host fails fast (not ~18s).
  - a circuit breaker (noteSupabaseDown) makes getSupabase() return null for a
    short window after a failure, so the app falls back to the local file store
    (see store.ts) instead of hammering an unreachable host.

  If the env vars aren't set, getSupabase() returns null and the app uses the
  local file store.
*/

let cached: SupabaseClient | null = null;
let downUntil = 0;

// Called by the store when a Supabase request fails with a network error.
export function noteSupabaseDown(ms = 30_000): void {
  downUntil = Date.now() + ms;
}

// fetch with a hard timeout so an unresolvable host doesn't hang for ~18s.
const fetchWithTimeout: typeof fetch = (input, init) => {
  const timeout = AbortSignal.timeout(5000);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeout])
    : timeout;
  return fetch(input, { ...init, signal });
};

function normalizeUrl(raw: string): string {
  const url = raw.trim().replace(/\/+$/, "");
  const dash = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dash) {
    console.warn(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL was a dashboard URL — using " +
        `https://${dash[1]}.supabase.co instead. Update .env to the API URL ` +
        "(Settings → API → Project URL).",
    );
    return `https://${dash[1]}.supabase.co`;
  }
  return url;
}

export function getSupabase(): SupabaseClient | null {
  if (Date.now() < downUntil) return null; // circuit open — use local fallback
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) return null;
  if (!cached) {
    cached = createClient(normalizeUrl(rawUrl), key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: fetchWithTimeout },
    });
  }
  return cached;
}

export function usingSupabase(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
