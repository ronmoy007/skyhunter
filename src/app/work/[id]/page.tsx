import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById, listJobs } from "@/lib/jobs-data";
import { SITE_URL } from "@/lib/site";

// Public, statically generated case-study pages — best for SEO (crawlable rich
// results) and speed. Refreshed at most every 10 min; admin edits bust them via
// revalidateTag("jobs"). Builds added after build-time render on demand.
export const revalidate = 600;

export async function generateStaticParams() {
  return (await listJobs()).map((job) => ({ id: job.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) return { title: "Build not found · SkyHunter" };
  return {
    title: `${job.title} · ${job.company} · SkyHunter`,
    description: job.summary,
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();

  // CreativeWork structured data — this is a portfolio case study (a build we
  // shipped for a client), not a job listing.
  const dateCreated = new Date(
    Date.now() - (job.postedDaysAgo || 0) * 86400000,
  ).toISOString();
  const jobLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: job.title,
    headline: job.title,
    description: [job.summary, job.humanEdge, ...(job.responsibilities ?? [])]
      .filter(Boolean)
      .join(" "),
    dateCreated,
    about: job.category,
    keywords: (job.tags ?? []).join(", "),
    url: `${SITE_URL}/work/${job.id}`,
    creator: { "@type": "Organization", name: "SkyHunter", url: SITE_URL },
    author: { "@type": "Organization", name: "SkyHunter", url: SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobLd) }}
      />
    <article className="mx-auto max-w-3xl px-5 py-14">
      <Link
        href="/work"
        className="text-sm font-medium text-fog transition-colors hover:text-blue-300"
      >
        ← Back to our work
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan ring-1 ring-cyan/30">
            {job.category}
          </span>
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-chrome sm:text-5xl">
          {job.title}
        </h1>
        <p className="mt-3 text-lg text-mist">
          {job.company} · {job.location}
        </p>
        <p className="mt-2 font-display text-2xl font-semibold text-blue-300">
          {job.salary}
        </p>
      </header>

      <div className="mt-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
          The outcome
        </p>
        <p className="mt-2 text-lg leading-relaxed text-chrome">{job.humanEdge}</p>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-2xl font-bold text-chrome">
          The client
        </h2>
        <p className="mt-3 leading-relaxed text-mist">
          <span className="font-semibold text-chrome">{job.company}</span> —{" "}
          {job.location}. A {job.category.toLowerCase()} build we delivered end
          to end.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-chrome">
          The challenge
        </h2>
        <p className="mt-3 leading-relaxed text-mist">{job.summary}</p>

        <h2 className="mt-8 font-display text-2xl font-bold text-chrome">
          What we built
        </h2>
        <ul className="mt-3 space-y-2.5">
          {job.responsibilities.map((r) => (
            <li key={r} className="flex gap-3 text-mist">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              <span className="leading-relaxed">{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-2xl border border-cyan/25 bg-cyan/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan">
          The stack
        </p>
        <p className="mt-2 leading-relaxed text-chrome">{job.broughtFrom}</p>
      </div>

      {/* CTA — invite the visitor to commission a similar build */}
      <div className="lift mt-10 rounded-2xl border border-steel-line bg-navy px-6 py-10 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
          Want something like this?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-mist">
          Tell us what you&apos;re building and we&apos;ll scope it — most
          projects start within a week.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/start"
            className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
          >
            Start a project like this →
          </Link>
          <Link
            href="/book-a-call"
            className="rounded-lg border border-steel-line px-6 py-3 font-semibold text-chrome transition-colors hover:border-blue-500/60"
          >
            Book a call
          </Link>
        </div>
      </div>
    </article>
    </>
  );
}
