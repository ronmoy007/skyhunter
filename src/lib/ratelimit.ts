/*
  Best-effort in-memory rate limiter (fixed window).

  On a multi-instance serverless deployment this is PER-INSTANCE, so it's a
  speed bump rather than a hard guarantee — a determined attacker spread across
  instances gets `limit * instanceCount`. It still meaningfully raises the cost
  of single-client brute-force / spam and is zero-dependency. For strong
  guarantees, front it with a provider-level limiter (e.g. Upstash/Redis) later.
*/

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastPurge = 0;

function purge(now: number): void {
  // Amortized cleanup so the map can't grow unbounded.
  if (now - lastPurge < 60_000) return;
  lastPurge = now;
  for (const [key, b] of buckets) if (now >= b.resetAt) buckets.delete(key);
}

export type RateResult = { ok: boolean; retryAfter: number };

// Returns ok=false once `limit` hits occur within `windowMs` for a given key.
// retryAfter is seconds until the window resets (for a Retry-After header).
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateResult {
  const now = Date.now();
  purge(now);
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  }
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}

// Best-effort client IP from proxy headers (Vercel sets x-forwarded-for).
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

// Standard 429 response body for rate-limited routes.
export function tooMany(retryAfter: number): Response {
  return new Response(
    JSON.stringify({ ok: false, error: "Too many requests. Please slow down." }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(retryAfter),
      },
    },
  );
}
