import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser, findUser } from "@/lib/auth";
import { conversationsForUser } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A member's connections are the other members they've been matched with in a
// contract — the people they're actively working/talking with on SkyHunter.
async function partnerEmailsOf(email: string): Promise<string[]> {
  const me = email.toLowerCase();
  const convs = await conversationsForUser(email);
  const set = new Set<string>();
  for (const c of convs) {
    if (c.kind !== "contract") continue;
    for (const p of c.participants) {
      if (p.toLowerCase() !== me) set.add(p.toLowerCase());
    }
  }
  return [...set];
}

// Public-facing member profile + their connections. Visible to admins, to the
// member themselves, and to anyone they share a contract with — so a member can
// look up whoever they're matched with, but the profiles aren't wide open.
export async function GET(req: Request) {
  const viewer = await getCurrentUser();
  if (!viewer) return NextResponse.json({ ok: false }, { status: 401 });

  const email = new URL(req.url).searchParams.get("email")?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ ok: false, error: "Missing email." }, { status: 400 });
  }

  const target = await findUser(email);
  if (!target) return NextResponse.json({ ok: false }, { status: 404 });

  const partners = await partnerEmailsOf(target.email);
  const viewerEmail = viewer.email.toLowerCase();
  const allowed =
    isAdminUser(viewer) ||
    viewerEmail === email ||
    partners.includes(viewerEmail);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "No access." }, { status: 403 });
  }

  const p = target.profile;
  const connections = (
    await Promise.all(
      partners.map(async (e) => {
        const u = await findUser(e);
        if (!u) return null;
        return {
          name: u.name,
          headline: u.profile.headline ?? "",
          avatarUrl: u.profile.avatarUrl ?? "",
        };
      }),
    )
  ).filter(Boolean);

  return NextResponse.json({
    ok: true,
    member: {
      name: target.name,
      avatarUrl: p.avatarUrl ?? "",
      headline: p.headline ?? "",
      summary: p.summary ?? "",
      skills: p.skills ?? [],
      previousRole: p.previousRole ?? "",
      desiredRole: p.desiredRole ?? "",
      industry: p.industry ?? "",
      experienceYears: p.experienceYears ?? "",
      availability: p.availability ?? "",
      workPreference: p.workPreference ?? "",
      location: p.location ?? "",
      website: p.website ?? "",
      linkedinUrl: p.linkedinUrl ?? "",
      githubUrl: p.githubUrl ?? "",
      memberSince: new Date(target.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    },
    connections,
  });
}
