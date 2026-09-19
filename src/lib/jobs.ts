import REMOTE_JOBS_DATA from "./remote-jobs.json";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: "Remote" | "Hybrid" | "On-site";
  type: "Full-time" | "Part-time" | "Contract";
  salary: string;
  category: string;
  status?: string; // Hiring | Interviewing | Hired | Closed | Draft
  postedDaysAgo: number;
  // Why this role tends to hold up well alongside AI — written for a human, not a bot.
  humanEdge: string;
  summary: string;
  responsibilities: string[];
  broughtFrom: string; // a transferable-skills note: "You already do this if you were a ___"
  tags: string[];
};

export const JOB_STATUSES = [
  "Hiring",
  "Interviewing",
  "Hired",
  "Closed",
  "Draft",
] as const;

// Tailwind classes per status (defined here so cards + detail stay consistent).
export const JOB_STATUS_STYLE: Record<string, string> = {
  Hiring: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
  Interviewing: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30",
  Hired: "bg-blue-500/15 text-blue-500 ring-1 ring-blue-500/40",
  Closed: "bg-steel text-fog ring-1 ring-steel-line",
  Draft: "bg-steel text-fog ring-1 ring-steel-line",
};

// Applications are only open for these statuses.
export function isJobOpen(status?: string): boolean {
  return !status || status === "Hiring" || status === "Interviewing";
}

export const CATEGORIES = [
  // NOTE: JobBoard.tsx hard-codes this first entry as its show-all sentinel —
  // keep the two in sync or the first filter tab returns zero results.
  "All projects",
  "Support agents",
  "RAG & Search",
  "Workflow automation",
  "Voice agents",
  "Data & Analytics",
  "Fine-tuning & Evals",
] as const;

// Career positions and current active projects live in remote-jobs.json
// as the single source of truth (also synced with Supabase database).
export const JOBS: Job[] = [...(REMOTE_JOBS_DATA as Job[])];

export function getJob(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}
