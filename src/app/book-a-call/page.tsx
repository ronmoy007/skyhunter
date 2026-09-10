import type { Metadata } from "next";
import Link from "next/link";
import { InterviewForm } from "@/components/InterviewForm";
import { Check, Book, Users, Shield, Lifebuoy } from "@/components/icons";

export const metadata: Metadata = {
  title: "Book a call · SkyHunter",
  description:
    "Book a short, free consultation with the SkyHunter studio to scope your website, AI agent, or LLM app — the approach, the stack, a timeline, and a ballpark.",
};

export const dynamic = "force-static";

const FACTS = [
  { icon: "book", label: "Length", value: "About 25 minutes" },
  { icon: "users", label: "Format", value: "Video call" },
  { icon: "shield", label: "Cost", value: "Free — no obligation" },
  { icon: "lifebuoy", label: "You'll meet", value: "A SkyHunter engineer" },
];

const ICONS: Record<string, (p: { className?: string }) => React.ReactElement> = {
  book: Book,
  users: Users,
  shield: Shield,
  lifebuoy: Lifebuoy,
};

const STEPS = [
  {
    title: "Request your call",
    body: "Pick a date and time window below. It takes under a minute.",
  },
  {
    title: "We confirm by email",
    body: "Within one business day we email a confirmed time, a calendar invite, and a video-call link.",
  },
  {
    title: "Join the call",
    body: "Meet a SkyHunter engineer. We map out your build — the use case, the stack, and a realistic scope.",
  },
  {
    title: "Leave with a plan",
    body: "You walk away with a concrete next step: an architecture sketch, a timeline, and a ballpark you can plan around.",
  },
];

const AGENDA = [
  "The problem you're solving and who it's for",
  "The right scope for a first version — and what to cut",
  "A stack that fits: framework, model, tooling, and evals",
  "A realistic timeline and a ballpark budget",
  "Any questions or blockers you're hitting — this is your call too",
];

const FAQ = [
  {
    q: "What is this call for?",
    a: "It's a short, practical scoping session with a SkyHunter engineer to help shape your website, AI agent, or LLM app — the approach, the stack, a realistic timeline, and a ballpark. You leave with a plan, not a hard sell.",
  },
  {
    q: "Do I need everything figured out first?",
    a: "No. Bring a rough idea or a problem and we'll help you shape it into a buildable scope. Half-formed ideas are welcome.",
  },
  {
    q: "Does it cost anything?",
    a: "No. The consultation is free and there's no obligation to work with us afterward.",
  },
  {
    q: "What if the time doesn't work?",
    a: "Every confirmation email includes a link to reschedule. Pick whatever works — mornings, evenings, weekends included where available.",
  },
];

export default function BookACallPage() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-14">
      {/* Hero */}
      <div className="max-w-3xl">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
          Book a call
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
          Scope your build with a{" "}
          <span className="sky-text">SkyHunter engineer</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          Book a short, free consultation. We&apos;ll help you scope the website,
          AI agent, or LLM app you have in mind — the approach, the stack, a
          realistic timeline, and a ballpark — so you can plan with confidence.
        </p>
      </div>

      {/* Quick facts */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FACTS.map((f) => {
          const Icon = ICONS[f.icon];
          return (
            <div
              key={f.label}
              className="rounded-2xl border border-steel-line bg-navy p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                {Icon && <Icon className="h-5 w-5" />}
              </span>
              <p className="mt-3 text-xs uppercase tracking-wider text-fog">
                {f.label}
              </p>
              <p className="mt-0.5 font-semibold text-chrome">{f.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* Left: the details */}
        <div className="space-y-12">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
              How it works
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

          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
              What we&apos;ll cover
            </h2>
            <ul className="mt-5 space-y-3">
              {AGENDA.map((a) => (
                <li key={a} className="flex items-start gap-3 text-sm text-mist">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                    <Check className="h-3 w-3" />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
              Common questions
            </h2>
            <div className="mt-5 divide-y divide-steel-line overflow-hidden rounded-2xl border border-steel-line">
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
        </div>

        {/* Right: the booking form (sticky on desktop) */}
        <div>
          <div className="lg:sticky lg:top-28">
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
              <h2 className="font-display text-xl font-semibold tracking-tight text-chrome">
                Request your call
              </h2>
              <p className="mt-1 text-sm text-fog">
                Pick a date and window — we&apos;ll confirm the exact time by
                email.
              </p>
              <div className="mt-5">
                <InterviewForm />
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-fog">
              Prefer to send details?{" "}
              <Link href="/start" className="font-medium text-blue-300 hover:text-blue-400">
                Send a project brief
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
