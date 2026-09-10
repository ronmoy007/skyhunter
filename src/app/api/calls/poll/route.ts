import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { callForUser } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The one call relevant to me right now — an incoming ring, my own outgoing
// ring, or an in-progress call. The client polls this to drive ringing and to
// track when the other side answers or hangs up. Returns null when there's
// nothing going on.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, call: null }, { status: 401 });

  const me = user.email.toLowerCase();
  const call = await callForUser(me);

  // The caller needs the answer SDP; the callee needs the offer SDP. Send both
  // (they're only meaningful to the side that lacks its own copy) plus the
  // metadata the UI shows.
  return NextResponse.json({
    ok: true,
    me,
    call: call
      ? {
          id: call.id,
          conversationId: call.conversationId,
          caller: call.caller,
          callerName: call.callerName,
          callee: call.callee,
          calleeName: call.calleeName,
          status: call.status,
          offer: call.offer,
          answer: call.answer,
        }
      : null,
  });
}
