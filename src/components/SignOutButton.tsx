"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function SignOutButton() {
  const router = useRouter();
  const { signOut } = useAuth();

  async function handle() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handle}
      className="rounded-xl border border-steel-line px-5 py-2.5 text-sm font-semibold text-chrome transition-colors hover:border-blue-500/60"
    >
      Sign out
    </button>
  );
}
