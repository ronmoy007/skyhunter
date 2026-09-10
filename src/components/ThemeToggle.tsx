"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "sky_theme";

export function ThemeToggle() {
  // null until we've read the real theme on the client — keeps the server and
  // first client render identical (no hydration mismatch).
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // localStorage is the source of truth. Re-apply it on mount so the saved
    // choice always wins — even if hydration cleared the <html> data-theme the
    // no-flash script set. Falls back to the current attribute, then OS.
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* private mode */
    }
    const resolved: Theme =
      saved === "dark" || saved === "light"
        ? saved
        : ((document.documentElement.getAttribute("data-theme") as Theme) ??
          "light");
    document.documentElement.setAttribute("data-theme", resolved);
    setTheme(resolved);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the choice just won't persist */
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-11 w-11 items-center justify-center rounded-lg border border-steel-line bg-void text-mist transition-colors hover:bg-abyss hover:text-chrome"
    >
      {isDark ? (
        // Sun — click to go light
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 2v2.5M12 19.5V22M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M2 12h2.5M19.5 12H22M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // Moon — click to go dark
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
