import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/store";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Public visit beacon. The client throttles to ~once/30s; we also cap per IP so
// it can't be used to inflate the numbers too aggressively. Analytics is
// best-effort — never surface an error to the caller.
export async function POST(req: Request) {
  const { ok } = rateLimit(`visit:${clientIp(req)}`, 40, 300_000);
  if (ok) await recordEvent("visit").catch(() => {});
  return NextResponse.json({ ok: true });
}
