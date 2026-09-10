"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

/*
  Fires a native browser notification when a chat message arrives while the user
  isn't looking at that conversation. It watches per-conversation unread counts
  (from /api/messages/conversations): the chat you're viewing is continuously
  marked read server-side, so its unread stays 0 — meaning an unread *increase*
  always signals a new message in a chat you're NOT currently in. That's exactly
  when we want to notify.
*/

const POLL_MS = 10000;

type Conv = {
  id: string;
  display: string;
  unread?: number;
  lastMessage: string;
};

export function ChatNotifier() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Read latest pathname inside the poll without restarting it on navigation.
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  const unreadRef = useRef<Map<string, number>>(new Map());
  const baselinedRef = useRef(false);

  // Ask for permission once. Some browsers require a user gesture, so if the
  // immediate request is ignored we retry on the first interaction.
  useEffect(() => {
    if (!user || typeof Notification === "undefined") return;
    if (Notification.permission !== "default") return;
    Notification.requestPermission().catch(() => {});
    const onGesture = () => {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", onGesture, { once: true });
    return () => window.removeEventListener("pointerdown", onGesture);
  }, [user]);

  useEffect(() => {
    if (!user) {
      unreadRef.current = new Map();
      baselinedRef.current = false;
      return;
    }

    let alive = true;

    async function poll() {
      let convs: Conv[];
      try {
        const res = await fetch("/api/messages/conversations", {
          cache: "no-store",
        });
        const json = await res.json();
        if (!json.ok) return;
        convs = json.conversations ?? [];
      } catch {
        return; // transient — try again next tick
      }
      if (!alive) return;

      const prev = unreadRef.current;
      const next = new Map<string, number>();
      const fresh: Conv[] = [];
      for (const c of convs) {
        const u = c.unread ?? 0;
        next.set(c.id, u);
        if (baselinedRef.current && u > (prev.get(c.id) ?? 0)) fresh.push(c);
      }
      unreadRef.current = next;

      // First poll just records the current state — don't notify for messages
      // that were already unread when the page loaded.
      if (!baselinedRef.current) {
        baselinedRef.current = true;
        return;
      }

      if (
        typeof Notification === "undefined" ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      for (const c of fresh) {
        // Never notify for the exact chat they're already viewing.
        if (pathRef.current === `/messages/${c.id}`) continue;
        try {
          const n = new Notification(c.display || "New message", {
            body: c.lastMessage || "You have a new message",
            tag: `sky-msg-${c.id}`, // collapse repeats from the same chat
            icon: "/icon.svg",
          });
          n.onclick = () => {
            window.focus();
            router.push(`/messages/${c.id}`);
            n.close();
          };
        } catch {
          /* notification construction can throw on some platforms — ignore */
        }
      }
    }

    poll();
    const t = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [user, router]);

  return null;
}
