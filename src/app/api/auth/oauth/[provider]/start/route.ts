import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getProvider, providerConfigured, buildAuthUrl } from "@/lib/oauth";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const cfg = getProvider(provider);

  // "connect" links a provider to the signed-in account (from /profile);
  // otherwise this is a normal sign-in from /signin or /signup.
  const mode = req.nextUrl.searchParams.get("mode") === "connect" ? "connect" : "";
  const returnPath = mode === "connect" ? "/profile" : "/signin";

  if (!cfg) {
    return NextResponse.redirect(
      new URL(`${returnPath}?error=Unknown+provider.`, req.url),
    );
  }
  if (!providerConfigured(provider)) {
    return NextResponse.redirect(
      new URL(
        `${returnPath}?error=${encodeURIComponent(`${cfg.label} isn't configured yet.`)}`,
        req.url,
      ),
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${req.nextUrl.origin}/api/auth/oauth/${provider}/callback`;

  const res = NextResponse.redirect(buildAuthUrl(provider, redirectUri, state));
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  };
  res.cookies.set(`oauth_state_${provider}`, state, opts);
  res.cookies.set(`oauth_mode_${provider}`, mode, opts);
  return res;
}
