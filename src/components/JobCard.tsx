import Link from "next/link";
import { type Job } from "@/lib/jobs";

const modeStyles: Record<Job["mode"], string> = {
  Remote: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
  Hybrid: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30",
  "On-site": "bg-steel/60 text-mist ring-1 ring-steel-line",
};

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/work/${job.id}`}
      className="group flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy/60 p-6 transition-colors hover:border-blue-500/50 hover:bg-navy-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold leading-tight text-chrome group-hover:text-blue-500">
            {job.title}
          </h3>
          <p className="mt-1 text-sm text-fog">
            {job.company} · {job.category}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${modeStyles[job.mode]}`}
          >
            {job.mode}
          </span>
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-mist">
        {job.summary}
      </p>

      <div className="mt-5 rounded-xl border border-steel-line/70 bg-void/50 p-3.5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-blue-400">
          What we built
        </p>
        <p className="mt-1 text-sm leading-snug text-mist">{job.humanEdge}</p>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="font-semibold text-chrome">{job.salary}</span>
        <span className="font-medium text-blue-300 opacity-0 transition-opacity group-hover:opacity-100">
          View build →
        </span>
      </div>
    </Link>
  );
}
