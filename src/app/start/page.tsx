import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { Check } from "@/components/icons";

export const metadata: Metadata = {
  title: "Start a project · SkyHunter",
  description:
    "Tell us what you want to build — an e-commerce, healthcare, or law website, an AI agent, or an LLM app. We'll reply within one business day with a suggested scope.",
};

export const dynamic = "force-static";

const STEPS = [
  {
    title: "Send your brief",
    body: "Fill in the short form. A rough idea is plenty — we'll help shape the rest.",
  },
  {
    title: "We reply in a day",
    body: "Within one business day you get a suggested scope, a ballpark, and a timeline.",
  },
  {
    title: "Kickoff call",
    body: "We align on goals and constraints, then map the fastest path to a shippable v1.",
  },
  {
    title: "We build & ship",
    body: "You get working software on a clear cadence — with the team to run it after launch.",
  },
];

const REASSURE = [
  "Fixed scope and a clear price before we start — no surprise invoices",
  "A senior team that has shipped agents and sites to real users",
  "Evals and guardrails on every AI build, not an afterthought",
  "Optional retainer to run, monitor, and improve it after launch",
];

export default function StartProjectPage() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-14">
      <div className="max-w-3xl">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
          Start a project
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
          Tell us what you want to <span className="sky-text">build</span>.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          Websites, AI agents, or LLM apps for e-commerce, healthcare, law, and
          fast-moving startups. Send a short brief and we&apos;ll come back within
          one business day with a suggested scope, a ballpark, and a timeline.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* Left: the details */}
        <div className="space-y-12">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
              What happens next
            </h2>
            <ol className="mt-6 space-y-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 font-display text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-chrome">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-mist">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-steel-line bg-abyss p-6">
            <h2 className="font-display text-xl font-semibold tracking-tight text-chrome">
              Why teams pick SkyHunter
            </h2>
            <ul className="mt-4 space-y-3">
              {REASSURE.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm text-mist">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                    <Check className="h-3 w-3" />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-fog">
              Prefer to talk first?{" "}
              <Link href="/book-a-call" className="font-medium text-blue-300 hover:text-blue-400">
                Book a free consultation call →
              </Link>
            </p>
          </div>
        </div>

        {/* Right: the brief form (sticky on desktop) */}
        <div>
          <div className="lg:sticky lg:top-28">
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
              <h2 className="font-display text-xl font-semibold tracking-tight text-chrome">
                Project brief
              </h2>
              <p className="mt-1 text-sm text-fog">
                Takes about two minutes. Everything except the essentials is
                optional.
              </p>
              <div className="mt-5">
                <LeadForm />
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-fog">
              Or email us at{" "}
              <a
                href="mailto:support@skyhunterlab.online"
                className="font-medium text-blue-300 hover:text-blue-400"
              >
                support@skyhunterlab.online
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
