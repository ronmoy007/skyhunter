import { NextResponse } from "next/server";
import {
  getSession,
  getCurrentUser,
  isAdminUser,
  isSuspended,
  authHintCookie,
} from "@/lib/auth";

export const runtime = "nodejs";

// Signed-out response that also clears both the session and the client hint,
// so a suspended (or logged-out) user is fully logged out on the next poll.
function loggedOut() {
  const res = NextResponse.json({ user: null });
  res.cookies.set("sky_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set("sky_auth", "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET() {
  const session = await getSession();
  if (!session) return loggedOut();

  const full = await getCurrentUser();
  // Suspended accounts are disabled — invalidate the live session immediately.
  if (full && isSuspended(full)) return loggedOut();
  const isAdmin = full ? isAdminUser(full) : false;

  const res = NextResponse.json({
    user: {
      email: session.email,
      name: session.name,
      isAdmin,
      avatarUrl: full?.profile?.avatarUrl ?? "",
    },
  });
  // Backfill the hint cookie so sessions created before this existed (and every
  // future load) get an instant navbar on statically rendered pages.
  const hint = authHintCookie();
  res.cookies.set(hint.name, hint.value, hint.options);
  return res;
}
