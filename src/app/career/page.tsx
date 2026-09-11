import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers · SkyHunter",
  description:
    "Career opportunities at SkyHunter. Join our team and help build the future of AI development.",
};

export default function CareersPage() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-steel-line/80 bg-navy/50 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
            Careers
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
            Join our team
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-mist">
            We're always looking for talented developers, designers, and AI experts to help build the future of AI development.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
          >
            Get in touch
          </Link>
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-steel-line bg-navy/20 p-12 text-center">
        <h2 className="text-2xl font-semibold text-chrome">No open positions at the moment</h2>
        <p className="mt-3 text-mist">
          We're not currently hiring, but we'd love to hear from you! Reach out and let us know you're interested.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex rounded-lg border border-blue-500 px-6 py-3 font-semibold text-blue-300 transition-colors hover:bg-blue-500 hover:text-white"
        >
          Contact us
        </Link>
      </div>
    </section>
  );
}
