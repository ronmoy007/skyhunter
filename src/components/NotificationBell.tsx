"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { NOTIF_READ_EVENT } from "./UnreadCount";
import { Bell } from "./icons";

// Where a notification should take the user when clicked. Status-update
// notifications encode their target as "request:<kind>:<id>" so they open the
// exact request detail; older/simple types fall back to a sensible page.
function linkFor(type: string): string | null {
  const m = /^request:(interview|application):(.+)$/.exec(type);
  if (m) return `/requests/${m[1]}/${m[2]}`;
  const chat = /^message:(.+)$/.exec(type);
  if (chat) return `/messages/${chat[1]}`;
  if (["request-update", "intro", "interview", "application", "apply"].includes(type)) {
    return "/requests";
  }
  if (type === "profile") return "/profile";
  if (type === "welcome") return "/dashboard";
  return null;
}

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 7 ? `${days}d ago` : new Date(iso).toLocaleDateString();
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Cheap: just the unread count (mount + poll).
  const loadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?count=1", { cache: "no-store" });
      const json = await res.json();
      setUnread(json.unread ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  // Full list — only fetched when the panel is opened. Returns the loaded list
  // so the caller can decide (from real data, not stale state) whether to mark
  // anything read.
  const loadList = useCallback(async (): Promise<Notification[]> => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const json = await res.json();
      const list: Notification[] = json.notifications ?? [];
      setItems(list);
      setUnread(json.unread ?? 0);
      return list;
    } catch {
      return [];
    }
  }, []);

  // While signed in: prefetch the full list once so the first click is instant
  // (no waiting on a round-trip), then keep the badge fresh with a light count
  // poll.
  useEffect(() => {
    if (!user) {
      setItems([]);
      setUnread(0);
      return;
    }
    loadList();
    const t = setInterval(loadCount, 60000);
    return () => clearInterval(t);
  }, [user, loadList, loadCount]);

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      const list = await loadList(); // fetch the list only when opened
      // Only mark read if the list actually loaded unread items — never off
      // stale state, so a failed/empty load can't silently bury notifications.
      if (list.some((n) => !n.read)) {
        setUnread(0);
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        // Tell the dashboard's live count to zero out too.
        window.dispatchEvent(new Event(NOTIF_READ_EVENT));
        await fetch("/api/notifications", { method: "POST", body: "{}" });
      }
    }
  }

  if (!user) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-steel-line bg-void text-mist transition-colors hover:bg-abyss hover:text-chrome"
      >
        <Bell className="h-6 w-6" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[0.6rem] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="lift absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-steel-line bg-void">
          <div className="flex items-center justify-between border-b border-steel-line px-4 py-2.5">
            <p className="text-sm font-semibold text-chrome">Notifications</p>
            <span className="text-xs text-fog">{items.length}</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-fog">
                You&apos;re all caught up.
              </p>
            ) : (
              <ul className="divide-y divide-steel-line">
                {items.map((n) => {
                  const href = linkFor(n.type);
                  const inner = (
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                      <div className={n.read ? "pl-4" : ""}>
                        <p className="text-sm font-medium text-chrome">
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 text-xs leading-relaxed text-mist">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-1 text-[0.7rem] text-fog">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                  const cls = `block px-4 py-3 ${n.read ? "" : "bg-blue-500/5"}`;
                  return (
                    <li key={n.id}>
                      {href ? (
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          className={`${cls} transition-colors hover:bg-abyss`}
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className={cls}>{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
