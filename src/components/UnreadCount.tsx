"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

// Event the NotificationBell fires when it marks notifications read, so this
// live count zeroes instantly instead of drifting from the bell.
export const NOTIF_READ_EVENT = "skyhunter:notif-read";

// A live unread-notification count for the dashboard stat tile. It reads the
// same endpoint the bell uses, so the tile and the bell can never disagree.
export function UnreadCount({ initial = 0 }: { initial?: number }) {
  const { user } = useAuth();
  const [n, setN] = useState(initial);

  useEffect(() => {
    if (!user) {
      setN(0);
      return;
    }
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/notifications?count=1", {
          cache: "no-store",
        });
        const json = await res.json();
        if (alive) setN(json.unread ?? 0);
      } catch {
        /* keep the last value */
      }
    };
    load();
    const onRead = () => alive && setN(0);
    window.addEventListener(NOTIF_READ_EVENT, onRead);
    const t = setInterval(load, 60000);
    return () => {
      alive = false;
      window.removeEventListener(NOTIF_READ_EVENT, onRead);
      clearInterval(t);
    };
  }, [user]);

  return <>{n}</>;
}
