import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { introAdd, introsByUser } from "@/lib/store";
import { notifyUser, notifyAdmins } from "@/lib/notify";

export const runtime = "nodejs";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// A member books an interview with the SkyHunter support team to move forward
// with a partner's contract. Stored alongside intros (intro_requests) with the
// schedule packed into the message, so the admin panel shows it in one place.
export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Please sign in to book an interview." },
      { status: 401 },
    );
  }
  if (isAdminUser(session)) {
    return NextResponse.json(
      { ok: false, error: "Admin accounts can't book interviews." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const partner = String(body?.partner ?? "").trim().slice(0, 120);
  const role = String(body?.role ?? "").trim().slice(0, 120);
  const email = String(body?.email ?? "").trim().slice(0, 200);
  const phone = String(body?.phone ?? "").trim().slice(0, 40);
  const preferredDate = String(body?.preferredDate ?? "").trim().slice(0, 40);
  const timeSlot = String(body?.timeSlot ?? "").trim().slice(0, 40);
  const timezone = String(body?.timezone ?? "").trim().slice(0, 60);
  const goals = String(body?.message ?? "").trim().slice(0, 2000);

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  if (!preferredDate) {
    return NextResponse.json({ ok: false, error: "Please choose a preferred date." }, { status: 400 });
  }
  if (!timeSlot) {
    return NextResponse.json({ ok: false, error: "Please choose a preferred time." }, { status: 400 });
  }
  if (!goals) {
    return NextResponse.json(
      { ok: false, error: "Please tell us a little about what you're looking for." },
      { status: 400 },
    );
  }

  // One interview request per partner: a member can't request the same support
  // team member / partner twice.
  if (partner) {
    const existing = await introsByUser(session.email);
    const dup = existing.find(
      (i) => i.partner.trim().toLowerCase() === partner.toLowerCase(),
    );
    if (dup) {
      return NextResponse.json(
        {
          ok: false,
          error: `You've already requested an interview with ${partner}. Check "Your requests" for its status.`,
        },
        { status: 409 },
      );
    }
  }

  const schedule = `Preferred: ${preferredDate} · ${timeSlot}${timezone ? ` (${timezone})` : ""}`;
  const context = partner ? `re: ${partner}${role ? ` – ${role}` : ""}` : "general";
  const message = `[Interview | ${context}] ${schedule}. Goals: ${goals}`;

  await introAdd(session.email, session.name, partner || "SkyHunter interview", role, {
    contactEmail: email,
    phone,
    message,
  });

  await notifyUser(session.email, {
    type: "interview",
    title: "Interview requested",
    body: `We'll confirm your interview with the SkyHunter team by email. ${schedule}.`,
  });
  await notifyAdmins({
    type: "interview-request",
    title: "New interview request",
    body: `${session.name} requested an interview${partner ? ` (${context})` : ""}. ${schedule}.`,
  });

  return NextResponse.json({ ok: true });
}
