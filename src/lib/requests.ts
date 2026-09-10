// Shared status vocabularies for member requests (interviews + job
// applications). Client-safe — imported by both the admin API route and the
// RequestsManager UI so the options never drift.

export const INTERVIEW_STATUSES = [
  "pending",
  "contacted",
  "scheduled",
  "connected",
  "declined",
  "closed",
] as const;

export const APPLICATION_STATUSES = [
  "applied",
  "reviewing",
  "interviewing",
  "offer",
  "hired",
  "rejected",
] as const;

// Tailwind badge classes per status (shared visual language).
export const STATUS_BADGE: Record<string, string> = {
  // interviews
  pending: "bg-steel text-fog",
  contacted: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30",
  scheduled: "bg-amber-400/10 text-amber-500 ring-1 ring-amber-400/30",
  connected: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
  declined: "bg-red-400/10 text-red-500 ring-1 ring-red-400/30",
  closed: "bg-steel text-fog line-through",
  // applications
  applied: "bg-steel text-fog",
  reviewing: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30",
  interviewing: "bg-amber-400/10 text-amber-500 ring-1 ring-amber-400/30",
  offer: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
  hired: "bg-cyan/15 text-cyan ring-1 ring-cyan/40",
  rejected: "bg-red-400/10 text-red-500 ring-1 ring-red-400/30",
};

// Friendly, member-facing explanation of each status.
export const STATUS_HINT: Record<string, string> = {
  // interviews
  pending: "Waiting for the SkyHunter team to review your request.",
  contacted: "The team has reached out — check your email.",
  scheduled: "Your interview is scheduled. Check your email for the time and link.",
  connected: "You're connected — congratulations!",
  declined: "Not moving forward this time. The team will suggest alternatives.",
  closed: "This request has been closed.",
  // applications
  applied: "Your application was received.",
  reviewing: "Your application is under review.",
  interviewing: "You've reached the interview stage.",
  offer: "There's an offer on the table — well done!",
  hired: "You've been hired. Congratulations!",
  rejected: "Not selected this time. Keep going — more roles are coming.",
};

// Human-readable confirmed interview time, e.g. "Fri, Aug 1, 2026, 2:30 PM".
// Shared by the admin scheduler and every member-facing view so they match.
export function formatSchedule(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Statuses that count as "open / needs action" for summary counts.
export const OPEN_STATUSES = new Set([
  "pending",
  "contacted",
  "scheduled",
  "applied",
  "reviewing",
  "interviewing",
  "offer",
]);
