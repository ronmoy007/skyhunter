import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import {
  conversationsForUser,
  conversationsAll,
  conversationReads,
  unreadCount,
} from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Total unread chat messages for the current user — powers the badge on the
// "Chat" menu item. Admins are support, so they count across every conversation.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, total: 0 });

  const me = user.email.toLowerCase();
  // Admins are support, so they count every SUPPORT chat — but member↔member
  // CONTRACT chats they aren't part of must NOT feed the badge (they can't open
  // those from their sidebar, so the count could never be cleared). Mirror the
  // conversations route: support chats plus contracts the admin participates in.
  const convs = isAdminUser(user)
    ? (await conversationsAll()).filter(
        (c) => c.kind === "support" || c.participants.includes(me),
      )
    : await conversationsForUser(user.email);
  const reads = await conversationReads(me);

  let total = 0;
  for (const c of convs) total += await unreadCount(c.id, me, reads[c.id]);

  return NextResponse.json({ ok: true, total });
}
