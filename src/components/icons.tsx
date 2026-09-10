// Small, consistent line icons — no emoji, so the UI reads as designed.

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 10.5l3.5 3.5 7.5-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 8l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M19 15l.7 1.8L21.5 17.5 19.7 18.2 19 20l-.7-1.8L16.5 17.5 18.3 16.8 19 15z" />
    </svg>
  );
}

export function Shield({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function Users({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8M21 20c0-2.6-1.5-4.8-3.7-5.6" />
    </svg>
  );
}

export function Briefcase({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
    </svg>
  );
}

export function Book({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4z" />
      <path d="M5 4a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2" />
    </svg>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`animate-spin ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Bell({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export function Lifebuoy({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M4.9 4.9l3.6 3.6M15.5 15.5l3.6 3.6M19.1 4.9l-3.6 3.6M8.5 15.5l-3.6 3.6" />
    </svg>
  );
}

export function Compass({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.8 8.2l-2 5.6-5.6 2 2-5.6 5.6-2z" />
    </svg>
  );
}

export function Calendar({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 9.5h17" />
    </svg>
  );
}

export function Trash({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 7h16M10 4h4a1 1 0 0 1 1 1v2H9V5a1 1 0 0 1 1-1z" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11.5v5.5M14 11.5v5.5" />
    </svg>
  );
}

export function Laptop({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="4" y="5" width="16" height="10" rx="1.5" />
      <path d="M2.5 18.5h19" />
    </svg>
  );
}

// Coin with a dollar mark — income / earnings.
export function Coin({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M14.6 9.3c-.6-.8-1.6-1.2-2.6-1.2-1.5 0-2.7.8-2.7 1.9 0 1.3 1.2 1.7 2.7 2 1.6.3 2.8.8 2.8 2.1 0 1.1-1.2 2-2.8 2-1.1 0-2.1-.4-2.7-1.2" />
    </svg>
  );
}

// Telegram paper-plane (filled) — use on a colored badge with white text.
export function Telegram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M21.94 4.3 18.9 19.06c-.22 1-.82 1.25-1.66.78l-4.6-3.39-2.22 2.14c-.25.24-.45.45-.92.45l.33-4.68 8.52-7.7c.37-.33-.08-.51-.58-.18L7.24 13.3l-4.53-1.42c-.98-.31-1-.98.2-1.45L20.4 3.07c.82-.3 1.54.18 1.27 1.16z" />
    </svg>
  );
}
