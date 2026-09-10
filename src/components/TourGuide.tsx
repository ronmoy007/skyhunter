"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type TourStep = { selector: string; title: string; body: string };

// Event any component can dispatch to (re)start the tour.
export const TOUR_EVENT = "skyhunter:tour";

export function TourGuide({
  steps,
  storageKey,
  auto = false,
  markSeenUrl,
}: {
  steps: TourStep[];
  storageKey: string;
  auto?: boolean;
  markSeenUrl?: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const start = useCallback(() => {
    setI(0);
    setActive(true);
  }, []);

  // Auto-start after the page paints. Whether to auto-start is decided by the
  // server (the `auto` prop), so it reliably shows on a user's first sign-in and
  // is never suppressed by a stale localStorage flag from another session.
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(start, 700);
    return () => clearTimeout(t);
  }, [auto, start]);

  // Allow a "Take the tour" button anywhere to (re)start it.
  useEffect(() => {
    const h = () => start();
    window.addEventListener(TOUR_EVENT, h);
    return () => window.removeEventListener(TOUR_EVENT, h);
  }, [start]);

  // Measure the current target.
  const measure = useCallback(() => {
    if (!active) return;
    const el = document.querySelector(steps[i]?.selector);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "auto" });
      requestAnimationFrame(() =>
        setRect((el as HTMLElement).getBoundingClientRect()),
      );
    } else {
      setRect(null);
    }
  }, [active, i, steps]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (!active) return;
    const h = () => measure();
    window.addEventListener("resize", h);
    window.addEventListener("scroll", h, true);
    return () => {
      window.removeEventListener("resize", h);
      window.removeEventListener("scroll", h, true);
    };
  }, [active, measure]);

  async function finish() {
    setActive(false);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    // Persist "seen" on the account, then refresh so the server re-renders with
    // tourSeen=true and the tour won't auto-open again (on any browser).
    if (markSeenUrl) {
      try {
        await fetch(markSeenUrl, { method: "POST" });
      } catch {
        /* ignore */
      }
      router.refresh();
    }
  }
  const isLast = i === steps.length - 1;
  const next = () => (isLast ? finish() : setI(i + 1));
  const back = () => i > 0 && setI(i - 1);

  if (!active) return null;
  const step = steps[i];

  const pad = 8;
  const spot = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  // Position the dialog near the spotlight (below if there's room, else above).
  const W = 340;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let dialog: { top: number; left: number };
  if (spot) {
    const placeBelow = vh - (spot.top + spot.height) > 230;
    dialog = {
      top: placeBelow
        ? spot.top + spot.height + 14
        : Math.max(14, spot.top - 224),
      left: Math.min(Math.max(14, spot.left), vw - W - 14),
    };
  } else {
    dialog = { top: vh / 2 - 120, left: vw / 2 - W / 2 };
  }

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Spotlight: transparent hole + a huge box-shadow that dims the rest. */}
      {spot ? (
        <div
          className="pointer-events-none fixed rounded-xl transition-all duration-200"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
            outline: "2px solid #8710d8",
            outlineOffset: "2px",
          }}
        />
      ) : (
        <div className="pointer-events-none fixed inset-0 bg-black/50" />
      )}

      {/* Guide dialog */}
      <div
        className="lift fixed rounded-2xl border border-steel-line bg-void p-5"
        style={{ top: dialog.top, left: dialog.left, width: W }}
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
            {i + 1} / {steps.length}
          </span>
          <button
            onClick={finish}
            aria-label="Close tour"
            className="text-sm text-fog hover:text-chrome"
          >
            Skip
          </button>
        </div>

        <h3 className="mt-2 font-display text-lg font-semibold text-chrome">
          {step.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-mist">{step.body}</p>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={back}
            disabled={i === 0}
            className="rounded-lg px-3 py-2 text-sm font-medium text-fog transition-colors hover:text-chrome disabled:invisible"
          >
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={finish}
              className="rounded-lg border border-steel-line px-4 py-2 text-sm font-semibold text-chrome transition-colors hover:border-blue-500/60"
            >
              Got it
            </button>
            {!isLast && (
              <button
                onClick={next}
                className="rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* progress dots */}
        <div className="mt-4 flex justify-center gap-1.5">
          {steps.map((_, k) => (
            <span
              key={k}
              className={`h-1.5 rounded-full transition-all ${
                k === i ? "w-4 bg-blue-500" : "w-1.5 bg-steel-line"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
