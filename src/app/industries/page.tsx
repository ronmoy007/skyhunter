import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Wordmark } from "@/components/Wordmark";
import {
  ArrowRight,
  Spark,
  Shield,
  Book,
  Briefcase,
  Check,
  Compass,
  Calendar,
} from "@/components/icons";

// Public marketing page — no auth, no cookies. Rendered fully static.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Industries · SkyHunter",
  description:
    "SkyHunter is a product & AI studio that builds websites, AI agents, and LLM apps for e-commerce, healthcare, law, and startups. See how we go deep in each field.",
};

type Industry = {
  key: string;
  name: string;
  icon: (p: { className?: string }) => React.ReactElement;
  tag: string;
  headline: string;
  intro: string;
  builds: string[];
  hardTitle: string;
  hard: string;
  exampleTitle: string;
  example: string;
  cta: string;
};

const INDUSTRIES: Industry[] = [
  {
    key: "ecommerce",
    name: "E-commerce",
    icon: Briefcase,
    tag: "Conversion & catalog scale",
    headline: "Storefronts that convert and agents that sell",
    intro:
      "We build fast, high-converting storefronts and the AI on top of them — assistants that know your catalog, recover carts, and turn browsers into buyers.",
    builds: [
      "Headless storefronts (Next.js) built for Core Web Vitals",
      "Product-aware shopping assistant with real inventory & pricing",
      "Semantic search & merchandising over messy catalogs",
      "Post-purchase & support agents wired to your OMS",
    ],
    hardTitle: "Why it's hard",
    hard: "Catalogs are enormous, dirty, and always changing. An assistant that hallucinates a price, a size, or a stock level costs you the sale and the trust. We ground every answer in your live data and design for scale, not a demo.",
    exampleTitle: "Example build",
    example:
      "A 40k-SKU retailer wanted a store concierge. We shipped a RAG search layer over their product feed plus a chat agent that checks live stock before it ever recommends — cart-add rate up, support tickets down.",
    cta: "Start a project",
  },
  {
    key: "healthcare",
    name: "Healthcare",
    icon: Shield,
    tag: "Compliance & guardrails",
    headline: "Trustworthy patient experiences, safely built",
    intro:
      "We build clinic and health-tech websites plus AI agents that triage, schedule, and answer questions — with guardrails that keep them inside the lines.",
    builds: [
      "HIPAA-minded marketing & patient-portal front ends",
      "Intake, triage, and scheduling agents with escalation paths",
      "Document & policy assistants grounded in your protocols",
      "Human-in-the-loop review on anything clinical",
    ],
    hardTitle: "Why it's hard",
    hard: "Healthcare punishes ambiguity. An agent can't guess at dosages, diagnose, or leak PHI. We build strict guardrails, refusal behavior, audit trails, and escalation to a human the moment a query crosses a line.",
    exampleTitle: "Example build",
    example:
      "A multi-site clinic needed after-hours coverage. We shipped a triage assistant that gathers symptoms, routes urgent cases to on-call staff, books the rest — and never gives medical advice it isn't cleared to give.",
    cta: "Talk to us",
  },
  {
    key: "law",
    name: "Law / Legal",
    icon: Book,
    tag: "Citations & confidentiality",
    headline: "Legal tools that cite their work",
    intro:
      "We build firm websites and legal AI that drafts, searches, and summarizes — every claim traceable to a source, every matter kept confidential.",
    builds: [
      "Firm & practice-area sites that win qualified leads",
      "Contract & document review agents with clause-level citations",
      "Case & statute search over your document set",
      "Intake agents that qualify matters before they reach an attorney",
    ],
    hardTitle: "Why it's hard",
    hard: "In law, an uncited or invented answer is malpractice waiting to happen. Every output must point back to a real source, confidentiality is non-negotiable, and nothing leaves the boundary you set. We build for verifiability first.",
    exampleTitle: "Example build",
    example:
      "A boutique firm drowned in NDA review. We shipped a review agent that flags non-standard clauses and links each to the exact paragraph — cutting first-pass review from hours to minutes, with an attorney always signing off.",
    cta: "Start a project",
  },
  {
    key: "startups",
    name: "Startups & SaaS",
    icon: Spark,
    tag: "Speed to launch",
    headline: "From idea to shipped product, fast",
    intro:
      "We build the whole thing — marketing site, product, and the AI features that make it worth talking about — at the pace a startup actually needs.",
    builds: [
      "Marketing sites and product MVPs that ship in weeks",
      "AI features baked into your core product, not bolted on",
      "RAG, search, and voice agents as first-class features",
      "Infrastructure that survives your first real users",
    ],
    hardTitle: "Why it's hard",
    hard: "Startups win on speed, but speed usually means shortcuts you pay for later. We move fast without shipping a mess — clear scope, production-grade foundations, and AI that keeps working after launch day.",
    exampleTitle: "Example build",
    example:
      "A seed-stage founder had a deck and a deadline. We shipped a working product with an AI onboarding agent and semantic search in six weeks — in time for their demo day and their first paying customers.",
    cta: "Start a project",
  },
];

const PROCESS = [
  {
    icon: Compass,
    title: "Discovery",
    body: "We learn your domain, users, and constraints — then map exactly what to build and what to leave out.",
  },
  {
    icon: Check,
    title: "Fixed scope",
    body: "A clear scope, price, and timeline before we write a line of code. No surprise invoices.",
  },
  {
    icon: Spark,
    title: "Build in the open",
    body: "You see progress every week in a shared space. Feedback lands early, not at the end.",
  },
  {
    icon: Calendar,
    title: "Ship & run",
    body: "We launch, monitor, and keep it healthy — AI included — long after go-live.",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
      <span className="h-px w-6 bg-blue-400/60" />
      {children}
    </span>
  );
}

