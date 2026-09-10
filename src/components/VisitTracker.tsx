"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires a lightweight visit beacon on load and on navigation, throttled to at
// most once every 30s per browser so it approximates real visits without
// flooding. Runs for everyone (anonymous included).
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let allow = true;
    try {
      const KEY = "sky_last_visit";
      const last = Number(localStorage.getItem(KEY) || 0);
      const now = Date.now();
      if (now - last < 30_000) allow = false;
      else localStorage.setItem(KEY, String(now));
    } catch {
      /* private mode — just send it */
    }
    if (allow) {
      fetch("/api/track/visit", { method: "POST", keepalive: true }).catch(
        () => {},
      );
    }
  }, [pathname]);

  return null;
}
