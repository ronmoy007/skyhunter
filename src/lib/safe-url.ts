/*
  Normalize a user-supplied external URL to a safe http(s) link, or "" if it
  isn't one. Blocks javascript:, data:, vbscript:, mailto:, file:, etc. — which
  would otherwise execute or mislead when rendered into an <a href>. Client-side
  `type="url"` inputs don't protect the API, so this runs server-side on store.
*/
export function safeExternalUrl(raw: string): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  // Allow scheme-less input like "example.com/me" by assuming https.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return u.toString();
  } catch {
    return "";
  }
}
