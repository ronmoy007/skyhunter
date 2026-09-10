"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

const BTN =
  "mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400";

// The big footer button: guests are invited to sign up; signed-in members get a
// link into the app instead of a redundant "Join" CTA.
export function FooterPrimaryCta() {
  const { user, loading } = useAuth();
  // Reserve the button's height while we resolve auth, so nothing shifts and a
  // signed-in member never flashes the "Join" button.
  if (loading) return <div className="mt-5 h-[42px]" aria-hidden />;
  return user ? (
    <Link href="/dashboard" className={BTN}>
      Go to your dashboard →
    </Link>
  ) : (
    <Link href="/signup" className={BTN}>
      Join SkyHunter — it&apos;s free
    </Link>
  );
}

// The bottom two links in the "When it's heavy" column: account CTAs for guests,
// useful in-app links for members.
export function FooterAccountLinks() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? (
    <>
      <li>
        <Link href="/dashboard" className="text-blue-300 hover:text-blue-400">
          Your dashboard →
        </Link>
      </li>
      <li>
        <Link href="/messages" className="hover:text-blue-300">
          Messages
        </Link>
      </li>
    </>
  ) : (
    <>
      <li>
        <Link href="/signup" className="text-blue-300 hover:text-blue-400">
          Create your free account →
        </Link>
      </li>
      <li>
        <Link href="/signin" className="hover:text-blue-300">
          Sign in
        </Link>
      </li>
    </>
  );
}
