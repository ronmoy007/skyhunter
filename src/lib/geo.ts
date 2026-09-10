/*
  IP geolocation + VPN/proxy + VPS(hosting) detection captured at signup.

  Uses ip-api.com, whose free JSON endpoint returns `proxy` (VPN / proxy / Tor
  exit) and `hosting` (data-centre / colo / VPS) flags in addition to geo. The
  base URL is overridable via IP_LOOKUP_BASE so a commercial/keyed provider can
  be swapped in (ip-api's free tier is non-commercial + HTTP-only; for a real
  product set IP_LOOKUP_BASE to your paid endpoint).

  Everything degrades gracefully: on a private/local IP or any network failure
  we still store the IP + timestamp and simply leave the flags unknown.
*/

export type SignupMeta = {
  ip: string;
  at: string; // ISO capture time
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  org?: string;
  vpn: boolean; // proxy / VPN / Tor exit node
  vps: boolean; // hosting / data centre / colocation
  checked: boolean; // did the intel lookup actually complete?
};

const BASE = process.env.IP_LOOKUP_BASE || "http://ip-api.com";

// Best-effort client IP from the usual proxy/CDN headers.
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-vercel-forwarded-for") ||
    ""
  ).trim();
}

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const v = ip.toLowerCase();
  if (v === "::1" || v === "localhost" || v.startsWith("127.")) return true;
  if (
    v.startsWith("10.") ||
    v.startsWith("192.168.") ||
    v.startsWith("169.254.")
  )
    return true;
  const m = v.match(/^172\.(\d+)\./);
  if (m) {
    const o = Number(m[1]);
    if (o >= 16 && o <= 31) return true;
  }
  // IPv6 unique-local / link-local
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
  return false;
}

// Look up an explicit IP (exposed so admins/tests can re-check a stored IP).
export async function lookupIp(ip: string): Promise<Partial<SignupMeta>> {
  if (isPrivateIp(ip)) return {};
  try {
    const fields = "status,country,regionName,city,isp,org,proxy,hosting";
    const res = await fetch(
      `${BASE}/json/${encodeURIComponent(ip)}?fields=${fields}`,
      { signal: AbortSignal.timeout(4000), cache: "no-store" },
    );
    const j = await res.json();
    if (j && j.status === "success") {
      return {
        country: j.country || undefined,
        region: j.regionName || undefined,
        city: j.city || undefined,
        isp: j.isp || undefined,
        org: j.org || undefined,
        vpn: !!j.proxy,
        vps: !!j.hosting,
        checked: true,
      };
    }
  } catch {
    // network / timeout / rate-limit — leave unknown
  }
  return {};
}

// Capture geo + VPN/VPS for the current request (used at signup).
export async function lookupSignupMeta(headers: Headers): Promise<SignupMeta> {
  const ip = clientIp(headers);
  const meta: SignupMeta = {
    ip,
    at: new Date().toISOString(),
    vpn: false,
    vps: false,
    checked: false,
  };

  // Local dev / private network — no public IP to look up. Fall back to any
  // CDN-provided geo headers (e.g. Vercel) if present.
  if (isPrivateIp(ip)) {
    meta.country = headers.get("x-vercel-ip-country") || undefined;
    meta.region = headers.get("x-vercel-ip-country-region") || undefined;
    const city = headers.get("x-vercel-ip-city");
    meta.city = city ? decodeURIComponent(city) : undefined;
    return meta;
  }

  Object.assign(meta, await lookupIp(ip));
  return meta;
}

// One-line human label, e.g. "San Jose, California, United States".
export function signupLocationLabel(m?: SignupMeta): string {
  if (!m) return "";
  return [m.city, m.region, m.country].filter(Boolean).join(", ");
}
