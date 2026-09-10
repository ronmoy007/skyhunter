import crypto from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import {
  findUserRow,
  insertUser,
  patchUser,
  type StoredUser,
} from "./store";

/*
  Auth: password hashing + stateless HMAC-signed session cookies. User data
  now lives in the storage adapter (store.ts) — Supabase when configured, a
  local file otherwise.
*/

const COOKIE_NAME = "sky_session";
const HINT_COOKIE = "sky_auth"; // client-readable "signed in" marker (no identity)
const REMEMBER_SECONDS = 60 * 60 * 24 * 30; // 30 days ("remember me")
const SESSION_SECONDS = 60 * 60 * 24; // 1 day (no remember → session cookie)

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (s) return s;
  // Fail closed in production: a known fallback secret would let anyone forge a
  // session cookie for any email (including an admin) and take over the site.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[auth] AUTH_SECRET is required in production. Set it to a 64-char random " +
        "hex string (node -e \"console.log(crypto.randomBytes(32).toString('hex'))\").",
    );
  }
  console.warn(
    "[auth] AUTH_SECRET is not set — using an insecure dev fallback. " +
      "Set AUTH_SECRET in .env.local before deploying.",
  );
  return "dev-insecure-secret-do-not-use-in-production";
}

export type { StoredUser };
export type SessionUser = { email: string; name: string };

// ---- user store (delegates to the storage adapter) -----------------------

// Cached per request — dedupes repeated lookups within a single render/request.
export const findUser = cache(
  async (email: string): Promise<StoredUser | undefined> =>
    (await findUserRow(email)) ?? undefined,
);

export async function createUser(user: StoredUser): Promise<void> {
  await insertUser(user);
}

// Update a user's editable fields (name + profile).
export async function updateUser(
  email: string,
  patch: { name?: string; profile?: Partial<StoredUser["profile"]> },
): Promise<StoredUser | null> {
  return patchUser(email, patch);
}

// ---- admin ---------------------------------------------------------------

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: StoredUser): boolean {
  return !!user.is_admin || adminEmails().includes(user.email.toLowerCase());
}

// A suspended account is disabled: it can't sign in and any live session is
// invalidated on the next /api/auth/me poll.
export function isSuspended(user: StoredUser): boolean {
  return !!user.profile?.suspended;
}

// Full user for the current session, or null. Suspended accounts resolve to
// null so a stateless session (which has no server-side revocation) can't keep
// acting after an admin disables it — enforced on every authenticated read.
export async function getCurrentUser(): Promise<StoredUser | null> {
  const session = await getSession();
  if (!session) return null;
  const user = (await findUserRow(session.email)) ?? null;
  if (user && isSuspended(user)) return null;
  return user;
}

// Current user if they're an admin, otherwise null.
export async function requireAdmin(): Promise<StoredUser | null> {
  const user = await getCurrentUser();
  return user && isAdminUser(user) ? user : null;
}

// ---- passwords -----------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = crypto.scryptSync(password, salt, 64);
  return (
    expected.length === actual.length &&
    crypto.timingSafeEqual(expected, actual)
  );
}

// ---- session tokens ------------------------------------------------------

function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

function verifyTokenString(token: string): SessionUser | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto
    .createHmac("sha256", secret())
    .update(data)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

// Reusable cookie descriptor — lets route handlers that return a redirect
// (e.g. the OAuth callback) set the session directly on their NextResponse.
// remember=true → persistent 30-day cookie; false → session cookie (clears
// when the browser closes).
export function sessionCookie(user: SessionUser, remember = true) {
  const ttl = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  const exp = Math.floor(Date.now() / 1000) + ttl;
  return {
    name: COOKIE_NAME,
    value: signToken({ email: user.email, name: user.name, exp }),
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // No maxAge → a session cookie that expires when the browser closes.
      ...(remember ? { maxAge: ttl } : {}),
    },
  };
}

// Non-httpOnly companion to the session cookie. Carries no identity — just a
// "1" marker — so client components (e.g. the navbar's Dashboard link) can tell
// on first paint of a statically rendered page that the visitor is signed in,
// without waiting for the /api/auth/me round-trip. The httpOnly session cookie
// remains the source of truth for anything that matters.
export function authHintCookie(remember = true) {
  const ttl = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  return {
    name: HINT_COOKIE,
    value: "1",
    options: {
      httpOnly: false,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(remember ? { maxAge: ttl } : {}),
    },
  };
}

export async function setSession(
  user: SessionUser,
  remember = true,
): Promise<void> {
  const c = sessionCookie(user, remember);
  const h = authHintCookie(remember);
  const store = await cookies();
  store.set(c.name, c.value, c.options);
  store.set(h.name, h.value, h.options);
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  store.set(HINT_COOKIE, "", { path: "/", maxAge: 0 });
}

// Cached per request — the navbar and the page both read the session.
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return token ? verifyTokenString(token) : null;
});
