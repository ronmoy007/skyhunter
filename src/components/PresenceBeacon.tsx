"use client";

import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

// While signed in, sends a heartbeat every ~40s (and when the tab refocuses) so
// the admin's "online now" list stays current. Online window is 2 min.
export function PresenceBeacon() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const ping = () =>
      fetch("/api/presence", { method: "POST", keepalive: true }).catch(
        () => {},
      );
    ping();
    const t = setInterval(ping, 40_000);
    const onVis = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [user]);

  return null;
}
