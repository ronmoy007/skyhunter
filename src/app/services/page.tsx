import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
import { SERVICES, type IconKey } from "@/lib/services";

export const dynamic = "force-static";

// Resolve a service's icon key to its component.
const SERVICE_ICONS: Record<IconKey, (p: { className?: string }) => React.ReactElement> = {
  Laptop,
  Spark,
  Book,
  Compass,
  Users,
  Shield,
  Lifebuoy,
};

export const metadata: Metadata = {
  title: "Services · SkyHunter",
  description:
    "SkyHunter is a product & AI studio. We build e-commerce, healthcare, and law websites, AI agents, LLM apps, RAG & search, voice agents, and evals — from spec to launch, with a team to run it after.",
};

const REASSURANCE = [
  {
    icon: Check,
    title: "Fixed scope, honest pricing",
    body: "You get a written scope, a timeline, and a ballpark before we start — no open-ended hourly meters.",
  },
  {
    icon: Users,
    title: "One senior team",
    body: "The people who scope your build are the ones who ship it. No handoffs to juniors, no offshore surprises.",
  },
  {
    icon: Shield,
    title: "Evals on every AI build",
    body: "Every agent, copilot, and RAG system ships with evals and guardrails, so it stays right as it scales.",
  },
  {
    icon: Lifebuoy,
    title: "Optional retainer",
    body: "Launch is a milestone, not the end. Keep us on to run, monitor, and grow what we built together.",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-sky-art relative overflow-hidden">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 pb-16 pt-20 sm:pt-24 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div className="rise-in">
            <span className="inline-flex items-center gap-2.5 font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
              <span className="h-px w-6 bg-blue-400/60" />
              Services
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-chrome sm:text-6xl">
              Everything you need to <span className="sky-text">build and ship</span> it.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">
              SkyHunter is a product &amp; AI studio for startups and small
              agencies. Pick a build below or bring your own brief — we scope it,
              build it, and hand you working software with a team to run it after.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/start"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
              >
                Start a project
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/book-a-call"
                className="rounded-xl border border-steel-line px-6 py-3.5 font-semibold text-chrome transition-colors hover:border-blue-500/60"
              >
                Book a call
              </Link>
            </div>
          </div>

          {/* On-purpose visual: our services as a constellation of glass tiles —
              a theme-matched hero image (light sky / dark night). */}
          <div className="rise-in relative hidden lg:block">
            <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-blue-500/10 blur-3xl" />

            <div className="theme-light-only lift relative overflow-hidden rounded-2xl border border-steel-line bg-navy">
              <Image
                src="/Ads/service-light.png"
                alt="SkyHunter services — websites, AI agents, LLM apps, RAG & search, voice agents, and evals, floating as glass tiles above the clouds"
                width={1672}
                height={941}
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="h-auto w-full"
              />
            </div>

            <div className="theme-dark-only lift relative overflow-hidden rounded-2xl border border-steel-line bg-navy">
              <Image
                src="/Ads/service-dark.png"
                alt="SkyHunter services — websites, AI agents, LLM apps, RAG & search, voice agents, and evals, floating as glass tiles in a night sky"
                width={1672}
                height={941}
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-end lg:gap-14">
            <div className="max-w-2xl">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                What we build
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                Clear scope, senior build, shipped
              </h2>
              <p className="mt-3 text-lg text-mist">
                Every engagement has a defined scope and a real deliverable. Prices
                below are starting ranges — the exact number depends on your build.
              </p>
            </div>

            {/* Pricing note — fills the right column and explains the ranges */}
            <div className="rounded-2xl border border-steel-line/70 bg-navy p-6 sm:p-7">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold text-chrome">
                <Spark className="h-4 w-4 text-blue-300" />
                How pricing works
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-snug text-mist">
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>Fixed scope, quoted upfront — no open-ended hourly meters.</span>
                </li>
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>The ranges below are starting points; your final price fits your build.</span>
                </li>
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>Book a call and get a tailored estimate within one business day.</span>
                </li>
              </ul>
              <Link
                href="/book-a-call"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-colors hover:text-blue-400"
              >
                Get an estimate
                <ArrowRight className="h-4 w-4 transition-transform hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = SERVICE_ICONS[s.icon];
            return (
              <Reveal key={s.slug} delay={i * 70} className="h-full">
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6 transition-colors hover:border-blue-500/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-md bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan ring-1 ring-cyan/30">
                      {s.price}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-chrome">
                    {s.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{s.body}</p>
                  <ul className="mt-4 space-y-2 border-t border-steel-line/70 pt-4">
                    {s.deliverables.map((d) => (
                      <li
                        key={d}
                        className="flex gap-2.5 text-sm leading-snug text-fog"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-colors group-hover:text-blue-400">
                    Explore service
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* What you get */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <div className="max-w-2xl">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                What you get
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                How our engagements work
              </h2>
              <p className="mt-3 text-lg text-mist">
                No surprises, no scope creep, no juniors learning on your budget.
                Here&apos;s what every SkyHunter build comes with.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {REASSURANCE.map((r, i) => (
              <Reveal key={r.title} delay={i * 70} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                    <r.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-chrome">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">
                    {r.body}
                  </p>
                </div>
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
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                Let&apos;s build it
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
                Tell us what you&apos;re building.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-mist">
                Send a short brief or book a call. Within one business day
                you&apos;ll have a suggested scope, a timeline, and a ballpark
                price — no obligation.
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
