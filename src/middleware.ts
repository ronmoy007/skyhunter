import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SEEN = "sky_seen"; // marks a visitor who has met the front door once
const THIRTY_DAYS = 60 * 60 * 24 * 30;

// Search-engine + social crawlers never persist cookies, so the "first visit"
// nudge would redirect them to /signup on EVERY crawl — leaving the real home
// page unindexed. Exempt bots so they always see the actual home page.
const BOT_RE =
  /bot|crawl|spider|slurp|mediapartners|adsbot|inspectiontool|facebookexternalhit|embedly|quora|whatsapp|telegram|discord|linkedin|twitter|applebot|pinterest|redditbot|bingpreview/i;

// Pre-launch front door: a brand-new, signed-out visitor landing on the root is
// sent to /signup ONCE. After that (cookie set) the home page is freely
// reachable — e.g. via the "Home" link in the navbar — and signed-in members
// always land on it. We only check cookie presence; real auth is still enforced
// per route/page.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const signedIn = req.cookies.has("sky_session");
  const seen = req.cookies.has(SEEN);
  const isBot = BOT_RE.test(req.headers.get("user-agent") || "");

  if (pathname === "/" && !signedIn && !seen && !isBot) {
    const url = req.nextUrl.clone();
    url.pathname = "/signup";
    const res = NextResponse.redirect(url);
    res.cookies.set(SEEN, "1", { path: "/", maxAge: THIRTY_DAYS });
    return res;
  }

  // Reaching signup any other way also counts as "seen", so Home works after.
  if (pathname === "/signup" && !seen) {
    const res = NextResponse.next();
    res.cookies.set(SEEN, "1", { path: "/", maxAge: THIRTY_DAYS });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signup"],
};
