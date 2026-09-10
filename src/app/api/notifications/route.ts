import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notifyList, notifyUnread, notifyMarkRead } from "@/lib/store";
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ notifications: [], unread: 0 });

  // Lightweight: the bell polls only the unread count until it's opened.
  if (new URL(req.url).searchParams.get("count")) {
    return NextResponse.json({ unread: await notifyUnread(session.email) });
  }

  // Derive the unread count from the same list we return, so the badge and the
  // panel can never disagree (a separate count query could land on a different
  // backend when the circuit breaker flips mid-request).
  const notifications = await notifyList(session.email);
  const unread = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unread });
}

// Mark notifications read: { id } for one, or {} for all.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  await notifyMarkRead(session.email, body?.id ? String(body.id) : undefined);
  return NextResponse.json({ ok: true });
}
