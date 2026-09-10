import { NextResponse } from "next/server";
import { createUser, findUser, setSession } from "@/lib/auth";
import {
  getPending,
  deletePending,
  incrementAttempts,
  MAX_ATTEMPTS,
} from "@/lib/pending";
import { recordSignup } from "@/lib/sheet";
import { notifyUser, notifyAdmins } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const code = String(body.code ?? "").trim();

  const pending = await getPending(email);
  if (!pending) {
    return NextResponse.json(
      { ok: false, error: "Your code expired or wasn't found. Please sign up again." },
      { status: 400 },
    );
  }

  if (pending.attempts >= MAX_ATTEMPTS) {
    await deletePending(email);
    return NextResponse.json(
      { ok: false, error: "Too many incorrect attempts. Please sign up again." },
      { status: 429 },
    );
  }

  if (code !== pending.code) {
    const attempts = await incrementAttempts(email);
    const left = attempts === null ? 0 : MAX_ATTEMPTS - attempts;
    return NextResponse.json(
      {
        ok: false,
        error:
          left > 0
            ? `That code isn't right. ${left} attempt${left === 1 ? "" : "s"} left.`
            : "Too many incorrect attempts. Please sign up again.",
      },
      { status: 400 },
    );
  }

  // Correct code — create the account now.
  if (await findUser(email)) {
    await deletePending(email);
    return NextResponse.json(
      { ok: false, error: "That account already exists. Please sign in." },
      { status: 409 },
    );
  }

  await createUser({
    email: pending.email,
    name: pending.name,
    passwordHash: pending.passwordHash,
    createdAt: new Date().toISOString(),
    profile: pending.profile,
  });

  await deletePending(email);
  await setSession({ email: pending.email, name: pending.name });

  // Log the now-verified signup to the Google Sheet (no password fields).
  await recordSignup({
    timestamp: new Date().toISOString(),
    name: pending.name,
    email: pending.email,
    ...pending.profile,
  });
  await notifyUser(pending.email, {
    type: "welcome",
    title: "Welcome to SkyHunter",
    body: "Your email is verified and your account is ready.",
  });
  await notifyAdmins({
    type: "new-member",
    title: "New member joined",
    body: `${pending.name} (${pending.email}) just signed up.`,
  });

  return NextResponse.json({
    ok: true,
    user: { name: pending.name, email: pending.email },
  });
}
