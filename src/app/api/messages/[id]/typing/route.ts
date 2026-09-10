import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { conversationGet } from "@/lib/store";
import { noteTyping } from "@/lib/typing";

export const runtime = "nodejs";

// The current user pings this while typing; the other side sees "typing…".
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const conv = await conversationGet(id);
  if (!conv) return NextResponse.json({ ok: false }, { status: 404 });

  const me = user.email.toLowerCase();
  const allowed = isAdminUser(user) || conv.participants.includes(me);
  if (!allowed) return NextResponse.json({ ok: false }, { status: 403 });

  noteTyping(id, me);
  return NextResponse.json({ ok: true });
}
