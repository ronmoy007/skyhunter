import { NextRequest, NextResponse } from "next/server";
import {
  getProvider,
  providerConfigured,
  exchangeCode,
  fetchProfile,
} from "@/lib/oauth";
import {
  findUser,
  createUser,
  updateUser,
  getSession,
  sessionCookie,
  authHintCookie,
  isSuspended,
} from "@/lib/auth";
import { lookupSignupMeta } from "@/lib/geo";
import { recordSignup } from "@/lib/sheet";
import { recordEvent } from "@/lib/store";
import { notifyUser, notifyAdmins } from "@/lib/notify";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const cfg = getProvider(provider);
  const url = req.nextUrl;

  const mode = req.cookies.get(`oauth_mode_${provider}`)?.value;
  const isConnect = mode === "connect";
  const returnPath = isConnect ? "/profile" : "/signin";

  const clearCookies = (res: NextResponse) => {
    res.cookies.set(`oauth_state_${provider}`, "", { path: "/", maxAge: 0 });
    res.cookies.set(`oauth_mode_${provider}`, "", { path: "/", maxAge: 0 });
    return res;
  };
  const fail = (msg: string) =>
    clearCookies(
      NextResponse.redirect(
        new URL(`${returnPath}?error=${encodeURIComponent(msg)}`, req.url),
      ),
    );

  if (!cfg || !providerConfigured(provider)) {
    return fail("This method isn't available right now.");
  }
  if (url.searchParams.get("error")) {
    return fail("Cancelled.");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get(`oauth_state_${provider}`)?.value;
  if (!code || !state || !cookieState || state !== cookieState) {
    return fail("Verification failed. Please try again.");
  }

  try {
    const redirectUri = `${url.origin}/api/auth/oauth/${provider}/callback`;
    const token = await exchangeCode(provider, code, redirectUri);
    const profile = await fetchProfile(provider, token);
    if (!profile.email) {
      return fail(`${cfg.label} didn't share an email address.`);
    }

    // --- Connect mode: link the provider to the signed-in account ---------
    if (isConnect) {
      const session = await getSession();
      if (!session) return fail("Please sign in first, then connect.");
      const current = await findUser(session.email);
      if (!current) return fail("Account not found.");
      const connections = new Set(current.profile.connections ?? []);
      connections.add(provider);
      await updateUser(session.email, {
        profile: { connections: [...connections] },
      });
      await notifyUser(session.email, {
        type: "connect",
        title: `${cfg.label} connected`,
        body: `You linked your ${cfg.label} account.`,
      });
      return clearCookies(
        NextResponse.redirect(new URL(`/profile?connected=${provider}`, req.url)),
      );
    }

    // --- Sign-in mode: link by email, sign in or create -------------------
    let user = await findUser(profile.email);
    const isNewSignup = !user; // brand-new account → fire the Ads conversion
    // Suspended accounts are disabled — don't let them sign in via OAuth.
    if (user && isSuspended(user)) {
      return fail("This account has been suspended. Contact support.");
    }
    if (!user) {
      user = {
        email: profile.email,
        name: profile.name || profile.email.split("@")[0],
        provider,
        createdAt: new Date().toISOString(),
        profile: {
          previousRole: "",
          industry: "",
          situation: "",
          location: "",
          connections: [provider],
          signup: await lookupSignupMeta(req.headers),
        },
      };
      await createUser(user);
      await recordSignup({
        timestamp: new Date().toISOString(),
        name: user.name,
        email: user.email,
        previousRole: "",
        industry: "",
        situation: `Signed up with ${cfg.label}`,
        location: "",
      });
      await notifyUser(user.email, {
        type: "welcome",
        title: "Welcome to SkyHunter",
        body: `You joined with ${cfg.label}. Complete your profile to get matched.`,
      });
      await notifyAdmins({
        type: "new-member",
        title: "New member joined",
        body: `${user.name} (${user.email}) signed up with ${cfg.label}.`,
      });
    } else {
      // Account linking: an account with this (verified) email already exists,
      // so record that they've now connected this OAuth provider. Only write
      // when it's actually new, to avoid a needless update on every sign-in.
      const conns = new Set(user.profile.connections ?? []);
      if (!conns.has(provider)) {
        conns.add(provider);
        const updated = await updateUser(user.email, {
          profile: { connections: [...conns] },
        });
        if (updated) user = updated;
      }
      await notifyUser(user.email, {
        type: "signin",
        title: "New sign-in",
        body: `You signed in with ${cfg.label}.`,
      });
    }

    await recordEvent("login", user.email).catch(() => {});

    const res = NextResponse.redirect(
      new URL(isNewSignup ? "/dashboard?signup=1" : "/dashboard", req.url),
    );
    const sc = sessionCookie({ email: user.email, name: user.name });
    res.cookies.set(sc.name, sc.value, sc.options);
    const hint = authHintCookie();
    res.cookies.set(hint.name, hint.value, hint.options);
    return clearCookies(res);
  } catch (err) {
    console.error("[oauth] callback failed:", err);
    return fail("Something went wrong. Please try again.");
  }
}
