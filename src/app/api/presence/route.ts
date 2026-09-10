import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { heartbeat } from "@/lib/store";

export const runtime = "nodejs";

// Signed-in heartbeat — powers the "online now" list. Best-effort.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await heartbeat(user.email, user.name).catch(() => {});
  return NextResponse.json({ ok: true });
}
