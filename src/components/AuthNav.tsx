"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

export function AuthNav({ compact = false }: { compact?: boolean }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the menu on any click/tap outside it, or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    await signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  // Avoid a flash of the wrong state during the first /me fetch.
  if (loading) {
    return <span className="h-11 w-24" aria-hidden="true" />;
  }

  if (user) {
    const first = user.name.split(" ")[0];
    const initials = user.name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div ref={wrapRef} className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="relative flex items-center gap-2.5 rounded-lg border border-steel-line bg-void px-3 py-2 text-base font-medium text-chrome transition-colors hover:bg-abyss"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
              {initials}
            </span>
          )}
          {!compact && <span className="max-w-[8rem] truncate">{first}</span>}
        </button>

        {menuOpen && (
          <div className="lift absolute right-0 z-40 mt-2 w-52 rounded-xl border border-steel-line bg-void p-1.5">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-semibold text-chrome">
                  {user.name}
                </p>
                <p className="truncate text-xs text-fog">{user.email}</p>
              </div>
              <div className="my-1 h-px bg-steel-line" />
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-mist transition-colors hover:bg-abyss hover:text-chrome"
              >
                Your profile
              </Link>
              <Link
                href="/requests"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-mist transition-colors hover:bg-abyss hover:text-chrome"
              >
                Your requests
              </Link>
              <Link
                href="/industries"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-mist transition-colors hover:bg-abyss hover:text-chrome"
              >
                Community
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-mist transition-colors hover:bg-abyss hover:text-chrome"
              >
                Sign out
              </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!compact && (
        <Link
          href="/signin"
          className="rounded-lg px-4 py-2.5 text-base font-medium text-mist transition-colors hover:bg-abyss hover:text-chrome"
        >
          Sign in
        </Link>
      )}
      <Link
        href="/signup"
        className="rounded-lg bg-blue-500 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-blue-400"
      >
        Sign Up
      </Link>
    </div>
  );
}
