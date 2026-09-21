"use client";

import { useState } from "react";
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
  { href: "/career", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-steel-line bg-void/85 backdrop-blur-xl">
      <LarkBar />
      <nav className="mx-auto max-w-[1400px] px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" aria-label="SkyHunter home" className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-1 lg:flex">
            <NavLinks links={LINKS} />
            <span className="ml-2 flex items-center gap-2">
              <ThemeToggle />
              <AuthNav />
            </span>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-1 lg:hidden ml-auto">
            <ThemeToggle />
            <AuthNav compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg border border-steel-line hover:bg-abyss transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-chrome" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-steel-line/30 pt-4 space-y-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-lg text-sm text-mist hover:bg-abyss hover:text-chrome transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
