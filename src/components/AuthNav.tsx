"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

export function AuthNav({ compact = false }: { compact?: boolean }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keep the total unread-chat count fresh so the "Chat" badge (and the dot on
  // the avatar) stay accurate without opening the menu.
  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/messages/unread", { cache: "no-store" });
        const json = await res.json();
        if (alive) setUnread(json.total ?? 0);
      } catch {
        /* keep last value */
      }
    };
    load();
    const t = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [user, menuOpen]);

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
          {unread > 0 && (
            <span
              aria-label={`${unread} unread messages`}
              className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-void"
            />
          )}
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
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-mist transition-colors hover:bg-abyss hover:text-chrome"
              >
                Dashboard
              </Link>
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
                href="/messages"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-mist transition-colors hover:bg-abyss hover:text-chrome"
              >
                <span>Chat</span>
                {unread > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-semibold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
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
