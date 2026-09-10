import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { STORIES } from "@/lib/content";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, Calendar, Check, Compass, Spark } from "@/components/icons";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Case studies · SkyHunter",
  description:
    "Real builds for real clients — e-commerce, healthcare, and law. The problem we were handed, what we shipped, and the result it drove.",
};

const accent: Record<string, string> = {
  clay: "bg-blue-500",
  sage: "bg-cyan",
  sky: "bg-blue-400",
};

const eyebrow =
  "font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300";

export default function StoriesPage() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-14">
      {/* Hero */}
      <div className="max-w-2xl">
        <p className={eyebrow}>Case studies</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
          Work we&apos;ve <span className="sky-text">shipped</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          Every engagement starts with a client problem and ends with something
          running in production. Here&apos;s the problem we were handed, what we
          built, and the result it drove — for teams in e-commerce, healthcare,
          and law.
        </p>
      </div>

      {/* Case-study cards */}
      <div className="mt-12 space-y-6">
        {STORIES.map((story, i) => (
          <Reveal key={story.name} delay={i * 90}>
            <article className="rounded-2xl border border-steel-line/70 bg-navy/60 p-7 sm:p-9">
              <div className="flex flex-wrap items-center gap-4">
                {story.avatar ? (
                  <Image
                    src={story.avatar}
                    alt={story.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white ${accent[story.accent]}`}
                  >
                    {story.initials}
                  </span>
                )}
                <div>
                  <h2 className="font-display text-2xl font-bold text-chrome">
                    {story.name}
                  </h2>
                  <p className="text-sm text-fog">{story.was}</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/5 px-3 py-1 text-xs font-semibold text-cyan">
                  <Calendar className="h-3.5 w-3.5" />
                  {story.monthsToRehire} weeks to ship
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-steel-line/70 bg-void/50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fog">
                    <Compass className="h-4 w-4" />
                    The problem
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-mist">
                    {story.was}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
                    <Spark className="h-4 w-4" />
                    What we built
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-chrome">
                    {story.now}
                  </p>
                </div>
              </div>

              <blockquote className="mt-6 border-l-2 border-blue-500/50 pl-5 font-display text-xl leading-relaxed text-chrome">
                &ldquo;{story.quote}&rdquo;
              </blockquote>

              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-cyan">
                <Check className="h-4 w-4" />
                The result, in their words
              </p>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Closing CTA */}
      <div className="lift mt-14 rounded-2xl border border-steel-line bg-navy px-8 py-12 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-chrome">
          Have a build in mind?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-mist">
          Tell us what you&apos;re trying to ship. We&apos;ll scope it, price it,
          and get working software in front of you fast.
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
