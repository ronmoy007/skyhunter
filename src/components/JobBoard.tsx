"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type Job } from "@/lib/jobs";
import { JobCard } from "./JobCard";

export function JobBoard({ jobs }: { jobs: Job[] }) {
  const [category, setCategory] = useState<string>("All projects");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (category !== "All projects" && job.category !== category) return false;
      if (!q) return true;
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.summary.toLowerCase().includes(q) ||
        job.tags.some((t) => t.toLowerCase().includes(q)) ||
        job.broughtFrom.toLowerCase().includes(q)
      );
    });
  }, [jobs, category, query]);

  return (
    <div>
      <div className="rounded-2xl border border-steel-line/70 bg-navy/60 p-4 sm:p-5">
        <label className="sr-only" htmlFor="job-search">
          Search builds by type, industry, or stack
        </label>
        <input
          id="job-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'RAG', 'voice agent', 'healthcare', or a stack…"
          className="w-full rounded-xl border border-steel-line bg-void/70 px-4 py-3 text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500"
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "bg-blue-500 text-white"
                  : "bg-steel/50 text-mist hover:bg-steel"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-fog">
        {filtered.length} {filtered.length === 1 ? "build" : "builds"} in our
        portfolio.
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-steel-line bg-navy/40 p-10 text-center">
          <p className="font-display text-xl text-chrome">No builds match that.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-fog">
            Try a broader search or clear the filters — or tell us what you want
            built and we&apos;ll scope it.
          </p>
          <button
            onClick={() => {
              setCategory("All projects");
              setQuery("");
            }}
            className="mt-5 rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
