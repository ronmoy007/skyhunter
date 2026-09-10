import type { Metadata } from "next";
import Link from "next/link";
import { JobBoard } from "@/components/JobBoard";
import { listJobs } from "@/lib/jobs-data";

// Static HTML, refreshed at most every 10 min; admin edits bust it via
// revalidateTag("jobs").
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Our work · SkyHunter",
  description:
    "Selected builds from SkyHunter — websites, AI agents, LLM apps, RAG & search, and voice agents we've shipped for startups and small agencies.",
};

export default async function JobsPage() {
  const jobs = await listJobs();

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-steel-line/80 bg-navy/50 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
            Our work
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
            Products &amp; AI systems we&apos;ve shipped
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-mist">
            Websites, AI agents, LLM apps, RAG &amp; search, and voice agents —
            built end to end for startups and small agencies. Open any build to
            read the case study.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/start"
            className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
          >
            Start a project
          </Link>
          <Link
            href="/book-a-call"
            className="rounded-lg border border-steel-line px-6 py-3 font-semibold text-chrome transition-colors hover:border-blue-500/60"
          >
            Book a call
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <JobBoard jobs={jobs} />
      </div>
    </section>
  );
}
