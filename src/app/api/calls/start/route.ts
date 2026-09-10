import { NextResponse } from "next/server";
import { getCurrentUser, findUser } from "@/lib/auth";
import { conversationGet, callStart } from "@/lib/store";
import { rateLimit, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Caller kicks off a voice call in a contract chat. The body carries the SDP
// offer (with ICE candidates already bundled in). We work out the callee from
// the conversation's participants and create a ringing call for them to pick up.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const me = user.email.toLowerCase();
  const limit = rateLimit(`call:${me}`, 8, 20_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const body = await req.json().catch(() => null);
  const conversationId = String(body?.conversationId ?? "");
  const offer = body?.offer ? JSON.stringify(body.offer) : "";
  if (!conversationId || !offer) {
    return NextResponse.json(
      { ok: false, error: "Missing call details." },
      { status: 400 },
    );
  }

  const conv = await conversationGet(conversationId);
  if (!conv) {
    return NextResponse.json({ ok: false, error: "No such chat." }, { status: 404 });
  }
  // Calls are member↔member only, and you must be in the chat.
  if (conv.kind !== "contract" || !conv.participants.includes(me)) {
    return NextResponse.json(
      { ok: false, error: "You can't call in this chat." },
      { status: 403 },
    );
  }
  const callee = conv.participants.find((p) => p !== me);
  if (!callee) {
    return NextResponse.json(
      { ok: false, error: "No one to call here." },
      { status: 400 },
    );
  }

  const other = await findUser(callee);
  const call = await callStart({
    conversationId,
    caller: me,
    callerName: user.name,
    callee,
    calleeName: other?.name ?? "Member",
    offer,
  });

  return NextResponse.json({
    ok: true,
    callId: call.id,
    calleeName: call.calleeName,
  });
}
