"use client";

import Link from "next/link";
import type { Job } from "@/lib/jobs";

export function CareerBoard({ jobs }: { jobs: Job[] }) {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/career/${job.id}`}
          className="block rounded-xl border border-steel-line bg-navy/40 p-6 transition-all hover:border-blue-500/50 hover:bg-navy/60"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg font-semibold text-chrome hover:text-blue-400">
                {job.title}
              </h3>
              <p className="mt-1 text-sm text-fog">
                {job.location} • {job.mode} • {job.type}
              </p>
              <p className="mt-3 text-mist line-clamp-2">
                {job.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end justify-between sm:items-start sm:justify-end gap-2 whitespace-nowrap">
              {job.salary && (
                <p className="font-semibold text-chrome">
                  {job.salary}
                </p>
              )}
              <span className="text-xs text-fog">
                Posted {job.postedDaysAgo} {job.postedDaysAgo === 1 ? "day" : "days"} ago
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
