"use client";

import { useAuth } from "./AuthProvider";

/*
  Renders one of two branches based on sign-in state, resolved on the client.
  This lets pages stay statically rendered (no cookie read on the server) while
  still swapping CTAs/copy for signed-in members. Defaults to the `guest`
  branch until /api/auth/me resolves — correct for a pre-launch landing site
  where the vast majority of visitors are signed out, and it matches the
  server-rendered HTML so there's no hydration mismatch.
*/
export function AuthSwitch({
  guest,
  authed,
}: {
  guest: React.ReactNode;
  authed: React.ReactNode;
}) {
  const { user } = useAuth();
  return <>{user ? authed : guest}</>;
}
