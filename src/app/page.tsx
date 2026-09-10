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
import { PROJECTS, CAT_STYLE } from "@/lib/portfolio";
import { SERVICES as SERVICE_ITEMS, type IconKey } from "@/lib/services";

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

// Three case studies to feature on the home page (AI, e-commerce, healthcare —
// mirroring the "e-commerce, healthcare & law" positioning).
const FEATURED = ["aptivo-ai", "retailhub", "medikind"]
  .map((slug) => PROJECTS.find((p) => p.slug === slug))
  .filter((p): p is (typeof PROJECTS)[number] => Boolean(p));

// A few real client quotes, drawn from the portfolio case studies.
const TESTIMONIALS = ["retailhub", "streamvue", "medikind"]
  .map((slug) => PROJECTS.find((p) => p.slug === slug))
  .filter((p): p is (typeof PROJECTS)[number] => Boolean(p));

// Static marketing home. Mirrors a modern software-studio layout: hero → stats
// → about/values → services → process → why-us → tech stack → industries → FAQ
// → contact.
export const revalidate = 600;

const STATS = [
  { n: "40+", l: "Products shipped" },
  { n: "98%", l: "Client retention" },
  { n: "6+", l: "Senior team" },
  { n: "5 yrs", l: "Shipping software" },
];

const VALUES = [
  {
    icon: Shield,
    title: "Reliable by default",
    body: "Evals, guardrails, and monitoring on every build — so what we ship keeps working as real users arrive.",
  },
  {
    icon: Spark,
    title: "Built for speed",
    body: "A senior team and battle-tested starters get you to a shippable v1 in weeks, not quarters.",
  },
  {
    icon: Laptop,
    title: "Modern technology",
    body: "The current best stack for AI and web — Claude, RAG, Next.js — chosen to fit your problem, not to impress.",
  },
];

const STEPS = [
  { n: "01", title: "Discover", body: "We scope your goal, users, and constraints, then agree a fixed scope and price." },
  { n: "02", title: "Design", body: "Architecture, data, and UX up front — model, retrieval, tools, and evals before glue code." },
  { n: "03", title: "Build", body: "Working software on a clear cadence — staging links, demos, and honest status." },
  { n: "04", title: "Launch & grow", body: "We ship, harden, and hand off — with an optional retainer to run and improve it." },
];

const WHY = [
  {
    title: "Expertise at your fingertips",
    body: "The people who scope your build are the ones who ship it — no handoffs to juniors.",
  },
  {
    title: "Tailored to your business",
    body: "Fixed scope shaped to your goals and budget, not a template forced onto your problem.",
  },
  {
    title: "Agile, transparent process",
    body: "Staging links and an honest cadence the whole way — you always know where the build stands.",
  },
];

const METRICS = [
  { n: "5 yrs", l: "Shipping software" },
  { n: "2×", l: "Faster delivery" },
  { n: "100%", l: "Code ownership" },
  { n: "24/7", l: "Monitoring & support" },
];

const INDUSTRIES = [
  { name: "E-commerce", slug: "ecommerce", body: "Storefronts plus shopping and support agents that lift conversion." },
  { name: "Healthcare", slug: "healthcare", body: "Patient portals plus guarded intake agents, built for compliance." },
  { name: "Law", slug: "law", body: "Firm sites plus client-intake and case-search agents with citations." },
  { name: "Startups & SaaS", slug: "startups", body: "MVPs, copilots, and LLM features that get you to launch fast." },
];

