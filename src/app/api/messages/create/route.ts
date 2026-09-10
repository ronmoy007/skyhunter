import { NextResponse } from "next/server";
import { requireAdmin, findUser } from "@/lib/auth";
import {
  conversationCreate,
  conversationsForUser,
  supportConversationFor,
} from "@/lib/store";
import { notifyUser } from "@/lib/notify";
import { sendContractMatchEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

// Admin opens a support chat with a member, or matches two members for a
// contract chat. Returns the conversation id to navigate to.
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const kind = body?.kind === "contract" ? "contract" : "support";

  if (kind === "support") {
    const email = String(body?.email ?? "").trim().toLowerCase();
    const member = email ? await findUser(email) : null;
    if (!member) {
      return NextResponse.json(
        { ok: false, error: "That member isn't registered." },
        { status: 400 },
      );
    }
    // Reuse an existing support thread if there is one.
    const existing = await supportConversationFor(email);
    if (existing) return NextResponse.json({ ok: true, id: existing.id });

    const conv = await conversationCreate("support", [email], "Support");
    await notifyUser(email, {
      type: `message:${conv.id}`,
      title: "SkyHunter Support started a chat",
      body: "The team is ready to help — open your messages to reply.",
    });
    return NextResponse.json({ ok: true, id: conv.id });
  }

  // contract: two distinct members
  const a = String(body?.emailA ?? "").trim().toLowerCase();
  const b = String(body?.emailB ?? "").trim().toLowerCase();
  if (!a || !b || a === b) {
    return NextResponse.json(
      { ok: false, error: "Pick two different members." },
      { status: 400 },
    );
  }
  const [ua, ub] = await Promise.all([findUser(a), findUser(b)]);
  if (!ua || !ub) {
    return NextResponse.json(
      { ok: false, error: "Both people must be registered members." },
      { status: 400 },
    );
  }

  // Reuse an existing contract thread between the same two members.
  const mine = await conversationsForUser(a);
  const dup = mine.find(
    (c) =>
      c.kind === "contract" &&
      c.participants.includes(a) &&
      c.participants.includes(b),
  );
  if (dup) return NextResponse.json({ ok: true, id: dup.id });

  const title = String(body?.title ?? "").trim() || "Contract match";
  const conv = await conversationCreate("contract", [a, b], title);

  // Sequential (not Promise.all): the local file store's read-modify-write
  // isn't atomic, so concurrent notifies would clobber each other.
  await notifyUser(a, {
    type: `message:${conv.id}`,
    title: "You've been matched for a contract",
    body: `SkyHunter connected you with ${ub.name}. Open your messages to chat.`,
  });
  await notifyUser(b, {
    type: `message:${conv.id}`,
    title: "You've been matched for a contract",
    body: `SkyHunter connected you with ${ua.name}. Open your messages to chat.`,
  });

  // Also email both members from support@skyhunterlab.online (best-effort).
  const url = `${SITE_URL}/messages/${conv.id}`;
  const context = String(body?.title ?? "").trim();
  await Promise.all([
    sendContractMatchEmail(a, ua.name, ub.name, context, url),
    sendContractMatchEmail(b, ub.name, ua.name, context, url),
  ]).catch(() => {});

  return NextResponse.json({ ok: true, id: conv.id });
}
