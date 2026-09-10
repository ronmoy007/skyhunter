"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "./icons";

/*
  A theme-matched dropdown. Native <select> option lists fall back to the OS
  (white) styling and can't be themed — this replaces them with a styled
  listbox while keeping a real hidden input so the form still posts normally.
*/
export function Select({
  name,
  options,
  placeholder = "Choose one…",
  required = false,
  defaultValue = "",
  onChange,
}: {
  name: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(v: string) {
    setValue(v);
    setOpen(false);
    onChange?.(v);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      else setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) choose(options[active]);
      else setOpen(true);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      {/* real form value */}
      <input type="hidden" name={name} value={value} required={required} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`flex w-full items-center justify-between rounded-xl border bg-void/60 px-4 py-3 text-left outline-none transition-colors ${
          open ? "border-blue-500 ring-1 ring-blue-500/40" : "border-steel-line hover:border-steel-line/80"
        }`}
      >
        <span className={value ? "text-chrome" : "text-faint"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-fog transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="lift absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-steel-line bg-navy p-1.5"
        >
          {options.map((opt, i) => {
            const selected = opt === value;
            return (
              <li key={opt} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => choose(opt)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    i === active
                      ? "bg-blue-500/15 text-chrome"
                      : "text-mist hover:bg-steel/60"
                  }`}
                >
                  <span>{opt}</span>
                  {selected && <Check className="h-4 w-4 text-blue-300" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
