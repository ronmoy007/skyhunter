import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, Check, Spark, Shield } from "@/components/icons";
import { PROJECTS, getProject, CAT_STYLE } from "@/lib/portfolio";

export const dynamic = "force-static";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Case study · SkyHunter" };
  return {
    title: `${project.name} · SkyHunter`,
    description: project.summary,
    openGraph: {
      title: `${project.name} — ${project.tagline}`,
      description: project.summary,
      images: [{ url: `/portfolio/${project.slug}.jpg` }],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // Up to three "next" projects, wrapping around the list.
  const idx = PROJECTS.findIndex((p) => p.slug === project.slug);
  const next = [1, 2, 3].map((o) => PROJECTS[(idx + o) % PROJECTS.length]);

  const overview = [
    { k: "Client", v: project.client },
    { k: "Timeline", v: project.timeline },
    { k: "Our role", v: project.role },
    { k: "Platforms", v: project.platforms.join(", ") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-sky-art relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-5 pb-14 pt-12 sm:pt-16">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-semibold text-fog transition-colors hover:text-blue-300"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            All work
          </Link>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
            <div className="rise-in">
              <span
                className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                  CAT_STYLE[project.category] ?? "bg-steel text-fog"
                }`}
              >
                {project.category}
              </span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-chrome sm:text-5xl">
                {project.tagline}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-mist">
                {project.summary}
              </p>
              <div className="mt-8">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
                >
                  Start a project like this
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rise-in lift relative overflow-hidden rounded-2xl border border-steel-line bg-navy">
              <Image
                src={`/portfolio/${project.slug}.jpg`}
                alt={`${project.name} — ${project.tagline}`}
                width={1600}
                height={900}
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Overview bar */}
      <section className="border-y border-steel-line/60 bg-abyss">
        <dl className="mx-auto grid max-w-[1400px] grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4">
          {overview.map((o) => (
            <div key={o.k}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-fog">
                {o.k}
              </dt>
              <dd className="mt-1.5 font-display text-base font-semibold text-chrome">
                {o.v}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Overview / problem + highlights */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                Overview
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-chrome sm:text-4xl">
                {project.overviewTitle}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-mist">
                {project.overview}
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-2xl border border-steel-line/70 bg-navy p-6 sm:p-8">
              <h3 className="font-display text-lg font-semibold text-chrome">
                Highlights
              </h3>
              <ul className="mt-5 space-y-3.5">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-sm text-mist">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                    <span className="leading-snug">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Impact metrics */}
      <section className="bg-abyss py-16">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <p className="text-center font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
              Impact
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {project.metrics.map((m, i) => (
              <Reveal key={m.l} delay={i * 70}>
                <div className="rounded-2xl border border-steel-line/70 bg-navy p-6 text-center">
                  <p className="font-display text-4xl font-semibold text-chrome sm:text-5xl">
                    {m.n}
                  </p>
                  <p className="mt-2 text-sm leading-snug text-fog">{m.l}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge / Approach / Outcome */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { t: "The challenge", b: project.challenge, accent: false },
            { t: "Our approach", b: project.approach, accent: false },
            { t: "The outcome", b: project.outcome, accent: true },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 80} className="h-full">
              <div
                className={`flex h-full flex-col rounded-2xl border p-7 ${
                  c.accent
                    ? "border-blue-500/25 bg-blue-500/5"
                    : "border-steel-line/70 bg-navy"
                }`}
              >
                <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                  0{i + 1}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-chrome">
                  {c.t}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{c.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What we built */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <div className="max-w-2xl">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                What we built
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                The pieces that made it work
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {project.features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 70} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                    <Spark className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-chrome">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Under the hood + testimonial */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <Reveal>
            <div className="h-full rounded-2xl border border-steel-line/70 bg-navy p-7">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-chrome">
                <Shield className="h-5 w-5 text-blue-300" />
                Under the hood
              </h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-steel-line/70 bg-abyss px-3 py-1.5 text-xs font-semibold text-mist"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <figure className="flex h-full flex-col justify-center rounded-2xl border border-blue-500/25 bg-blue-500/5 p-8 sm:p-10">
              <blockquote className="font-display text-2xl font-medium leading-snug tracking-tight text-chrome sm:text-3xl">
                &ldquo;{project.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm font-semibold text-blue-300">
                {project.quoteBy}
                <span className="ml-2 font-normal text-fog">· {project.client}</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Next projects */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-chrome">
              More work
            </h2>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-colors hover:text-blue-400"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {next.map((p, i) => (
              <Reveal key={p.slug} delay={i * 70} className="h-full">
                <Link
                  href={`/portfolio/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-steel-line/70 bg-navy transition-colors hover:border-blue-500/50"
                >
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-steel-line/70 bg-abyss">
                    <Image
                      src={`/portfolio/${p.slug}.jpg`}
                      alt={`${p.name} — ${p.tagline}`}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-semibold text-chrome">
                        {p.name}
                      </h3>
                      <span
                        className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${
                          CAT_STYLE[p.category] ?? "bg-steel text-fog"
                        }`}
                      >
                        {p.category}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-blue-300">
                      {p.tagline}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="lift overflow-hidden rounded-2xl border border-steel-line bg-navy">
            <div className="bg-sky-art px-8 py-16 text-center sm:px-16">
              <h2 className="font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
                Have a build like this in mind?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-mist">
                Tell us what you&apos;re building — within one business day
                you&apos;ll have a suggested scope, a timeline, and a ballpark.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
                >
                  Start a project
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/book-a-call"
                  className="rounded-xl border border-steel-line px-8 py-3.5 font-semibold text-chrome transition-colors hover:border-blue-500/60"
                >
                  Book a call
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
