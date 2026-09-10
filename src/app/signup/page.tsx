import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpForm } from "@/components/SignUpForm";
import { Check } from "@/components/icons";
import { providerConfigured } from "@/lib/oauth";

export const metadata: Metadata = {
  title: "Sign up · SkyHunter",
  description:
    "Create your SkyHunter studio account.",
};

// Rendered per-request so the Google/LinkedIn buttons reflect the CURRENT env
// (they show as soon as the provider keys are set — no rebuild needed).
export const dynamic = "force-dynamic";

const PERKS = [
  "Manage inbound project leads and consultation calls",
  "Keep the portfolio and site content up to date",
  "See analytics and studio activity at a glance",
  "One secure account for the SkyHunter team",
];

export default function SignUpPage() {
  return (
    <section className="bg-sky-art relative overflow-hidden">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div className="rise-in">
          <span className="inline-flex items-center gap-2.5 font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
            <span className="h-px w-6 bg-blue-400/60" />
            Team access
          </span>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1] tracking-tight text-chrome sm:text-6xl">
            The studio <span className="sky-text">back office</span>.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-mist">
            Create your SkyHunter team account to manage leads, the portfolio,
            site content, and analytics.{" "}
            <span className="text-fog">
              Looking to hire us instead?{" "}
              <a href="/start" className="font-medium text-blue-300 hover:text-blue-400">
                Start a project →
              </a>
            </span>
          </p>

          {/* Value signal — what the account is for */}
          <div className="mt-7 inline-flex max-w-md items-center gap-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 px-5 py-4">
            <span className="h-10 w-1 shrink-0 rounded-full bg-blue-500" />
            <p className="text-sm text-mist">
              One account for the{" "}
              <span className="font-display text-lg font-semibold sky-text">
                SkyHunter studio team
              </span>{" "}
              to run the client pipeline end to end.
            </p>
          </div>

          <ul className="mt-8 space-y-3.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-mist">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/12 text-blue-300">
                  <Check className="h-3 w-3" />
                </span>
                <span className="leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>

          {/* Low-friction trust cues */}
          <div className="mt-8 flex flex-wrap gap-2">
            {["Takes ~1 minute", "Always free", "No spam, ever"].map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 rounded-full border border-steel-line bg-void/60 px-3 py-1.5 text-xs font-medium text-mist"
              >
                <Check className="h-3 w-3 text-cyan" />
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="lift rounded-2xl border border-steel-line bg-void p-6 sm:p-8">
          <Suspense fallback={<div className="h-96" />}>
            <SignUpForm
              google={providerConfigured("google")}
              linkedin={providerConfigured("linkedin")}
            />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
