import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import {
  ArrowRight,
  Laptop,
  Spark,
  Book,
  Compass,
  Users,
  Shield,
  Lifebuoy,
  Check,
} from "@/components/icons";
import { SERVICES, getService, type IconKey } from "@/lib/services";

export const dynamic = "force-static";

const SERVICE_ICONS: Record<IconKey, (p: { className?: string }) => React.ReactElement> = {
  Laptop,
  Spark,
  Book,
  Compass,
  Users,
  Shield,
  Lifebuoy,
};

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service · SkyHunter" };
  return {
    title: `${service.name} · SkyHunter`,
    description: service.summary,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const Icon = SERVICE_ICONS[service.icon];

  // Up to three "related" services, wrapping around the list.
  const idx = SERVICES.findIndex((s) => s.slug === service.slug);
  const related = [1, 2, 3].map((o) => SERVICES[(idx + o) % SERVICES.length]);

  // Per-service hero art is opt-in (set `heroImage` on the service); otherwise
  // fall back to the shared service banner. Drop /Ads/services/<slug>-{light,dark}.png
  // and point heroImage at them to give a service its own image.
  const hero = service.heroImage ?? {
    light: "/Ads/service-light.png",
    dark: "/Ads/service-dark.png",
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-sky-art relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-12 sm:pt-16">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-fog transition-colors hover:text-blue-300"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            All services
          </Link>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_0.92fr] lg:gap-14">
            <div className="max-w-2xl rise-in">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                <Icon className="h-7 w-7" />
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-chrome sm:text-5xl">
                {service.name}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mist">
                {service.summary}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
                >
                  Start a project
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/book-a-call"
                  className="rounded-xl border border-steel-line px-7 py-3.5 font-semibold text-chrome transition-colors hover:border-blue-500/60"
                >
                  Book a call
                </Link>
                <span className="rounded-md bg-cyan/10 px-3 py-1.5 text-sm font-semibold text-cyan ring-1 ring-cyan/30">
                  {service.price}
                </span>
              </div>
            </div>

            {/* Theme-aware hero visual */}
            <div className="rise-in relative hidden lg:block">
              <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-blue-500/10 blur-3xl" />
              <div className="theme-light-only lift relative overflow-hidden rounded-2xl border border-steel-line bg-navy">
                <Image
                  src={hero.light}
                  alt={`${service.name} — SkyHunter service`}
                  width={1672}
                  height={941}
                  priority
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="h-auto w-full"
                />
              </div>
              <div className="theme-dark-only lift relative overflow-hidden rounded-2xl border border-steel-line bg-navy">
                <Image
                  src={hero.dark}
                  alt={`${service.name} — SkyHunter service`}
                  width={1672}
                  height={941}
                  priority
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview + benefit pillars */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Reveal>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                Overview
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-chrome sm:text-4xl">
                {service.overviewTitle}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-mist">
                {service.overview}
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="grid gap-4 sm:grid-cols-2">
              {service.benefits.map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-steel-line/70 bg-navy p-5"
                >
                  <h3 className="font-display text-base font-semibold text-chrome">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fog">{b.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* What you get + Built with */}
      <section className="bg-abyss py-20">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <Reveal>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                What you get
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-chrome">
                Tangible deliverables
              </h2>
              <ul className="mt-6 space-y-3.5">
                {service.deliverables.map((d) => (
                  <li key={d} className="flex gap-3 text-mist">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                    <span className="leading-snug">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-2xl border border-steel-line/70 bg-navy p-7">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-chrome">
                <Shield className="h-5 w-5 text-blue-300" />
                Built with
              </h3>
              <div className="mt-5 space-y-5">
                {service.stackGroups.map((g) => (
                  <div key={g.label}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-fog">
                      {g.label}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {g.items.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-steel-line/70 bg-abyss px-3 py-1.5 text-xs font-semibold text-mist"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Our approach */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="max-w-2xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
              Our approach
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
              How the work goes
            </h2>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {service.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 80}>
              <div className="h-full rounded-2xl border border-steel-line/70 bg-navy p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                    <Spark className="h-5 w-5" />
                  </span>
                  <span className="font-display text-2xl font-semibold text-steel-line">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-chrome">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Where it fits + FAQ */}
      <section className="bg-abyss py-20">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                Where it fits
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-chrome">
                Common use cases
              </h2>
              <ul className="mt-6 space-y-3">
                {service.useCases.map((u) => (
                  <li key={u} className="flex gap-3 text-mist">
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-blue-300" />
                    <span className="leading-snug">{u}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                FAQ
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-chrome">
                Frequently asked
              </h2>
              <dl className="mt-6 space-y-4">
                {service.faq.map((f) => (
                  <div
                    key={f.q}
                    className="rounded-2xl border border-steel-line/70 bg-navy p-6"
                  >
                    <dt className="font-display text-base font-semibold text-chrome">
                      {f.q}
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed text-mist">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related services */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-chrome">
            Related services
          </h2>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-colors hover:text-blue-400"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((s, i) => {
            const RelIcon = SERVICE_ICONS[s.icon];
            return (
              <Reveal key={s.slug} delay={i * 70} className="h-full">
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6 transition-colors hover:border-blue-500/50"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                    <RelIcon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-chrome">
                    {s.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">
                    {s.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-colors group-hover:text-blue-400">
                    Explore service
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-[1400px] px-5 pb-20">
        <Reveal>
          <div className="lift overflow-hidden rounded-2xl border border-steel-line bg-navy">
            <div className="bg-sky-art px-8 py-16 text-center sm:px-16">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-chrome sm:text-4xl">
                Ready to start your {service.name.toLowerCase()} project?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-mist">
                Send a short brief or book a call. Within one business day
                you&apos;ll have a suggested scope, a timeline, and a ballpark —
                no obligation.
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
