import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser, findUser } from "@/lib/auth";
import {
  conversationsForUser,
  conversationsAll,
  conversationReads,
  unreadCount,
  chatPresenceFor,
} from "@/lib/store";
import { anyoneTyping } from "@/lib/typing";

// "Online" in the contact list means active in the chat area recently. The chat
// beacon ticks every 30s, so a 90s window tolerates a missed beat.
const ONLINE_WINDOW_MS = 90 * 1000;

export const runtime = "nodejs";

// List the current user's conversations (admins see all — they're support).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, conversations: [] }, { status: 401 });
  }
  const admin = isAdminUser(user);
  const me = user.email.toLowerCase();
  // Admins act as support, so they see every SUPPORT chat — but member↔member
  // CONTRACT chats they aren't part of must NOT leak into their personal
  // sidebar (those are managed on the admin Contracts page). Keep only support
  // chats plus contracts the admin actually participates in.
  const convs = admin
    ? (await conversationsAll()).filter(
        (c) => c.kind === "support" || c.participants.includes(me),
      )
    : await conversationsForUser(user.email);

  const reads = await conversationReads(me);

  // Whose online status to show on each row: the contract peer, or (for an
  // admin) the member in a support chat. Members viewing "SkyHunter Support"
  // have no single peer, so no status.
  const statusEmailFor = (c: (typeof convs)[number]): string | null => {
    if (c.kind === "contract") return c.participants.find((p) => p !== me) ?? null;
    return admin ? (c.participants[0] ?? null) : null;
  };
  const presence = await chatPresenceFor(
    convs.map(statusEmailFor).filter((e): e is string => !!e),
  ).catch(() => ({}) as Record<string, string>);
  const now = Date.now();

  const conversations = await Promise.all(
    convs.map(async (c) => {
      let display: string;
      let avatarUrl = ""; // the other party's photo, shown in the list/header
      if (c.kind === "support") {
        if (admin) {
          const m = await findUser(c.participants[0] ?? "");
          display = m ? `${m.name} · Support` : "Support chat";
          avatarUrl = m?.profile.avatarUrl ?? "";
        } else {
          display = "SkyHunter Support";
        }
      } else {
        const other = c.participants.find((p) => p !== me);
        const m = other ? await findUser(other) : null;
        display = m ? m.name : (other ?? "Member");
        avatarUrl = m?.profile.avatarUrl ?? "";
      }
      // Contract peer's email — lets the list avatar open their profile.
      const peerEmail =
        c.kind === "contract" ? (c.participants.find((p) => p !== me) ?? null) : null;
      const statusEmail = statusEmailFor(c);
      const lastSeenAt = statusEmail ? (presence[statusEmail] ?? null) : null;
      const online =
        !!lastSeenAt && now - new Date(lastSeenAt).getTime() < ONLINE_WINDOW_MS;
      return {
        id: c.id,
        kind: c.kind,
        display,
        avatarUrl,
        title: c.title,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        typing: anyoneTyping(c.id, me),
        peerEmail,
        unread: await unreadCount(c.id, me, reads[c.id]),
        online,
        lastSeenAt,
      };
    }),
  );

  return NextResponse.json({ ok: true, conversations, me, isAdmin: admin });
}
