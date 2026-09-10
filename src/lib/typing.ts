/*
  Transient "who is typing" presence for chat, kept in server memory (it's
  ephemeral — a few seconds — so it doesn't belong in the database). A user
  pings while typing; the other side's poll reads it. Entries expire after TTL.

  Note: on a multi-instance serverless deployment this is per-instance, so it's
  best-effort. Typing indicators are non-critical, so that's acceptable.
*/

const TTL_MS = 5000;

// conversationId -> (lowercased email -> last-typed epoch ms)
const store = new Map<string, Map<string, number>>();

export function noteTyping(conversationId: string, email: string): void {
  let inner = store.get(conversationId);
  if (!inner) {
    inner = new Map();
    store.set(conversationId, inner);
  }
  inner.set(email.toLowerCase(), Date.now());
}

// Immediately clear a user's typing state — call when they send a message, so
// the other side stops seeing "typing…" the instant the message lands instead
// of waiting out the TTL.
export function clearTyping(conversationId: string, email: string): void {
  store.get(conversationId)?.delete(email.toLowerCase());
}

// Emails currently typing in a conversation, excluding `exceptEmail`. Prunes
// stale entries as it goes.
export function typingIn(conversationId: string, exceptEmail: string): string[] {
  const inner = store.get(conversationId);
  if (!inner) return [];
  const now = Date.now();
  const me = exceptEmail.toLowerCase();
  const out: string[] = [];
  for (const [email, ts] of inner) {
    if (now - ts > TTL_MS) {
      inner.delete(email);
      continue;
    }
    if (email !== me) out.push(email);
  }
  return out;
}

// Is anyone (other than `exceptEmail`) typing in this conversation?
export function anyoneTyping(conversationId: string, exceptEmail: string): boolean {
  return typingIn(conversationId, exceptEmail).length > 0;
}
