import type { Metadata } from "next";
import Link from "next/link";
import { CareerBoard } from "@/components/CareerBoard";
import { listJobs } from "@/lib/jobs-data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Careers · SkyHunter",
  description:
    "Join SkyHunter's team. We're hiring for CoFounder, Recruiter, and Agent Build Partner roles to help us build AI-powered products and transform the industry.",
  openGraph: {
    title: "Careers at SkyHunter",
    description: "Join a team building the future of AI-powered products",
    url: `${SITE_URL}/career`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "SkyHunter",
      },
    ],
  },
};

export default async function CareersPage() {
  const jobs = await listJobs();
  const careerJobs = jobs.filter(
    (j) =>
      j.status === "Hiring" || j.status === "Interviewing"
  );

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SkyHunter",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "A product & AI studio building e-commerce, healthcare, and law websites, AI agents, and LLM apps",
    sameAs: [
      "https://www.linkedin.com/company/skyhunter-lab",
    ],
  };

  const jobsSchemaList = careerJobs.map((job) => ({
    "@type": "JobPosting",
    title: job.title,
    description: job.summary,
    datePosted: new Date(
      Date.now() - (job.postedDaysAgo || 0) * 86400000
    ).toISOString(),
    validThrough: new Date(Date.now() + 90 * 86400000).toISOString(),
    employmentType: job.type,
    hiringOrganization: {
      "@type": "Organization",
      name: "SkyHunter",
      url: SITE_URL,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "Worldwide",
      },
    },
    url: `${SITE_URL}/career/${job.id}`,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Careers",
                item: `${SITE_URL}/career`,
              },
            ],
          }),
        }}
      />
      {jobsSchemaList.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: jobsSchemaList,
            }),
          }}
        />
      )}
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
    </>
  );
}
