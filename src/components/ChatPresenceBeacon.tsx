"use client";

import { useEffect } from "react";

// Mounted only inside the Messages layout, so it heartbeats "in chat" presence
// exactly while the member is in the chat area. When they navigate away it
// unmounts and the heartbeats stop, so they drop to offline in others' contact
// lists after the window.
export function ChatPresenceBeacon() {
  useEffect(() => {
    const ping = () =>
      fetch("/api/presence/chat", { method: "POST", keepalive: true }).catch(
        () => {},
      );
    ping();
    const t = setInterval(ping, 30_000);
    return () => clearInterval(t);
  }, []);

  return null;
}