export default function IndustriesPage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="bg-sky-art relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-20 sm:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="max-w-3xl rise-in">
              <Eyebrow>Industries</Eyebrow>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-chrome sm:text-6xl">
                We go deep where the{" "}
                <span className="sky-text">details matter</span>
              </h1>
              <p className="mt-5 max-w-2xl text-xl font-medium text-mist">
                Compliance, trust, and conversion don&apos;t mean the same thing in
                a clinic, a courtroom, and a checkout.
              </p>
              <p className="mt-4 max-w-2xl leading-relaxed text-mist">
                <Wordmark /> is a product &amp; AI studio. We build the websites,
                AI agents, and LLM apps our clients ship — and we go deep in a
                handful of fields so the guardrails, citations, and edge cases are
                handled before they ever reach your users.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
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
              </div>
            </div>

            {/* Theme-aware hero visual: e-commerce, healthcare & law as glass pillars */}
            <div className="rise-in relative hidden lg:block">
              <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-blue-500/10 blur-3xl" />
              <div className="theme-light-only lift relative overflow-hidden rounded-2xl border border-steel-line bg-navy">
                <Image
                  src="/Ads/industry-light.png"
                  alt="E-commerce, healthcare, and law represented as glowing glass pillars"
                  width={1672}
                  height={941}
                  priority
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="h-auto w-full"
                />
              </div>
              <div className="theme-dark-only lift relative overflow-hidden rounded-2xl border border-steel-line bg-navy">
                <Image
                  src="/Ads/industry-dark.png"
                  alt="E-commerce, healthcare, and law represented as glowing glass pillars"
                  width={1672}
                  height={941}
                  priority
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>

          {/* quick industry nav */}
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              return (
                <a
                  key={ind.key}
                  href={`#${ind.key}`}
                  className="group flex items-center gap-3 rounded-2xl border border-steel-line/70 bg-navy/60 p-4 transition-colors hover:border-blue-500/60"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-display text-base font-semibold text-chrome">
                      {ind.name}
                    </span>
                    <span className="block text-xs text-fog">{ind.tag}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
        <div className="streak mx-auto max-w-[1400px] px-5" />
      </section>

      {/* 2. Deep-dive industry sections */}
      {INDUSTRIES.map((ind, i) => {
        const Icon = ind.icon;
        const alt = i % 2 === 1;
        return (
          <section
            key={ind.key}
            id={ind.key}
            className={`scroll-mt-24 ${alt ? "bg-abyss" : ""}`}
          >
            <div className="mx-auto max-w-[1400px] px-5 py-20">
              <Reveal>
                <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                  {/* Left: identity */}
                  <div>
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                      <Icon className="h-7 w-7" />
                    </span>
                    <div className="mt-5">
                      <Eyebrow>{ind.name}</Eyebrow>
                    </div>
                    <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-chrome sm:text-4xl">
                      {ind.headline}
                    </h2>
                    <p className="mt-4 leading-relaxed text-mist">{ind.intro}</p>
                    <span className="mt-6 inline-flex items-center gap-2 rounded-md bg-cyan/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan ring-1 ring-cyan/25">
                      {ind.tag}
                    </span>
                    <div className="mt-8">
                      <Link
                        href="/start"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
                      >
                        {ind.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Right: details */}
                  <div className="space-y-5">
                    {/* What we build */}
                    <div className="rounded-2xl border border-steel-line/70 bg-navy p-6">
                      <h3 className="font-display text-lg font-semibold text-chrome">
                        What we build for you
                      </h3>
                      <ul className="mt-4 space-y-2.5">
                        {ind.builds.map((b) => (
                          <li key={b} className="flex gap-3 text-sm text-mist">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                            <span className="leading-snug">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Why hard */}
                      <div className="rounded-2xl border border-steel-line/70 bg-navy/60 p-6">
                        <h3 className="flex items-center gap-2 font-display text-base font-semibold text-chrome">
                          <Shield className="h-4 w-4 text-blue-300" />
                          {ind.hardTitle}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-fog">
                          {ind.hard}
                        </p>
                      </div>

                      {/* Example */}
                      <div className="rounded-2xl border border-blue-500/25 bg-blue-500/5 p-6">
                        <h3 className="flex items-center gap-2 font-display text-base font-semibold text-chrome">
                          <Spark className="h-4 w-4 text-blue-300" />
                          {ind.exampleTitle}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-mist">
                          {ind.example}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* 3. How we work with you */}
      <section className="bg-abyss py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <Reveal>
            <div className="max-w-2xl">
              <Eyebrow>How we work with you</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome">
                No mystery, no runaway scope
              </h2>
              <p className="mt-3 text-lg text-mist">
                The same four steps whatever we&apos;re building — so you always
                know where the project stands.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={i * 80}>
                  <div className="h-full rounded-2xl border border-steel-line/70 bg-navy p-6">
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-display text-2xl font-semibold text-steel-line">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-chrome">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Closing CTA */}
      <section className="mx-auto max-w-[1400px] px-5 py-20">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-steel-line bg-navy">
            <div className="bg-sky-art px-8 py-16 text-center sm:px-16">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-chrome sm:text-4xl">
                Tell us what you&apos;re building
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-mist">
                Whatever field you&apos;re in, we&apos;ve probably shipped its
                hardest edge cases before. Bring us the problem — we&apos;ll scope
                the build.
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
