"use client";

import { useState } from "react";
import { PASSWORD_RULES, passwordScore, STRENGTH_LABELS } from "@/lib/password";
import { Check } from "./icons";

const inputClass =
  "w-full rounded-xl border border-steel-line bg-void px-4 py-3 pr-16 text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-1.5 block text-sm font-medium text-mist";

const BAR_COLOR = [
  "bg-red-400",
  "bg-red-400",
  "bg-amber-400",
  "bg-amber-400",
  "bg-cyan",
  "bg-cyan",
];

export function PasswordField() {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);

  const score = passwordScore(value); // 0..5
  const showMeter = touched || value.length > 0;

  return (
    <div>
      <label htmlFor="password" className={labelClass}>
        Password
      </label>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          required
          autoComplete="new-password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-semibold text-fog hover:text-chrome"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      {showMeter && (
        <div className="mt-2.5">
          {/* Strength bar */}
          <div className="flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`h-full flex-1 rounded-full transition-colors ${
                    i < score ? BAR_COLOR[score] : "bg-steel-line"
                  }`}
                />
              ))}
            </div>
            <span className="w-20 shrink-0 text-right text-xs font-medium text-fog">
              {STRENGTH_LABELS[score]}
            </span>
          </div>

          {/* Requirement checklist */}
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {PASSWORD_RULES.map((r) => {
              const ok = r.test(value);
              return (
                <li
                  key={r.label}
                  className={`flex items-center gap-1.5 text-xs ${
                    ok ? "text-cyan" : "text-fog"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                      ok ? "bg-cyan text-white" : "border border-steel-line"
                    }`}
                  >
                    {ok && <Check className="h-2 w-2" />}
                  </span>
                  {r.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