const FAQ = [
  {
    q: "What do you build?",
    a: "Websites and web apps, AI agents, LLM apps, RAG and search, and voice agents — from first spec to launched, with the option to run them after.",
  },
  {
    q: "How much does a project cost?",
    a: "Website builds start around $18k, AI agents around $8k, and LLM apps are custom. You get a fixed scope and a ballpark before we start.",
  },
  {
    q: "How long does it take?",
    a: "Most first versions ship in about three weeks from kickoff. Larger platforms are scoped in phases so you see working software early.",
  },
  {
    q: "Do you work with startups and small agencies?",
    a: "Yes — they're who we build for. We white-label for agencies and act as the product team for startups.",
  },
  {
    q: "Do you maintain what you build?",
    a: "If you want. An optional monthly retainer covers monitoring, evals, fixes, and new features after launch.",
  },
  {
    q: "Which industries do you know best?",
    a: "E-commerce, healthcare, and law, plus fast-moving startups and SaaS — the domains where compliance, trust, and conversion matter most.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — full-bleed background image (theme-aware), left-aligned copy */}
      <section className="relative overflow-hidden">
        {/* background image, swapped per theme; visual sits on the right */}
        <div className="theme-light-only absolute inset-0">
          <Image
            src="/Ads/home-light.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
        </div>
        <div className="theme-dark-only absolute inset-0">
          <Image
            src="/Ads/home-dark.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
        </div>
        {/* readability scrim — heavier on the left where the copy sits */}
        <div className="hero-scrim pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-[1400px] px-5 py-28 sm:py-36 lg:py-44">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-steel-line bg-void/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Product &amp; AI studio
            </span>

            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-chrome sm:text-6xl md:text-7xl">
              Empowering the future of your product with{" "}
              <span className="sky-text">software that ships</span>.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-mist">
              We design and build websites, AI agents, and LLM apps for startups and
              agencies — a senior team that turns complex ideas into reliable
              products, fast.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/start"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
              >
                Ready to grow? Let&apos;s talk 🚀
              </Link>
              <Link
                href="/services"
                className="rounded-lg border border-steel-line bg-void/60 px-7 py-3.5 font-semibold text-chrome transition-colors hover:bg-abyss"
              >
                Explore services
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-fog">
              <span>40+ products shipped</span>
              <span className="hidden h-4 w-px bg-steel-line sm:block" />
              <span>98% client retention</span>
              <span className="hidden h-4 w-px bg-steel-line sm:block" />
              <span>Trusted by startups &amp; agencies</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-steel-line/60 bg-abyss">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 px-5 py-12 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-display text-4xl font-semibold text-chrome">
                {s.n}
              </p>
              <p className="mt-1 text-sm text-fog">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About / value props */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
              Who we are
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
              A trusted product partner, built for momentum
            </h2>
            <p className="mt-4 text-lg text-mist">
              We&apos;re a small, senior team that scopes, builds, and ships — and
              stays to run what we launch. No agencies-of-agencies, no juniors
              learning on your budget.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 80} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-chrome">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 text-center">
            <Link
              href="/start"
              className="inline-flex items-center gap-2 rounded-lg border border-blue-500 px-6 py-3 font-semibold text-blue-300 transition-colors hover:bg-blue-500 hover:text-white"
            >
              Work with us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Services */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                Services
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                Everything you need to build &amp; ship
              </h2>
              <p className="mt-4 text-lg text-mist">
                One team, many specialties — from the marketing site to the AI
                inside your product.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_ITEMS.slice(0, 6).map((s, i) => {
              const Icon = SERVICE_ICONS[s.icon];
              return (
                <Reveal key={s.slug} delay={(i % 3) * 70} className="h-full">
                  <Link
                    href={`/services/${s.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6 transition-colors hover:border-blue-500/50"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-xl font-semibold text-chrome">
                      {s.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">
                      {s.body}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {s.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-steel px-2 py-0.5 text-xs font-medium text-fog"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-colors group-hover:text-blue-400">
                      Explore service
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <div className="mt-10 text-center">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-lg border border-blue-500 px-6 py-3 font-semibold text-blue-300 transition-colors hover:bg-blue-500 hover:text-white"
              >
                See all services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured work */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                Featured work
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                Products we&apos;ve shipped
              </h2>
              <p className="mt-4 text-lg text-mist">
                A few of the builds we&apos;ve taken from first spec to running in
                production.
              </p>
            </div>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-colors hover:text-blue-400"
            >
              View all work
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((p, i) => (
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
                    <h3 className="font-display text-xl font-semibold text-chrome">
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
                  <p className="mt-1.5 font-display text-sm font-medium text-blue-300">
                    {p.tagline}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">
                    {p.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-colors group-hover:text-blue-400">
                    View case study
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                Client words
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                Teams we&apos;ve built with
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80} className="h-full">
                <figure className="flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-7">
                  <blockquote className="flex-1 font-display text-lg font-medium leading-snug tracking-tight text-chrome">
                    &ldquo;{p.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 border-t border-steel-line/70 pt-4 text-sm">
                    <span className="font-semibold text-blue-300">{p.quoteBy}</span>
                    <span className="mt-0.5 block text-fog">{p.client}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
              How we work
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
              A simple, proven path from idea to impact
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 80}>
              <div className="relative">
                <p className="font-display text-4xl font-semibold text-blue-500/25">
                  {step.n}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-chrome">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why choose */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <div className="max-w-2xl">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                Why SkyHunter
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                Quality and speed, without the trade-offs
              </h2>
              <p className="mt-4 text-lg text-mist">
                We combine the discipline of a senior product team with the pace
                startups actually need.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div className="grid gap-5 sm:grid-cols-3">
              {WHY.map((w, i) => (
                <Reveal key={w.title} delay={i * 70} className="h-full">
                  <div className="flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                      <Check className="h-4 w-4" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold text-chrome">
                      {w.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist">
                      {w.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-steel-line/70 bg-steel-line/70">
                {METRICS.map((m) => (
                  <div key={m.l} className="bg-navy p-6">
                    <p className="font-display text-3xl font-semibold text-chrome">
                      {m.n}
                    </p>
                    <p className="mt-1 text-sm text-fog">{m.l}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
              Industries
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
              Solutions across industries
            </h2>
            <p className="mt-4 text-lg text-mist">
              Years of cross-sector experience, in the domains where the details
              matter most.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRIES.map((ind, i) => (
            <Reveal key={ind.name} delay={i * 70} className="h-full">
              <Link
                href={`/industries#${ind.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy p-6 transition-colors hover:border-blue-500/50"
              >
                <h3 className="font-display text-lg font-semibold text-chrome">
                  {ind.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">
                  {ind.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-colors group-hover:text-blue-400">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                FAQ
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                Questions, answered
              </h2>
            </div>
          </Reveal>

          <div className="mx-auto mt-12 max-w-3xl divide-y divide-steel-line overflow-hidden rounded-2xl border border-steel-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group bg-navy/50 p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-chrome">
                  {f.q}
                  <span className="ml-4 text-fog transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-mist">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="lift overflow-hidden rounded-2xl border border-steel-line bg-navy">
            <div className="bg-sky-art px-8 py-16 text-center sm:px-16">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                Let&apos;s build it
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
                Ready to build something you&apos;ll be proud of?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-mist">
                Book a free consultation or send a brief. Within one business day
                you&apos;ll have a suggested scope, a timeline, and a ballpark.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
                >
                  Start a project
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/book-a-call"
                  className="rounded-lg border border-steel-line px-8 py-3.5 font-semibold text-chrome transition-colors hover:border-blue-500/60"
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
