import { NextResponse } from "next/server";
import {
  findUser,
  setSession,
  verifyPassword,
  isSuspended,
  hashPassword,
} from "@/lib/auth";
import { notifyUser } from "@/lib/notify";
import { recordEvent } from "@/lib/store";
import { rateLimit, clientIp, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";

// A valid hash to verify against when the account doesn't exist, so the
// response takes the same scrypt time as a real wrong-password check — no
// user enumeration via timing.
const DUMMY_HASH = hashPassword("timing-equalizer-not-a-real-password");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot bot check.
  if (String(body.hp_check ?? "").trim()) {
    return NextResponse.json({ ok: false, error: "Bot detected." }, { status: 400 });
  }

  // Throttle credential-stuffing / brute force, per IP and per target account.
  const ip = clientIp(req);
  const ipLimit = rateLimit(`signin:ip:${ip}`, 10, 60_000);
  if (!ipLimit.ok) return tooMany(ipLimit.retryAfter);

  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  const emailLimit = rateLimit(`signin:email:${email.toLowerCase()}`, 5, 60_000);
  if (!emailLimit.ok) return tooMany(emailLimit.retryAfter);

  const user = await findUser(email);
  // Same message whether the email or password is wrong — don't leak which.
  // Accounts created via Google/LinkedIn have no password to check. Run a dummy
  // verify on the miss path so timing doesn't reveal whether the email exists.
  if (!user || !user.passwordHash) {
    verifyPassword(password, DUMMY_HASH);
    return NextResponse.json(
      { ok: false, error: "Email or password is incorrect." },
      { status: 401 },
    );
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { ok: false, error: "Email or password is incorrect." },
      { status: 401 },
    );
  }

  // Suspended accounts are disabled.
  if (isSuspended(user)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "This account has been suspended. If you think this is a mistake, contact support.",
      },
      { status: 403 },
    );
  }

  const remember = body.remember !== false; // default to remembering
  await setSession({ email: user.email, name: user.name }, remember);
  await recordEvent("login", user.email).catch(() => {});
  await notifyUser(user.email, {
    type: "signin",
    title: "New sign-in",
    body: "You just signed in to your SkyHunter account.",
  });
  return NextResponse.json({ ok: true, user: { name: user.name, email: user.email } });
}
