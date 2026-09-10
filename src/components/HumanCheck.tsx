"use client";

import { useEffect, useRef, useState } from "react";
import { Honeypot } from "./Honeypot";
import { Check, Spinner } from "./icons";

/*
  Discord-style "verify you are human" check — dependency-free.

  Signals combined (any one failing => treated as a bot on the server):
  - honeypot field must stay empty
  - a real, TRUSTED click on the checkbox (bots that auto-submit never fire it)
  - a minimum dwell time on the page before the box is checked (bots are instant)

  It posts hidden fields: human="verified" and hcDwellMs (ms from mount to check).
  For a hardened production setup, layer a real service (e.g. Cloudflare
  Turnstile) — see the note in the signup route.
*/

type State = "idle" | "checking" | "verified";

const MIN_DWELL_MS = 800;

export function HumanCheck() {
  const [state, setState] = useState<State>("idle");
  const [dwell, setDwell] = useState(0);
  const [error, setError] = useState("");
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  function verify(e: React.MouseEvent) {
    if (state !== "idle") return;
    // Ignore programmatic clicks — only a genuine user gesture counts.
    if (!e.isTrusted) return;

    const elapsed = Date.now() - mountedAt.current;
    if (elapsed < MIN_DWELL_MS) {
      setError("That was a little too quick — try again.");
      return;
    }
    setError("");
    setState("checking");
    // Brief, believable verification beat, then confirm.
    window.setTimeout(() => {
      setDwell(elapsed);
      setState("verified");
    }, 550);
  }

  const verified = state === "verified";

  return (
    <div>
      <Honeypot />

      <button
        type="button"
        onClick={verify}
        aria-pressed={verified}
        disabled={state !== "idle"}
        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
          verified
            ? "border-cyan/40 bg-cyan/5"
            : "border-steel-line bg-void hover:border-blue-500/50"
        }`}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
            verified
              ? "border-cyan bg-cyan text-white"
              : "border-steel-line bg-navy"
          }`}
        >
          {state === "checking" ? (
            <Spinner className="h-4 w-4 text-blue-400" />
          ) : verified ? (
            <Check className="h-4 w-4" />
          ) : null}
        </span>
        <span className="flex-1">
          <span className="block text-sm font-medium text-chrome">
            {state === "checking"
              ? "Verifying…"
              : verified
                ? "Verified — you're human"
                : "Verify you are human"}
          </span>
          <span className="block text-xs text-fog">
            {verified ? "Thanks for confirming." : "Tap the box to continue."}
          </span>
        </span>
        <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-widest text-faint">
          SkyHunter
        </span>
      </button>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {/* Server re-checks these. */}
      <input type="hidden" name="human" value={verified ? "verified" : ""} readOnly />
      <input type="hidden" name="hcDwellMs" value={verified ? dwell : ""} readOnly />
    </div>
  );
}
