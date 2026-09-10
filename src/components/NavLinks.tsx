"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Renders the top-bar links and highlights the one for the current page.
export function NavLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <>
      {links.map((l) => {
        const active =
          l.href === "/"
            ? pathname === "/"
            : pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-4 py-2.5 text-base font-medium transition-colors ${
              active
                ? "bg-blue-500/10 font-semibold text-blue-500"
                : "text-mist hover:bg-abyss hover:text-chrome"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
