import { NextResponse } from "next/server";
import { createUser, findUser, hashPassword, setSession } from "@/lib/auth";
import { upsertPending, generateCode, CODE_TTL_MS } from "@/lib/pending";
import { sendVerificationEmail } from "@/lib/email";
import { recordSignup } from "@/lib/sheet";
import { notifyUser, notifyAdmins } from "@/lib/notify";
import { passwordError } from "@/lib/password";
import { lookupSignupMeta } from "@/lib/geo";
import { IS_DEV } from "@/lib/flags";
import { rateLimit, clientIp, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // --- Bot check ---------------------------------------------------------
  // Honeypot: a real person never fills this hidden field.
  if (String(body.hp_check ?? "").trim()) {
    return NextResponse.json({ ok: false, error: "Bot detected." }, { status: 400 });
  }
  // Discord-style human check: the box must be verified, and it can't have been
  // ticked implausibly fast (bots auto-submit).
  const dwell = Number(body.hcDwellMs);
  if (body.human !== "verified" || !Number.isFinite(dwell) || dwell < 700) {
    return NextResponse.json(
      { ok: false, error: "Human verification failed. Please try again." },
      { status: 400 },
    );
  }

  // Throttle account creation + verification-email sends (email bombing / mass
  // signups), per IP and per target email address.
  const ip = clientIp(req);
  const ipLimit = rateLimit(`signup:ip:${ip}`, 8, 600_000);
  if (!ipLimit.ok) return tooMany(ipLimit.retryAfter);

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const password = String(body.password ?? "");
  const location = String(body.location ?? "").trim().slice(0, 160);

  if (!name) {
    return NextResponse.json({ ok: false, error: "Please tell us your name." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "That email doesn't look right." }, { status: 400 });
  }

  const emailLimit = rateLimit(`signup:email:${email.toLowerCase()}`, 3, 600_000);
  if (!emailLimit.ok) return tooMany(emailLimit.retryAfter);
  const pwErr = passwordError(password);
  if (pwErr) {
    return NextResponse.json({ ok: false, error: pwErr }, { status: 400 });
  }
  if (!location) {
    return NextResponse.json(
      { ok: false, error: "Please select your location." },
      { status: 400 },
    );
  }

  if (await findUser(email)) {
    return NextResponse.json(
      { ok: false, error: "An account with that email already exists. Try signing in." },
      { status: 409 },
    );
  }

  // Capture where the account is signing up from + whether they're behind a
  // VPN/proxy or a VPS/hosting IP. Stored on the profile (admin-only).
  const signup = await lookupSignupMeta(req.headers);

  const profile = {
    previousRole: String(body.previousRole ?? "").trim().slice(0, 120),
    industry: String(body.industry ?? "").trim().slice(0, 80),
    situation: String(body.situation ?? "").trim().slice(0, 120),
    location,
    signup,
  };

  // In local dev, skip email verification and create the account immediately.
  if (IS_DEV) {
    await createUser({
      email,
      name,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      profile,
    });
    await setSession({ email, name });
    await recordSignup({
      timestamp: new Date().toISOString(),
      name,
      email,
      ...profile,
    });
    await notifyUser(email, {
      type: "welcome",
      title: "Welcome to SkyHunter",
      body: "Your account is ready. Complete your profile to get matched to opportunities.",
    });
    await notifyAdmins({
      type: "new-member",
      title: "New member joined",
      body: `${name} (${email}) just signed up.`,
    });
    return NextResponse.json({ ok: true, verified: true, user: { name, email } });
  }

  // Otherwise, don't create the account yet — hold it until the emailed code
  // is verified.
  const code = generateCode();
  await upsertPending({
    email,
    name,
    passwordHash: hashPassword(password),
    profile,
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    attempts: 0,
  });

  const { sent, provider } = await sendVerificationEmail(email, name, code);
  if (!sent && provider !== "none") {
    return NextResponse.json(
      { ok: false, error: "We couldn't send the verification email. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    pending: true,
    email,
    // Dev convenience only: when no email provider is configured, return the
    // code so it can be tested locally. Never returned once a provider is set.
    ...(provider === "none" ? { devCode: code } : {}),
  });
}
