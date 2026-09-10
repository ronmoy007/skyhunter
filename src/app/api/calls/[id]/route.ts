import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { callGet, callAnswer, callSetStatus } from "@/lib/store";

export const runtime = "nodejs";

// Answer or hang up a call. Only the two parties may act on it.
//   { action: "answer", answer: <RTCSessionDescription> }  — callee accepts
//   { action: "hangup", reason?: "declined" }              — either party ends
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const me = user.email.toLowerCase();
  const { id } = await params;
  const call = await callGet(id);
  if (!call) return NextResponse.json({ ok: false }, { status: 404 });
  if (call.caller !== me && call.callee !== me) {
    return NextResponse.json({ ok: false, error: "Not your call." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const action = String(body?.action ?? "");

  if (action === "answer") {
    if (call.callee !== me) {
      return NextResponse.json(
        { ok: false, error: "Only the callee can answer." },
        { status: 403 },
      );
    }
    const answer = body?.answer ? JSON.stringify(body.answer) : "";
    if (!answer) {
      return NextResponse.json({ ok: false, error: "No answer." }, { status: 400 });
    }
    const updated = await callAnswer(id, me, answer);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Call is no longer ringing." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "hangup") {
    const status = body?.reason === "declined" ? "declined" : "ended";
    await callSetStatus(id, me, status);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
