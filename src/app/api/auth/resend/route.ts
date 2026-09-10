import { NextResponse } from "next/server";
import {
  getPending,
  upsertPending,
  generateCode,
  CODE_TTL_MS,
} from "@/lib/pending";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, clientIp, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Throttle resend so it can't be used to email-bomb an address.
  const ip = clientIp(req);
  const ipLimit = rateLimit(`resend:ip:${ip}`, 6, 600_000);
  if (!ipLimit.ok) return tooMany(ipLimit.retryAfter);

  const email = String(body.email ?? "").trim().slice(0, 200);
  const emailLimit = rateLimit(`resend:email:${email.toLowerCase()}`, 3, 600_000);
  if (!emailLimit.ok) return tooMany(emailLimit.retryAfter);

  const pending = await getPending(email);
  if (!pending) {
    return NextResponse.json(
      { ok: false, error: "Nothing to resend. Please sign up again." },
      { status: 400 },
    );
  }

  const code = generateCode();
  await upsertPending({
    ...pending,
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    attempts: 0,
  });

  const { sent, provider } = await sendVerificationEmail(email, pending.name, code);
  if (!sent && provider !== "none") {
    return NextResponse.json(
      { ok: false, error: "We couldn't resend the email. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    ...(provider === "none" ? { devCode: code } : {}),
  });
}
