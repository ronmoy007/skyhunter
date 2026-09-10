"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/icons";
import { MemberProfileModal } from "@/components/MemberProfileModal";
import { useCall } from "@/components/CallProvider";

type Msg = {
  id: string;
  senderEmail: string;
  senderName: string;
  body: string;
  createdAt: string;
  replyToId?: string | null;
  editedAt?: string | null;
};

const POLL_MS = 2500;

const AVATAR_COLORS = [
  "bg-[#8710d8]",
  "bg-[#2aa79b]",
  "bg-[#e17076]",
  "bg-[#3c8ce7]",
  "bg-[#e6a04c]",
  "bg-[#6bc86b]",
];
function colorFor(s: string): string {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Read receipt: a single grey tick once sent, double blue ticks once the other
// party has opened the thread past this message.
function ReadTicks({ read }: { read: boolean }) {
  return read ? (
    <svg
      viewBox="0 0 16 12"
      aria-label="Read"
      className="ml-1 inline-block h-3 w-4 align-middle text-sky-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 6.5l3 3 5-6" />
      <path d="M6 6.5l3 3 5-6" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 16 12"
      aria-label="Sent"
      className="ml-1 inline-block h-3 w-4 align-middle text-white/55"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6.5l3 3 5-6" />
    </svg>
  );
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  if (d.toDateString() === today) return "Today";
  if (d.toDateString() === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function ChatThread({ conversationId }: { conversationId: string }) {
  const [me, setMe] = useState("");
  const [display, setDisplay] = useState("Conversation");
  const [kind, setKind] = useState<"support" | "contract">("support");
  const [peerEmail, setPeerEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [peerReadAt, setPeerReadAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [editing, setEditing] = useState<Msg | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const { startCall, phase: callPhase } = useCall();

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const countRef = useRef(0);
  const lastPingRef = useRef(0);
  const deadRef = useRef(false); // conversation gone → stop polling
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ping the server that we're typing (throttled to once every ~2s).
  function pingTyping() {
    const now = Date.now();
    if (now - lastPingRef.current < 2000) return;
    lastPingRef.current = now;
    fetch(`/api/messages/${conversationId}/typing`, { method: "POST" }).catch(
      () => {},
    );
  }

  async function load(initial = false) {
    if (busyRef.current || deadRef.current) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        cache: "no-store",
      });
      if (res.status === 403 || res.status === 404) {
        // Conversation is gone/inaccessible — stop polling instead of hammering
        // the endpoint every couple of seconds.
        deadRef.current = true;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setError("This conversation isn't available.");
        return;
      }
      const json = await res.json();
      if (json.ok) {
        setMe(json.me);
        setDisplay(json.conversation?.display ?? "Conversation");
        setKind(json.conversation?.kind === "contract" ? "contract" : "support");
        setPeerEmail(json.conversation?.peerEmail ?? null);
        setAvatarUrl(json.conversation?.avatarUrl ?? "");
        setMessages(json.messages ?? []);
        setTyping(json.typing ?? null);
        setPeerReadAt(json.peerReadAt ?? null);
      }
    } catch {
      /* keep last state */
    } finally {
      busyRef.current = false;
      if (initial) setLoaded(true);
    }
  }

  useEffect(() => {
    deadRef.current = false;
    setError("");
    setLoaded(false);
    setPeerReadAt(null);
    countRef.current = 0;
    load(true);
    timerRef.current = setInterval(() => load(false), POLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (messages.length !== countRef.current) {
      const grew = messages.length > countRef.current;
      countRef.current = messages.length;
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      // A newly-arrived incoming message means the peer just sent — so they're
      // no longer typing. Clear it instantly rather than waiting for the next
      // poll, keeping the header in sync with the message that just landed.
      const last = messages[messages.length - 1];
      if (grew && last && me && last.senderEmail !== me) setTyping(null);
    }
  }, [messages, me]);

  // Drop reply/edit targets that disappeared (e.g. deleted on the other side).
  useEffect(() => {
    if (editing && !messages.some((m) => m.id === editing.id)) {
      setEditing(null);
      setInput("");
    }
    if (replyTo && !messages.some((m) => m.id === replyTo.id)) setReplyTo(null);
  }, [messages, editing, replyTo]);

  // Close the per-message action menu on any outside click.
  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuFor]);

  function startReply(m: Msg) {
    setEditing(null);
    setInput("");
    setReplyTo(m);
    setMenuFor(null);
    inputRef.current?.focus();
  }

  function startEdit(m: Msg) {
    setReplyTo(null);
    setEditing(m);
    setInput(m.body);
    setMenuFor(null);
    inputRef.current?.focus();
  }

  function cancelCompose() {
    setEditing(null);
    setReplyTo(null);
    setInput("");
  }

  async function deleteMessage(m: Msg) {
    setMenuFor(null);
    if (!window.confirm("Delete this message?")) return;
    setMessages((prev) => prev.filter((x) => x.id !== m.id)); // optimistic
    if (editing?.id === m.id) cancelCompose();
    if (replyTo?.id === m.id) setReplyTo(null);
    try {
      await fetch(`/api/messages/${conversationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: m.id }),
      });
    } catch {
      /* next poll reconciles if it failed */
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = input.trim();
    if (!body || sending) return;

    // Editing an existing message.
    if (editing) {
      const target = editing;
      setSending(true);
      try {
        const res = await fetch(`/api/messages/${conversationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: target.id, body }),
        });
        const json = await res.json();
        if (json.ok && json.message) {
          setMessages((prev) =>
            prev.map((x) => (x.id === target.id ? json.message : x)),
          );
          cancelCompose();
        }
      } catch {
        /* leave the composer as-is so they can retry */
      } finally {
        setSending(false);
      }
      return;
    }

    // Sending a new message (optionally a reply).
    const reply = replyTo;
    setSending(true);
    setInput("");
    setReplyTo(null);
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, replyToId: reply?.id ?? null }),
      });
      const json = await res.json();
      if (json.ok && json.message) {
        setMessages((prev) =>
          prev.some((m) => m.id === json.message.id)
            ? prev
            : [...prev, json.message],
        );
      } else {
        setInput(body);
        if (reply) setReplyTo(reply);
      }
    } catch {
      setInput(body);
      if (reply) setReplyTo(reply);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape" && (editing || replyTo)) {
      e.preventDefault();
      cancelCompose();
      return;
    }
    // Shift+Enter on an empty composer jumps to editing your latest message.
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      if (!input.trim() && !editing) {
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].senderEmail === me) {
            startEdit(messages[i]);
            break;
          }
        }
      }
    }
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-fog">{error}</p>
        <Link
          href="/messages"
          className="text-sm font-semibold text-blue-500 hover:text-blue-400"
        >
          ← Back to messages
        </Link>
      </div>
    );
  }

  let lastDay = "";

  return (
    <div className="flex h-full min-h-0 flex-col bg-void">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-steel-line bg-abyss px-4 py-2.5">
        <Link
          href="/messages"
          className="text-fog transition-colors hover:text-chrome md:hidden"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        {peerEmail ? (
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            title={`View ${display}'s profile`}
            className="flex min-w-0 items-center gap-3 rounded-lg text-left transition-opacity hover:opacity-80"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white ${avatarUrl ? "bg-steel" : colorFor(conversationId)}`}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                display.slice(0, 1).toUpperCase()
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-chrome">{display}</p>
              <p className="flex items-center gap-1.5 truncate text-xs">
                <span className="text-fog">View profile</span>
                {typing && (
                  <span className="font-medium text-blue-500">· typing…</span>
                )}
              </p>
            </div>
          </button>
        ) : (
          <>
        <span
          className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white ${avatarUrl ? "bg-steel" : colorFor(conversationId)}`}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            display.slice(0, 1).toUpperCase()
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-chrome">{display}</p>
          <p className="flex items-center gap-1.5 truncate text-xs">
            <span className="text-fog">
              {kind === "contract" ? "Contract chat" : "Support chat"}
            </span>
            {typing && (
              <span className="font-medium text-blue-500">· typing…</span>
            )}
          </p>
        </div>
          </>
        )}

        {/* Voice call — member↔member contract chats only. */}
        {kind === "contract" && peerEmail && (
          <button
            type="button"
            onClick={() => startCall(conversationId, display)}
            disabled={callPhase !== "idle"}
            title={callPhase === "idle" ? `Call ${display}` : "Already in a call"}
            aria-label={`Call ${display}`}
            className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-emerald-400 transition-colors hover:bg-emerald-500/15 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.1 2.2z" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages — simple sky-tinted wallpaper with a faint dotted texture */}
      <div className="chat-wallpaper min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-6">
        {!loaded ? (
          <div className="flex h-full items-center justify-center text-fog">
            <Spinner className="h-5 w-5" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-fog">
            <p>No messages yet.</p>
            <p className="mt-1 text-sm">Say hello to get things started.</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderEmail === me;
            const read =
              mine &&
              !!peerReadAt &&
              new Date(m.createdAt).getTime() <= new Date(peerReadAt).getTime();
            const day = new Date(m.createdAt).toDateString();
            const showDate = day !== lastDay;
            lastDay = day;
            const repliedTo = m.replyToId
              ? messages.find((x) => x.id === m.replyToId)
              : null;
            const menuOpen = menuFor === m.id;
            const canDelete = mine; // you can only delete your own messages

            const actions = (
              <div
                className={`relative self-center transition-opacity ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                <button
                  type="button"
                  aria-label="Message actions"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuFor(menuOpen ? null : m.id);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-fog transition-colors hover:bg-navy-soft hover:text-chrome"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <circle cx="5" cy="12" r="1.7" />
                    <circle cx="12" cy="12" r="1.7" />
                    <circle cx="19" cy="12" r="1.7" />
                  </svg>
                </button>
                {menuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute top-8 z-10 w-32 overflow-hidden rounded-lg border border-steel-line bg-void py-1 shadow-lg ${mine ? "right-0" : "left-0"}`}
                  >
                    <button
                      type="button"
                      onClick={() => startReply(m)}
                      className="block w-full px-3 py-1.5 text-left text-sm text-mist transition-colors hover:bg-abyss hover:text-chrome"
                    >
                      Reply
                    </button>
                    {mine && (
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        className="block w-full px-3 py-1.5 text-left text-sm text-mist transition-colors hover:bg-abyss hover:text-chrome"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => deleteMessage(m)}
                        className="block w-full px-3 py-1.5 text-left text-sm text-red-500 transition-colors hover:bg-abyss"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );

            return (
              <div key={m.id}>
                {showDate && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-void px-3 py-1 text-xs font-medium text-fog shadow-sm">
                      {dateLabel(m.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`group flex items-center gap-1 ${mine ? "justify-end" : "justify-start"}`}
                >
                  {mine && actions}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                      mine
                        ? "rounded-br-md bg-blue-500 text-white"
                        : "rounded-bl-md border border-steel-line bg-void text-chrome"
                    }`}
                  >
                    {repliedTo ? (
                      <div
                        className={`mb-1 border-l-2 pl-2 ${mine ? "border-white/50" : "border-blue-500"}`}
                      >
                        <p
                          className={`text-xs font-semibold ${mine ? "text-white/90" : "text-blue-500"}`}
                        >
                          {repliedTo.senderName || "Message"}
                        </p>
                        <p
                          className={`truncate text-xs ${mine ? "text-white/70" : "text-fog"}`}
                        >
                          {repliedTo.body}
                        </p>
                      </div>
                    ) : m.replyToId ? (
                      <p className="mb-1 border-l-2 border-fog/40 pl-2 text-xs italic text-fog">
                        Original message deleted
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <span
                      className={`mt-0.5 block text-right text-[0.65rem] ${mine ? "text-white/70" : "text-faint"}`}
                    >
                      {m.editedAt ? "edited · " : ""}
                      {timeLabel(m.createdAt)}
                      {mine && <ReadTicks read={read} />}
                    </span>
                  </div>
                  {!mine && actions}
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-steel-line bg-abyss">
        {(editing || replyTo) && (
          <div className="flex items-center gap-2 px-3 pt-2">
            <div className="flex-1 overflow-hidden border-l-2 border-blue-500 pl-2">
              <p className="text-xs font-semibold text-blue-500">
                {editing
                  ? "Editing message"
                  : `Replying to ${replyTo?.senderName || "message"}`}
              </p>
              <p className="truncate text-xs text-fog">
                {(editing ?? replyTo)?.body}
              </p>
            </div>
            <button
              type="button"
              onClick={cancelCompose}
              aria-label="Cancel"
              className="shrink-0 rounded-md p-1 text-fog transition-colors hover:bg-navy-soft hover:text-chrome"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value.trim()) pingTyping();
            }}
            onKeyDown={onKeyDown}
            placeholder={editing ? "Edit message" : "Message"}
            className="flex-1 rounded-full border border-steel-line bg-void px-4 py-2.5 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label={editing ? "Save" : "Send"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-400 disabled:opacity-40"
          >
            {sending ? (
              <Spinner className="h-4 w-4" />
            ) : editing ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M4 12l16-7-7 16-2.5-6.5L4 12z" fill="currentColor" />
              </svg>
            )}
          </button>
        </form>
      </div>

      {profileOpen && peerEmail && (
        <MemberProfileModal
          email={peerEmail}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
