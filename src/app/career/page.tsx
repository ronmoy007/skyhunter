import type { Metadata } from "next";
import Link from "next/link";
import { CareerBoard } from "@/components/CareerBoard";
import { listJobs } from "@/lib/jobs-data";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Careers · SkyHunter",
  description:
    "Join SkyHunter's team. We're hiring for HR and CoFounder roles to help us build AI-powered products and transform the industry.",
};

export default async function CareersPage() {
  const jobs = await listJobs();
  const careerJobs = jobs.filter(
    (j) =>
      j.status === "Hiring" || j.status === "Interviewing"
  );

  return (
    <section className="mx-auto max-w-4xl px-5 py-14">
      <div className="flex flex-col items-start justify-between gap-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-steel-line/80 bg-navy/50 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
            Careers
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
            Join the SkyHunter team
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-mist">
            We&apos;re building a product studio that creates AI-powered websites,
            agents, and LLM apps for startups and agencies. We&apos;re looking for
            passionate people to help us scale.
          </p>
        </div>
      </div>

      <div className="mt-12">
        {careerJobs.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold text-chrome mb-6">
              Open positions ({careerJobs.length})
            </h2>
            <CareerBoard jobs={careerJobs} />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-steel-line bg-navy/40 p-10 text-center">
            <p className="font-display text-xl text-chrome">No positions open right now.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-fog">
              Check back soon or reach out at support@skyhunterlab.online if you&apos;d like to
              connect.
            </p>
          </div>
        )}
      </div>

      <div className="mt-12 rounded-2xl border border-steel-line/70 bg-navy/40 p-8">
        <h3 className="font-display text-xl font-semibold text-chrome mb-3">
          Don&apos;t see your role?
        </h3>
        <p className="text-mist mb-6">
          We&apos;re always interested in hearing from talented people. Send us your
          resume and let&apos;s talk about how you might fit with our team.
        </p>
        <Link
          href="mailto:careers@skyhunterlab.online"
          className="inline-block rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
        >
          Send your resume
        </Link>
      </div>
    </section>
  );
}
