import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser, findUser } from "@/lib/auth";
import {
  conversationGet,
  messagesList,
  messageAdd,
  messageEdit,
  messageDelete,
  markConversationRead,
  peerLastReadAt,
  type Conversation,
} from "@/lib/store";
import { typingIn, clearTyping } from "@/lib/typing";
import { rateLimit, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";

function canAccess(conv: Conversation, email: string, admin: boolean): boolean {
  return admin || conv.participants.includes(email.toLowerCase());
}

// What the current viewer sees this conversation titled as, plus the other
// party's avatar photo (empty when there's no member peer, e.g. support).
async function headerFor(
  conv: Conversation,
  me: string,
  admin: boolean,
): Promise<{ display: string; avatarUrl: string }> {
  if (conv.kind === "support") {
    if (admin) {
      const m = await findUser(conv.participants[0] ?? "");
      return {
        display: m ? `${m.name} · Support chat` : "Support chat",
        avatarUrl: m?.profile.avatarUrl ?? "",
      };
    }
    return { display: "SkyHunter Support", avatarUrl: "" };
  }
  const other = conv.participants.find((p) => p !== me);
  const m = other ? await findUser(other) : null;
  return {
    display: m ? m.name : (other ?? "Member"),
    avatarUrl: m?.profile.avatarUrl ?? "",
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const conv = await conversationGet(id);
  if (!conv) return NextResponse.json({ ok: false }, { status: 404 });

  const admin = isAdminUser(user);
  const me = user.email.toLowerCase();
  if (!canAccess(conv, me, admin)) {
    return NextResponse.json({ ok: false, error: "No access." }, { status: 403 });
  }

  const messages = await messagesList(id);

  // Viewing the thread counts as reading it — clears the unread badge.
  await markConversationRead(id, me);

  // The latest time the other party read this thread — drives read receipts on
  // the viewer's own messages.
  const peerReadAt = await peerLastReadAt(id, me);

  // Who (other than me) is typing right now?
  let typing: string | null = null;
  const typers = typingIn(id, me);
  if (typers.length) {
    const u = await findUser(typers[0]);
    typing =
      conv.kind === "support" && u && isAdminUser(u)
        ? "SkyHunter Support"
        : (u?.name ?? "Someone");
  }

  // For a member↔member contract, the peer's email lets the UI open their
  // profile from the chat header. Support chats have no member peer.
  const peerEmail =
    conv.kind === "contract"
      ? (conv.participants.find((p) => p !== me) ?? null)
      : null;

  const header = await headerFor(conv, me, admin);

  return NextResponse.json({
    ok: true,
    me,
    conversation: {
      id: conv.id,
      kind: conv.kind,
      display: header.display,
      avatarUrl: header.avatarUrl,
      peerEmail,
    },
    messages,
    typing,
    peerReadAt,
    isAdmin: admin,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const conv = await conversationGet(id);
  if (!conv) return NextResponse.json({ ok: false }, { status: 404 });

  const admin = isAdminUser(user);
  const me = user.email.toLowerCase();
  if (!canAccess(conv, me, admin)) {
    return NextResponse.json({ ok: false, error: "No access." }, { status: 403 });
  }

  // Curb message flooding — generous for humans, throttles scripted spam.
  const limit = rateLimit(`msg:${me}:${conv.id}`, 20, 10_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const body = await req.json().catch(() => null);
  const text = String(body?.body ?? "").trim().slice(0, 4000);
  if (!text) {
    return NextResponse.json({ ok: false, error: "Empty message." }, { status: 400 });
  }
  const replyToId = body?.replyToId ? String(body.replyToId).slice(0, 64) : null;

  // Admins speak for the support team in support chats.
  const senderName =
    admin && conv.kind === "support" ? "SkyHunter Support" : user.name;
  const message = await messageAdd(conv.id, me, senderName, text, replyToId);

  // Sending a message means we've stopped typing — clear it now so the other
  // side's "typing…" disappears the instant the message arrives (header + list
  // stay in sync) rather than lingering for the typing TTL.
  clearTyping(conv.id, me);

  // No bell notification for chat messages — unread counts surface on the
  // conversation list instead (see /api/messages/conversations). The sender has
  // implicitly read their own message.
  await markConversationRead(conv.id, me);

  return NextResponse.json({ ok: true, message });
}

// Edit a message (sender only).
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const conv = await conversationGet(id);
  if (!conv) return NextResponse.json({ ok: false }, { status: 404 });

  const admin = isAdminUser(user);
  const me = user.email.toLowerCase();
  if (!canAccess(conv, me, admin)) {
    return NextResponse.json({ ok: false, error: "No access." }, { status: 403 });
  }

  const limit = rateLimit(`msg:${me}:${conv.id}`, 20, 10_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const body = await req.json().catch(() => null);
  const messageId = String(body?.messageId ?? "");
  const text = String(body?.body ?? "").trim().slice(0, 4000);
  if (!messageId || !text) {
    return NextResponse.json({ ok: false, error: "Nothing to save." }, { status: 400 });
  }

  const message = await messageEdit(conv.id, messageId, me, text);
  if (!message) {
    return NextResponse.json(
      { ok: false, error: "You can only edit your own message." },
      { status: 403 },
    );
  }
  return NextResponse.json({ ok: true, message });
}

// Delete a message (sender, or an admin moderating).
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const conv = await conversationGet(id);
  if (!conv) return NextResponse.json({ ok: false }, { status: 404 });

  const admin = isAdminUser(user);
  const me = user.email.toLowerCase();
  if (!canAccess(conv, me, admin)) {
    return NextResponse.json({ ok: false, error: "No access." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const messageId = String(body?.messageId ?? "");
  if (!messageId) {
    return NextResponse.json({ ok: false, error: "No message." }, { status: 400 });
  }

  // Everyone — admins included — can delete only their own messages.
  const ok = await messageDelete(conv.id, messageId, me, false);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "You can only delete your own message." },
      { status: 403 },
    );
  }
  return NextResponse.json({ ok: true });
}
