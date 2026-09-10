import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { noteChatSeen } from "@/lib/store";

export const runtime = "nodejs";

// Heartbeat sent only while a member is in the Messages area — drives the
// online/last-seen status in the chat contact list. Best-effort.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await noteChatSeen(user.email).catch(() => {});
  return NextResponse.json({ ok: true });
}
