import type { Metadata } from "next";
import Link from "next/link";
import { JobBoard } from "@/components/JobBoard";
import { listJobs } from "@/lib/jobs-data";

// Static HTML, refreshed at most every 10 min; admin edits bust it via
// revalidateTag("jobs").
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Careers · SkyHunter",
  description:
    "Career opportunities at SkyHunter. Join our team and help build the future of AI development.",
};

export default async function CareersPage() {
  const jobs = await listJobs();

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-steel-line/80 bg-navy/50 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
            Careers
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
            Join our team
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-mist">
            We're hiring talented developers, designers, and AI experts to help build the future of AI development. Explore open positions and grow your career with us.
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
