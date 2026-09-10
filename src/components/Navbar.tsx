import Link from "next/link";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { AuthNav } from "./AuthNav";
import { LarkBar } from "./LarkBar";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/industries", label: "Industries" },
  { href: "/contact", label: "Contact" },
];

// Marketing-site header. No member auth surface — the primary action is always
// "Start a project". Renders statically (no cookie read) so every page under the
// shell stays static; the team reaches the admin via a discreet footer link.
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-steel-line bg-void/85 backdrop-blur-xl">
      <LarkBar />
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <Link href="/" aria-label="SkyHunter home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <NavLinks links={LINKS} />
          <span className="ml-3 flex items-center gap-2.5">
            <ThemeToggle />
            <AuthNav />
            <Link
              href="/start"
              className="rounded-lg border border-blue-500 px-5 py-2.5 text-base font-semibold text-blue-300 transition-colors hover:bg-blue-500 hover:text-white"
            >
              Start a project
            </Link>
          </span>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <AuthNav compact />
          <Link
            href="/start"
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
          >
            Start a project
          </Link>
        </div>
      </nav>
    </header>
  );
}
