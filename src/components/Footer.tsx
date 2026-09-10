import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-steel-line/60 bg-abyss">
      <div className="mx-auto max-w-[1400px] px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fog">
              SkyHunter is a product studio. We build e-commerce, healthcare, and
              law websites, AI agents, and LLM apps for startups and small
              agencies — from first spec to shipped.
            </p>
            <Link
              href="/start"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
            >
              Start a project →
            </Link>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-chrome">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-fog">
              <li>
                <Link href="/services" className="hover:text-blue-300">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-blue-300">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/industries" className="hover:text-blue-300">
                  Industries
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="hover:text-blue-300">
                  Case studies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-chrome">Get in touch</h3>
            <ul className="mt-3 space-y-2 text-sm text-fog">
              <li>
                <Link href="/start" className="hover:text-blue-300">
                  Start a project
                </Link>
              </li>
              <li>
                <Link href="/book-a-call" className="hover:text-blue-300">
                  Book a call
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-300">
                  Contact &amp; FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="streak mt-12" />
        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-faint sm:flex-row sm:items-center">
          <p>© {2026} SkyHunter — a product &amp; AI studio.</p>
          <p className="flex items-center gap-4">
            <a
              href="mailto:support@skyhunterlab.online"
              className="font-medium text-fog transition-colors hover:text-blue-300"
            >
              support@skyhunterlab.online
            </a>
            <Link
              href="/signin"
              className="text-faint transition-colors hover:text-fog"
            >
              Team sign in
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
