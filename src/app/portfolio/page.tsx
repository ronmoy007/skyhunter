import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ArrowRight } from "@/components/icons";
import { PROJECTS, CAT_STYLE } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Portfolio · SkyHunter",
  description:
    "A selection of the AI, streaming, blockchain, cloud, commerce, and healthcare products SkyHunter has shipped with its partners.",
};

export const dynamic = "force-static";

const STATS = [
  { n: "30+", l: "Products shipped" },
  { n: "98%", l: "Client retention" },
  { n: "6+", l: "Senior team" },
  { n: "5 yrs", l: "Shipping software" },
];

export default function PortfolioPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-sky-art relative overflow-hidden">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 pb-14 pt-20 sm:pt-24 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div className="max-w-3xl rise-in">
            <span className="inline-flex items-center gap-2.5 font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
              <span className="h-px w-6 bg-blue-400/60" />
              Portfolio
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-chrome sm:text-6xl">
              Products we&apos;ve helped <span className="sky-text">build</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist">
              A selection of the AI, streaming, blockchain, cloud, commerce, and
              healthcare products we&apos;ve shipped with our partners — from first
              spec to launched, and running in production.
            </p>

            <dl className="mt-10 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.l} className="border-l border-steel-line pl-4">
                  <dt className="font-display text-3xl font-semibold text-chrome">
                    {s.n}
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-fog">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Theme-aware hero visual */}
          <div className="rise-in relative hidden lg:block">
            <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-blue-500/10 blur-3xl" />
            <div className="theme-light-only lift relative overflow-hidden rounded-2xl border border-steel-line bg-navy">
              <Image
                src="/Ads/portfolio-light.png"
                alt="A showcase of products SkyHunter has shipped — storefront, telehealth, and analytics apps across laptop and phone"
                width={1672}
                height={941}
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="h-auto w-full"
              />
            </div>
            <div className="theme-dark-only lift relative overflow-hidden rounded-2xl border border-steel-line bg-navy">
              <Image
                src="/Ads/portfolio-dark.png"
                alt="A showcase of products SkyHunter has shipped — storefront, telehealth, and analytics apps across laptop and phone"
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

      {/* Grid */}
      <section className="mx-auto max-w-[1400px] px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 70} className="h-full">
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
                    <h2 className="font-display text-xl font-semibold text-chrome">
                      {p.name}
                    </h2>
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

      {/* Closing CTA */}
      <section className="mx-auto max-w-[1400px] px-5 pb-8">
        <Reveal>
          <div className="lift overflow-hidden rounded-2xl border border-steel-line bg-navy">
            <div className="bg-sky-art px-8 py-16 text-center sm:px-16">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                Your project next
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
                Let&apos;s build something worth shipping.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-mist">
                Tell us what you have in mind — within one business day you&apos;ll
                have a suggested scope, a timeline, and a ballpark.
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
