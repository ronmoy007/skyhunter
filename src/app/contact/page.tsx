import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Compass,
  Spark,
} from "@/components/icons";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Contact · SkyHunter",
  description:
    "Talk to the SkyHunter studio. Start a project, book a call, or email us — plus answers to the questions clients ask before we build.",
};

const eyebrow =
  "font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300";

const FAQ: { q: string; a: string }[] = [
  {
    q: "What do you build?",
    a: "Product and AI, end to end. Marketing and commerce sites for e-commerce, healthcare, and law; AI agents and LLM apps; RAG and semantic search over your documents; and voice agents. If it ships to real users, we build it.",
  },
  {
    q: "How much does it cost?",
    a: "It depends on scope, but we quote a fixed price up front after a short discovery call — no open-ended hourly billing. Most first builds land in a clear range you'll know before you commit, with optional retainers for ongoing work.",
  },
  {
    q: "How long does it take?",
    a: "Most first versions ship in six to eight weeks. We work in the open with staging links and demos on a steady cadence, so you see progress every week instead of waiting for a big reveal at the end.",
  },
  {
    q: "Do you work with startups and small agencies?",
    a: "Yes — that's our core clientele. We're a senior team that plugs in as your product and AI shop, whether you're a founder shipping a first product or an agency that needs AI builds delivered for your own clients.",
  },
  {
    q: "Do you maintain what you build?",
    a: "We can. Every build ships with a clean handoff, and you can add a retainer to monitor, evaluate, and improve it as real usage comes in — especially valuable for AI systems that need ongoing evals and tuning.",
  },
  {
    q: "Which industries do you work in?",
    a: "We've shipped for e-commerce, healthcare, and law, and we're comfortable anywhere the work demands real guardrails, clean UX, and production-grade AI. If you're unsure whether your domain fits, book a call and we'll tell you straight.",
  },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-14">
      {/* Hero */}
      <div className="max-w-2xl">
        <p className={eyebrow}>Contact</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
          Let&apos;s <span className="sky-text">talk</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          Tell us what you&apos;re trying to build. Whether you have a tight spec
          or a rough idea, the fastest way to get moving is to start a project or
          book a call — a senior team will be on the other end.
        </p>
      </div>

      {/* Two primary cards */}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Reveal>
          <Link
            href="/start"
            className="group flex h-full flex-col rounded-2xl border border-blue-500/40 bg-blue-500/5 p-7 transition-all hover:-translate-y-1 hover:border-blue-500/60"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
              <Spark className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-chrome">
              Start a project
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">
              Share your goal, timeline, and constraints. We&apos;ll come back
              with a scope, a fixed price, and a plan to ship.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300">
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </Reveal>

        <Reveal delay={90}>
          <Link
            href="/book-a-call"
            className="group flex h-full flex-col rounded-2xl border border-steel-line/70 bg-navy/60 p-7 transition-all hover:-translate-y-1 hover:border-blue-500/50"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
              <Calendar className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-chrome">
              Book a call
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">
              Prefer to talk it through first? Grab a slot and we&apos;ll dig
              into what you need and whether we&apos;re the right team to build
              it.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300">
              Find a time
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </Reveal>
      </div>

      {/* Email */}
      <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-steel-line bg-navy/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl font-bold text-chrome">
            Rather just email?
          </p>
          <p className="mt-1 text-sm text-mist">
            Write to us directly and we&apos;ll get back to you within a business
            day.
          </p>
        </div>
        <a
          href="mailto:support@skyhunterlab.online"
          className="shrink-0 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
        >
          support@skyhunterlab.online
        </a>
      </div>

      {/* FAQ */}
      <div className="mt-14">
        <div className="flex items-center gap-3">
          <Compass className="h-5 w-5 text-blue-300" />
          <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
            Questions clients ask
          </h2>
        </div>
        <div className="mt-6 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-steel-line/70 bg-navy/60 p-5 open:bg-navy/80"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-chrome">
                {item.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-fog transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-mist">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Closing CTA */}
      <div className="lift mt-14 rounded-2xl border border-steel-line bg-navy px-8 py-12 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-chrome">
          Ready when you are
        </h2>
        <p className="mx-auto mt-3 max-w-md text-mist">
          The best projects start with a conversation. Tell us what you want to
          ship and we&apos;ll take it from there.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/start"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
          >
            Start a project
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/book-a-call"
            className="inline-flex items-center gap-2 rounded-lg border border-steel-line px-7 py-3.5 font-semibold text-chrome transition-colors hover:border-blue-500/50"
          >
            <Calendar className="h-4 w-4" />
            Book a call
          </Link>
        </div>
      </div>
    </section>
  );
}
