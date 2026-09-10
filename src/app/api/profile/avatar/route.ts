import { NextResponse } from "next/server";
import { getSession, updateUser } from "@/lib/auth";

export const runtime = "nodejs";

// Accepts a resized image data URL (or "" to remove) and stores it on the profile.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const avatarUrl = String(body?.avatarUrl ?? "");

  if (avatarUrl && !/^data:image\/(png|jpeg|webp);base64,/.test(avatarUrl)) {
    return NextResponse.json(
      { ok: false, error: "Unsupported image format." },
      { status: 400 },
    );
  }
  if (avatarUrl.length > 1_500_000) {
    return NextResponse.json(
      { ok: false, error: "Image is too large. Please choose a smaller one." },
      { status: 400 },
    );
  }

  const updated = await updateUser(session.email, { profile: { avatarUrl } });
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, avatarUrl });
}
