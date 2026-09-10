import { NextResponse } from "next/server";
import { introAdd } from "@/lib/store";
import { notifyAdmins } from "@/lib/notify";
import { rateLimit, clientIp, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

// Public lead intake for the studio marketing site. Two kinds:
//   "project" — a "Start a project" brief (industry, service, budget, timeline).
//   "call"    — a "Book a call" request (preferred date/time).
// Both are stored in intro_requests (so they show in Admin → Leads) and fan a
// notification out to every admin. No account required.
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`lead:${ip}`, 5, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const body = await req.json().catch(() => null);

  // Honeypot: a real person never fills this hidden field.
  if (clip(body?.hp_check, 100)) {
    return NextResponse.json({ ok: true }); // silently accept + drop
  }

  const kind = body?.kind === "call" ? "call" : "project";
  const name = clip(body?.name, 120);
  const email = clip(body?.email, 200);
  const phone = clip(body?.phone, 40);
  const company = clip(body?.company, 160);
  const industry = clip(body?.industry, 80);
  const projectType = clip(body?.projectType, 120);
  const budget = clip(body?.budget, 60);
  const timeline = clip(body?.timeline, 60);
  const details = clip(body?.message, 4000);
  const preferredDate = clip(body?.preferredDate, 40);
  const timeSlot = clip(body?.timeSlot, 40);
  const timezone = clip(body?.timezone, 60);

  if (!name) {
    return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  if (!details) {
    return NextResponse.json(
      { ok: false, error: "Please tell us a little about what you need." },
      { status: 400 },
    );
  }

  let partner: string;
  let role: string;
  let message: string;

  if (kind === "call") {
    partner = "Consultation call";
    role = [industry, projectType].filter(Boolean).join(" · ");
    const when = preferredDate
      ? `Preferred: ${preferredDate}${timeSlot ? ` · ${timeSlot}` : ""}${timezone ? ` (${timezone})` : ""}. `
      : "";
    message = `[Call] ${company ? `${company}. ` : ""}${when}${details}`;
  } else {
    partner = "New project lead";
    role = [industry, projectType].filter(Boolean).join(" · ") || "General";
    const meta = [
      company && `Company: ${company}`,
      budget && `Budget: ${budget}`,
      timeline && `Timeline: ${timeline}`,
    ]
      .filter(Boolean)
      .join(" · ");
    message = `[Project] ${meta ? `${meta}. ` : ""}${details}`;
  }

  await introAdd(email, name, partner, role, {
    contactEmail: email,
    phone,
    message,
  });

  await notifyAdmins({
    type: kind === "call" ? "call-request" : "project-lead",
    title: kind === "call" ? "New consultation call request" : "New project lead",
    body: `${name}${company ? ` (${company})` : ""}${role ? ` — ${role}` : ""}. ${details.slice(0, 160)}`,
  });

  return NextResponse.json({ ok: true });
}
