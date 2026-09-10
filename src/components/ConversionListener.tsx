"use client";

import { useEffect } from "react";
import { trackSignupConversion } from "@/lib/gtag";

// Fires the Google Ads "signup" conversion once when a freshly-created account
// lands with ?signup=1 (set by both the email and OAuth signup flows), then
// strips the marker from the URL. Works for server redirects (OAuth) and client
// navigations (email verify) alike.
export function ConversionListener() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("signup") === "1") {
        trackSignupConversion();
        url.searchParams.delete("signup");
        window.history.replaceState({}, "", url.toString());
      }
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
