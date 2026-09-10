import { NextResponse } from "next/server";
import { getSession, updateUser, setSession } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";
import { safeExternalUrl } from "@/lib/safe-url";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Cap every stored string server-side so a crafted request can't bloat the
  // store / admin views with multi-MB fields (client controls don't protect us).
  const str = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

  const name = str(body.name, 120);
  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Your name can't be empty." },
      { status: 400 },
    );
  }

  // Skills arrive as a comma/newline-separated string; store as a clean array.
  const skills = String(body.skills ?? "")
    .split(/[,\n]/)
    .map((s) => s.trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 30);

  const profile = {
    previousRole: str(body.previousRole, 120),
    industry: str(body.industry, 80),
    situation: str(body.situation, 120),
    location: str(body.location, 160),
    headline: str(body.headline, 200),
    summary: str(body.summary, 4000),
    skills,
    experienceYears: str(body.experienceYears, 40),
    desiredRole: str(body.desiredRole, 120),
    workPreference: str(body.workPreference, 40),
    availability: str(body.availability, 60),
    desiredSalary: str(body.desiredSalary, 60),
    phone: str(body.phone, 40),
    // Only accept http(s) links — blocks javascript:/data: URLs that would run
    // when an admin or matched member clicks the link in the profile modal.
    website: safeExternalUrl(str(body.website, 300)),
    linkedinUrl: safeExternalUrl(str(body.linkedinUrl, 300)),
    githubUrl: safeExternalUrl(str(body.githubUrl, 300)),
  };

  const updated = await updateUser(session.email, { name, profile });
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }

  // Keep the session (and therefore the navbar) in sync if the name changed.
  if (name !== session.name) {
    await setSession({ email: updated.email, name: updated.name });
  }

  await notifyUser(updated.email, {
    type: "profile",
    title: "Profile updated",
    body: "Your profile details were saved.",
  });

  return NextResponse.json({
    ok: true,
    user: {
      name: updated.name,
      email: updated.email,
      profile: updated.profile,
    },
  });
}
