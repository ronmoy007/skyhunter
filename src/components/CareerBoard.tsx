"use client";

import Link from "next/link";
import type { Job } from "@/lib/jobs";

export function CareerBoard({ jobs }: { jobs: Job[] }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/career/${job.id}`}
          className="block rounded-xl border border-steel-line bg-navy/40 p-4 sm:p-6 transition-all hover:border-blue-500/50 hover:bg-navy/60 active:bg-navy/70 sm:active:bg-navy/60"
        >
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base sm:text-lg font-semibold text-chrome hover:text-blue-400 line-clamp-2">
                  {job.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-fog line-clamp-1">
                  {job.location} • {job.mode} • {job.type}
                </p>
              </div>
              {job.salary && (
                <p className="font-semibold text-chrome text-sm sm:text-base whitespace-nowrap">
                  {job.salary}
                </p>
              )}
            </div>
            <p className="text-xs sm:text-sm text-mist line-clamp-2">
              {job.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {job.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full bg-blue-500/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-blue-300"
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 2 && (
                <span className="text-xs text-fog">+{job.tags.length - 2}</span>
              )}
            </div>
            <p className="text-xs text-fog">
              Posted {job.postedDaysAgo} {job.postedDaysAgo === 1 ? "day" : "days"} ago
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
