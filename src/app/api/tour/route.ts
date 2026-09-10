import { NextResponse } from "next/server";
import { getSession, updateUser } from "@/lib/auth";

export const runtime = "nodejs";

// Mark the signed-in user's dashboard tour as seen, so it doesn't auto-open
// again on their next sign-in (tracked on the account, not just this browser).
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await updateUser(session.email, { profile: { tourSeen: true } });
  return NextResponse.json({ ok: true });
}
