import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { getSupabase, noteSupabaseDown } from "./supabase";
import { JOBS as JOB_SEED, type Job } from "./jobs";
import type { SignupMeta } from "./geo";

/*
  Storage adapter. Every data access goes through here. When Supabase is
  configured AND reachable it uses Postgres; otherwise (not configured, or a
  transient network failure) it transparently uses the local JSON files under
  .data/ so the app never 500s on a DB hiccup.
*/

export type StoredUser = {
  email: string;
  name: string;
  passwordHash?: string;
  provider?: string;
  is_admin?: boolean;
  createdAt: string;
  profile: {
    previousRole: string;
    industry: string;
    situation: string;
    location: string;
    avatarUrl?: string;
    connections?: string[];
    tourSeen?: boolean; // has the user completed/dismissed the dashboard tour
    // Professional / job-seeker profile (all optional).
    headline?: string; // e.g. "Copywriter moving into content strategy"
    summary?: string; // short professional bio
    skills?: string[]; // ["Copywriting", "SEO", "Figma"]
    experienceYears?: string; // "0-1" | "1-3" | "3-5" | "5-10" | "10+"
    desiredRole?: string; // target role
    workPreference?: string; // Remote | Hybrid | On-site | No preference
    availability?: string; // Immediately | Within 2 weeks | Within a month | Just exploring
    desiredSalary?: string; // free text, e.g. "$2.5K–$3.5K / month"
    phone?: string;
    website?: string; // portfolio / personal site
    linkedinUrl?: string;
    githubUrl?: string;
    // Account moderation — an admin can suspend a stranger/abusive account.
    // Stored in the JSONB profile so no schema migration is needed.
    suspended?: boolean;
    suspendedAt?: string; // ISO timestamp
    suspendedReason?: string; // optional admin note
    // IP geolocation + VPN/VPS detection captured at signup (admin-only).
    signup?: SignupMeta;
  };
};

export type Pending = {
  email: string;
  name: string;
  passwordHash: string;
  profile: StoredUser["profile"];
  code: string;
  expiresAt: number;
  attempts: number;
};

export type Registration = {
  timestamp: string;
  name: string;
  email: string;
  previousRole: string;
  industry: string;
  situation: string;
  location: string;
};

// ---- resilience wrapper --------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type SB = NonNullable<ReturnType<typeof getSupabase>>;

// Decide whether to fall back to the local store on a Supabase error.
//
// Fall back (return true) for:
//   - connectivity problems: fetch failed, DNS, timeout, abort — these carry no
//     code at all.
//   - transient JWT/auth-timing errors: PGRST3xx, e.g. PGRST301 "JWT expired"
//     and PGRST303 "JWT issued at future" (clock skew between this machine and
//     Supabase's servers). The token is momentarily unusable, not the query.
//
// Surface (return false) genuine query errors: other PGRST codes (bad request,
// schema/permission) and 5-char SQLSTATEs like "42P01" (missing table).
function isRecoverableError(err: any): boolean {
  const code = String(err?.code ?? "");
  if (/^PGRST3\d\d$/i.test(code)) return true;
  if (/^PGRST/i.test(code)) return false;
  if (/^[0-9A-Za-z]{5}$/.test(code)) return false;
  return true;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isJwtSkew = (err: any) => /^PGRST3\d\d$/i.test(String(err?.code ?? ""));

// A table that hasn't been created in Supabase yet (schema not applied).
// PGRST205 = PostgREST "table not in schema cache"; 42P01 = Postgres "undefined
// table". We serve this data from the local store instead of 500-ing, and we do
// NOT trip the breaker (the rest of the tables are fine) — so once the table is
// created it starts using Supabase automatically.
let missingTableWarned = false;
const isMissingTable = (err: any) => {
  const code = String(err?.code ?? "");
  return code === "PGRST205" || code === "42P01";
};

// Run a Supabase op; on a network failure, open the breaker and use the local
// fallback instead of throwing. Real query errors (bad SQL, etc.) still throw.
//
// Transient JWT clock-skew errors (PGRST3xx, e.g. "JWT issued at future") get a
// couple of quick retries FIRST — they self-heal in well under a second, and
// falling back to the (usually empty) local store would otherwise hide real
// Supabase data. Only after the retries are exhausted do we fall back.
async function store<T>(
  sbFn: (sb: SB) => Promise<T>,
  fileFn: () => Promise<T>,
): Promise<T> {
  const sb = getSupabase();
  if (!sb) return fileFn();

  for (let attempt = 0; ; attempt++) {
    try {
      return await sbFn(sb);
    } catch (err) {
      if (isJwtSkew(err) && attempt < 3) {
        await sleep(200 * (attempt + 1)); // 200ms, 400ms, 600ms
        continue;
      }
      if (isMissingTable(err)) {
        if (!missingTableWarned) {
          missingTableWarned = true;
          console.warn(
            `[store] a Supabase table is missing (${(err as { code?: string })?.code}) — ` +
              "serving that data from the local store. Apply supabase/schema.sql " +
              "(SQL editor) to enable Supabase persistence for it.",
          );
        }
        return fileFn();
      }
      if (isRecoverableError(err)) {
        if (isJwtSkew(err)) {
          noteSupabaseDown(5_000);
          console.warn(
            `[store] Supabase auth ${(err as { code?: string })?.code} ` +
              `(${(err as { message?: string })?.message ?? ""}) persisted after ` +
              "retries — serving the local store, retrying Supabase in ~5s.",
          );
        } else {
          noteSupabaseDown();
          console.error(
            "[store] Supabase unreachable — falling back to the local store.",
          );
        }
        return fileFn();
      }
      throw err;
    }
  }
}

// Chat ops poll frequently. If the chat tables are missing, doing a failed
// Supabase round-trip on every poll is slow, so after one "missing" error we
// short-circuit chat reads/writes straight to the local store for a while, then
// re-probe (auto-picks up the tables once they're created). Only chat functions
// use this — other tables keep using store().
let chatMissingUntil = 0;
async function chatStore<T>(
  sbFn: (sb: SB) => Promise<T>,
  fileFn: () => Promise<T>,
): Promise<T> {
  if (Date.now() < chatMissingUntil) return fileFn();
  const sb = getSupabase();
  if (!sb) return fileFn();
  try {
    return await sbFn(sb);
  } catch (err) {
    if (isMissingTable(err)) {
      chatMissingUntil = Date.now() + 60_000;
      return fileFn();
    }
    if (isRecoverableError(err)) {
      noteSupabaseDown();
      return fileFn();
    }
    throw err;
  }
}

// ---- file helpers --------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), ".data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, file),
    JSON.stringify(data, null, 2),
    "utf8",
  );
}

const lc = (e: string) => e.trim().toLowerCase();

// ---- users ---------------------------------------------------------------

function rowToUser(r: any): StoredUser {
  return {
    email: r.email,
    name: r.name,
    passwordHash: r.password_hash ?? undefined,
    provider: r.provider ?? undefined,
    is_admin: !!r.is_admin,
    createdAt: r.created_at,
    profile: r.profile ?? {
      previousRole: "",
      industry: "",
      situation: "",
      location: "",
    },
  };
}

function userToRow(u: StoredUser): any {
  return {
    email: lc(u.email),
    name: u.name,
    password_hash: u.passwordHash ?? null,
    provider: u.provider ?? null,
    is_admin: !!u.is_admin,
    profile: u.profile,
    created_at: u.createdAt,
  };
}

export async function listUsers(): Promise<StoredUser[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToUser);
    },
    () => readJson<StoredUser[]>("users.json", []),
  );
}

export async function findUserRow(email: string): Promise<StoredUser | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("users")
        .select("*")
        .eq("email", lc(email))
        .maybeSingle();
      if (error) throw error;
      return data ? rowToUser(data) : null;
    },
    async () => {
      const list = await readJson<StoredUser[]>("users.json", []);
      return list.find((u) => lc(u.email) === lc(email)) ?? null;
    },
  );
}

export async function insertUser(user: StoredUser): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("users").insert(userToRow(user));
      if (error) throw error;
    },
    async () => {
      const list = await readJson<StoredUser[]>("users.json", []);
      list.push({ ...user, email: lc(user.email) });
      await writeJson("users.json", list);
    },
  );
}

export async function patchUser(
  email: string,
  patch: {
    name?: string;
    is_admin?: boolean;
    profile?: Partial<StoredUser["profile"]>;
  },
): Promise<StoredUser | null> {
  const existing = await findUserRow(email);
  if (!existing) return null;
  const merged: StoredUser = {
    ...existing,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.is_admin !== undefined ? { is_admin: patch.is_admin } : {}),
    profile: { ...existing.profile, ...(patch.profile ?? {}) },
  };

  return store(
    async (sb) => {
      const { error } = await sb
        .from("users")
        .update({
          name: merged.name,
          is_admin: merged.is_admin,
          profile: merged.profile,
        })
        .eq("email", lc(email));
      if (error) throw error;
      return merged;
    },
    async () => {
      const list = await readJson<StoredUser[]>("users.json", []);
      const i = list.findIndex((u) => lc(u.email) === lc(email));
      if (i < 0) return null;
      list[i] = merged;
      await writeJson("users.json", list);
      return merged;
    },
  );
}

export async function removeUser(email: string): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("users").delete().eq("email", lc(email));
      if (error) throw error;
    },
    async () => {
      const list = await readJson<StoredUser[]>("users.json", []);
      await writeJson(
        "users.json",
        list.filter((u) => lc(u.email) !== lc(email)),
      );
    },
  );
}

// ---- pending signups -----------------------------------------------------

function rowToPending(r: any): Pending {
  return {
    email: r.email,
    name: r.name,
    passwordHash: r.password_hash,
    profile: r.profile,
    code: r.code,
    expiresAt: Number(r.expires_at),
    attempts: r.attempts,
  };
}

export async function pendingGet(email: string): Promise<Pending | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("pending_signups")
        .select("*")
        .eq("email", lc(email))
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const p = rowToPending(data);
      return p.expiresAt > Date.now() ? p : null;
    },
    async () => {
      const list = await readJson<Pending[]>("pending.json", []);
      const now = Date.now();
      return (
        list.find((p) => lc(p.email) === lc(email) && p.expiresAt > now) ?? null
      );
    },
  );
}

export async function pendingUpsert(rec: Pending): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("pending_signups").upsert({
        email: lc(rec.email),
        name: rec.name,
        password_hash: rec.passwordHash,
        profile: rec.profile,
        code: rec.code,
        expires_at: rec.expiresAt,
        attempts: rec.attempts,
      });
      if (error) throw error;
    },
    async () => {
      const list = (await readJson<Pending[]>("pending.json", [])).filter(
        (p) => lc(p.email) !== lc(rec.email) && p.expiresAt > Date.now(),
      );
      list.push({ ...rec, email: lc(rec.email) });
      await writeJson("pending.json", list);
    },
  );
}

export async function pendingDelete(email: string): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb
        .from("pending_signups")
        .delete()
        .eq("email", lc(email));
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Pending[]>("pending.json", []);
      await writeJson(
        "pending.json",
        list.filter((p) => lc(p.email) !== lc(email)),
      );
    },
  );
}

export async function pendingIncrement(email: string): Promise<number | null> {
  const p = await pendingGet(email);
  if (!p) return null;
  const attempts = p.attempts + 1;
  await pendingUpsert({ ...p, attempts });
  return attempts;
}

// ---- registrations (signup log) ------------------------------------------

export async function registrationAdd(rec: Registration): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("registrations").insert({
        name: rec.name,
        email: rec.email,
        previous_role: rec.previousRole,
        industry: rec.industry,
        situation: rec.situation,
        location: rec.location,
      });
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Registration[]>("registrations.json", []);
      list.push(rec);
      await writeJson("registrations.json", list);
    },
  );
}

export async function registrationList(): Promise<Registration[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        timestamp: r.created_at,
        name: r.name ?? "",
        email: r.email ?? "",
        previousRole: r.previous_role ?? "",
        industry: r.industry ?? "",
        situation: r.situation ?? "",
        location: r.location ?? "",
      }));
    },
    async () => {
      const list = await readJson<Registration[]>("registrations.json", []);
      return [...list].reverse();
    },
  );
}

// ---- jobs ----------------------------------------------------------------

export async function jobsList(): Promise<Job[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("jobs")
        .select("data,sort")
        .order("sort", { ascending: true });
      if (error) throw error;
      if (data && data.length) return data.map((r: any) => r.data as Job);
      return JOB_SEED;
    },
    async () => {
      const list = await readJson<Job[]>("jobs.json", []);
      return list.length ? list : JOB_SEED;
    },
  );
}

export async function jobGet(id: string): Promise<Job | null> {
  return (await jobsList()).find((j) => j.id === id) ?? null;
}

export async function jobUpsert(job: Job): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb
        .from("jobs")
        .upsert({ id: job.id, data: job, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Job[]>("jobs.json", []);
      const base = list.length ? list : [...JOB_SEED];
      const i = base.findIndex((j) => j.id === job.id);
      if (i >= 0) base[i] = job;
      else base.push(job);
      await writeJson("jobs.json", base);
    },
  );
}

export async function jobDelete(id: string): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Job[]>("jobs.json", []);
      const base = list.length ? list : [...JOB_SEED];
      await writeJson(
        "jobs.json",
        base.filter((j) => j.id !== id),
      );
    },
  );
}

// ---- content collections -------------------------------------------------

export async function collectionGet<T>(key: string, seed: T): Promise<T> {
  const all = await contentAll();
  return key in all ? (all[key] as T) : seed;
}

export async function contentAll(): Promise<Record<string, unknown>> {
  return store(
    async (sb) => {
      const { data, error } = await sb.from("content").select("key,value");
      if (error) throw error;
      const map: Record<string, unknown> = {};
      for (const r of data ?? []) map[r.key] = r.value;
      return map;
    },
    () => readJson<Record<string, unknown>>("content.json", {}),
  );
}

export async function collectionSet(key: string, value: unknown): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb
        .from("content")
        .upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    async () => {
      const all = await readJson<Record<string, unknown>>("content.json", {});
      all[key] = value;
      await writeJson("content.json", all);
    },
  );
}

// ---- notifications -------------------------------------------------------

export type Notification = {
  id: string;
  email: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type NewNotification = { type: string; title: string; body?: string };

export async function notifyAdd(
  email: string,
  n: NewNotification,
): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("notifications").insert({
        email: lc(email),
        type: n.type,
        title: n.title,
        body: n.body ?? "",
      });
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Notification[]>("notifications.json", []);
      list.push({
        id: crypto.randomUUID(),
        email: lc(email),
        type: n.type,
        title: n.title,
        body: n.body ?? "",
        read: false,
        createdAt: new Date().toISOString(),
      });
      await writeJson("notifications.json", list);
    },
  );
}

export async function notifyList(email: string): Promise<Notification[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("notifications")
        .select("*")
        .eq("email", lc(email))
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: String(r.id),
        email: r.email,
        type: r.type,
        title: r.title,
        body: r.body ?? "",
        read: !!r.read,
        createdAt: r.created_at,
      }));
    },
    async () => {
      const list = await readJson<Notification[]>("notifications.json", []);
      return list
        .filter((n) => lc(n.email) === lc(email))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 50);
    },
  );
}

export async function notifyUnread(email: string): Promise<number> {
  return store(
    async (sb) => {
      const { count, error } = await sb
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("email", lc(email))
        .eq("read", false);
      if (error) throw error;
      return count ?? 0;
    },
    async () => {
      const list = await readJson<Notification[]>("notifications.json", []);
      return list.filter((n) => lc(n.email) === lc(email) && !n.read).length;
    },
  );
}

export async function notifyMarkRead(
  email: string,
  id?: string,
): Promise<void> {
  return store(
    async (sb) => {
      let q = sb
        .from("notifications")
        .update({ read: true })
        .eq("email", lc(email));
      if (id) q = q.eq("id", id);
      const { error } = await q;
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Notification[]>("notifications.json", []);
      for (const n of list) {
        if (lc(n.email) === lc(email) && (!id || n.id === id)) n.read = true;
      }
      await writeJson("notifications.json", list);
    },
  );
}

// ---- job applications ----------------------------------------------------

export type Application = {
  id: string;
  email: string;
  jobId: string;
  jobTitle: string;
  status: string;
  note?: string;
  createdAt: string;
};

function rowToApp(r: any): Application {
  return {
    id: String(r.id),
    email: r.email,
    jobId: r.job_id,
    jobTitle: r.job_title ?? "",
    status: r.status ?? "applied",
    note: r.note ?? "",
    createdAt: r.created_at,
  };
}

// True when Supabase rejects a write because a column doesn't exist yet — lets
// us degrade gracefully when the optional `note` column hasn't been migrated.
function isUnknownColumn(err: any): boolean {
  const code = String(err?.code ?? "");
  return code === "PGRST204" || code === "42703";
}

export async function applicationAdd(
  email: string,
  jobId: string,
  jobTitle: string,
  note = "",
): Promise<void> {
  return store(
    async (sb) => {
      const payload: Record<string, string> = {
        email: lc(email),
        job_id: jobId,
        job_title: jobTitle,
        status: "applied",
      };
      if (note) payload.note = note;
      const opts = { onConflict: "email,job_id" };
      let { error } = await sb.from("applications").upsert(payload, opts);
      // If the `note` column hasn't been migrated yet, still record the apply.
      if (error && note && isUnknownColumn(error)) {
        delete payload.note;
        ({ error } = await sb.from("applications").upsert(payload, opts));
      }
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      if (!list.some((a) => lc(a.email) === lc(email) && a.jobId === jobId)) {
        list.push({
          id: crypto.randomUUID(),
          email: lc(email),
          jobId,
          jobTitle,
          status: "applied",
          note,
          createdAt: new Date().toISOString(),
        });
        await writeJson("applications.json", list);
      }
    },
  );
}

export async function applicationRemove(
  email: string,
  jobId: string,
): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb
        .from("applications")
        .delete()
        .eq("email", lc(email))
        .eq("job_id", jobId);
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      await writeJson(
        "applications.json",
        list.filter((a) => !(lc(a.email) === lc(email) && a.jobId === jobId)),
      );
    },
  );
}

export async function applicationsByUser(email: string): Promise<Application[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("applications")
        .select("*")
        .eq("email", lc(email))
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToApp);
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      return list
        .filter((a) => lc(a.email) === lc(email))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  );
}

export async function applicationsAll(): Promise<Application[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToApp);
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  );
}

export async function appliedJobIds(email: string): Promise<string[]> {
  return (await applicationsByUser(email)).map((a) => a.jobId);
}

export async function applicationUpdateStatus(
  id: string,
  status: string,
): Promise<Application | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("applications")
        .update({ status })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? rowToApp(data) : null;
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      let updated: Application | null = null;
      for (const a of list)
        if (a.id === id) {
          a.status = status;
          updated = a;
        }
      await writeJson("applications.json", list);
      return updated;
    },
  );
}

// Delete an application by id, returning the removed row (so the admin API can
// notify the member whose request was deleted).
export async function applicationDelete(id: string): Promise<Application | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("applications")
        .delete()
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? rowToApp(data) : null;
    },
    async () => {
      const list = await readJson<Application[]>("applications.json", []);
      const removed = list.find((a) => a.id === id) ?? null;
      if (removed) await writeJson("applications.json", list.filter((a) => a.id !== id));
      return removed;
    },
  );
}

// ---- intro requests (contracts network) ----------------------------------

export type IntroRequest = {
  id: string;
  email: string;
  name: string;
  partner: string;
  role: string;
  contactEmail: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
  // Set by an admin when they schedule and send the interview to the member.
  scheduledAt?: string; // ISO datetime of the confirmed interview
  meetingLink?: string; // Lark / video-call link
  scheduleNote?: string; // optional admin note (prep, agenda, etc.)
};

function rowToIntro(r: any): IntroRequest {
  return {
    id: String(r.id),
    email: r.email,
    name: r.name ?? "",
    partner: r.partner,
    role: r.role ?? "",
    contactEmail: r.contact_email ?? "",
    phone: r.phone ?? "",
    message: r.message ?? "",
    status: r.status ?? "pending",
    createdAt: r.created_at,
    scheduledAt: r.scheduled_at ?? undefined,
    meetingLink: r.meeting_link ?? undefined,
    scheduleNote: r.schedule_note ?? undefined,
  };
}

export async function introAdd(
  email: string,
  name: string,
  partner: string,
  role: string,
  contact: { contactEmail: string; phone: string; message: string },
): Promise<void> {
  return store(
    async (sb) => {
      const { error } = await sb.from("intro_requests").insert({
        email: lc(email),
        name,
        partner,
        role,
        contact_email: contact.contactEmail,
        phone: contact.phone,
        message: contact.message,
        status: "pending",
      });
      if (error) throw error;
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      list.push({
        id: crypto.randomUUID(),
        email: lc(email),
        name,
        partner,
        role,
        contactEmail: contact.contactEmail,
        phone: contact.phone,
        message: contact.message,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      await writeJson("intros.json", list);
    },
  );
}

export async function introList(): Promise<IntroRequest[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("intro_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToIntro);
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  );
}

export async function introsByUser(email: string): Promise<IntroRequest[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("intro_requests")
        .select("*")
        .eq("email", lc(email))
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToIntro);
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      return list
        .filter((i) => lc(i.email) === lc(email))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  );
}

export async function introUpdateStatus(
  id: string,
  status: string,
): Promise<IntroRequest | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("intro_requests")
        .update({ status })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? rowToIntro(data) : null;
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      let updated: IntroRequest | null = null;
      for (const it of list)
        if (it.id === id) {
          it.status = status;
          updated = it;
        }
      await writeJson("intros.json", list);
      return updated;
    },
  );
}

// Delete an interview/intro request by id, returning the removed row (so the
// admin API can notify the member whose request was deleted).
export async function introDelete(id: string): Promise<IntroRequest | null> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("intro_requests")
        .delete()
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? rowToIntro(data) : null;
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      const removed = list.find((it) => it.id === id) ?? null;
      if (removed) await writeJson("intros.json", list.filter((it) => it.id !== id));
      return removed;
    },
  );
}

// Admin schedules and "sends" the interview: sets the confirmed time / meeting
// link / note and flips the status to "scheduled". Returns the updated row so
// the API can notify the member.
export async function introSchedule(
  id: string,
  schedule: { scheduledAt: string; meetingLink?: string; scheduleNote?: string },
): Promise<IntroRequest | null> {
  return store(
    async (sb) => {
      const full = {
        status: "scheduled",
        scheduled_at: schedule.scheduledAt,
        meeting_link: schedule.meetingLink ?? "",
        schedule_note: schedule.scheduleNote ?? "",
      };
      let { data, error } = await sb
        .from("intro_requests")
        .update(full)
        .eq("id", id)
        .select("*")
        .maybeSingle();
      // If the schedule columns haven't been migrated yet, still mark it
      // scheduled (the member is notified with the details regardless).
      if (error && isUnknownColumn(error)) {
        ({ data, error } = await sb
          .from("intro_requests")
          .update({ status: "scheduled" })
          .eq("id", id)
          .select("*")
          .maybeSingle());
      }
      if (error) throw error;
      return data ? rowToIntro(data) : null;
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      let updated: IntroRequest | null = null;
      for (const it of list)
        if (it.id === id) {
          it.status = "scheduled";
          it.scheduledAt = schedule.scheduledAt;
          it.meetingLink = schedule.meetingLink || undefined;
          it.scheduleNote = schedule.scheduleNote || undefined;
          updated = it;
        }
      await writeJson("intros.json", list);
      return updated;
    },
  );
}

// Admin creates a brand-new scheduled interview for any registered member
// (they never had to request one). Returns the created row so the API can
// notify + deep-link. Reuses the same intro_requests store as booked interviews
// so it shows up in the member's panel automatically.
export async function introCreateScheduled(
  email: string,
  name: string,
  opts: {
    partner?: string;
    role?: string;
    scheduledAt: string;
    meetingLink?: string;
    scheduleNote?: string;
  },
): Promise<IntroRequest | null> {
  const partner = opts.partner || "SkyHunter interview";
  const role = opts.role || "";
  return store(
    async (sb) => {
      const base: Record<string, string> = {
        email: lc(email),
        name,
        partner,
        role,
        contact_email: lc(email),
        phone: "",
        message: "",
        status: "scheduled",
      };
      const full = {
        ...base,
        scheduled_at: opts.scheduledAt,
        meeting_link: opts.meetingLink ?? "",
        schedule_note: opts.scheduleNote ?? "",
      };
      let { data, error } = await sb
        .from("intro_requests")
        .insert(full)
        .select("*")
        .maybeSingle();
      // If the schedule columns aren't migrated, still create the interview.
      if (error && isUnknownColumn(error)) {
        ({ data, error } = await sb
          .from("intro_requests")
          .insert(base)
          .select("*")
          .maybeSingle());
      }
      if (error) throw error;
      return data ? rowToIntro(data) : null;
    },
    async () => {
      const list = await readJson<IntroRequest[]>("intros.json", []);
      const row: IntroRequest = {
        id: crypto.randomUUID(),
        email: lc(email),
        name,
        partner,
        role,
        contactEmail: lc(email),
        phone: "",
        message: "",
        status: "scheduled",
        createdAt: new Date().toISOString(),
        scheduledAt: opts.scheduledAt,
        meetingLink: opts.meetingLink || undefined,
        scheduleNote: opts.scheduleNote || undefined,
      };
      list.push(row);
      await writeJson("intros.json", list);
      return row;
    },
  );
}

// ---- chat: conversations + messages --------------------------------------
// Two kinds:
//   "support"  — a member with the SkyHunter support/admin team.
//   "contract" — two members the support team matched for a contract.
// Real-time is achieved by the thread polling messagesList() every few seconds.

export type Conversation = {
  id: string;
  kind: "support" | "contract";
  participants: string[]; // lowercased member emails
  title: string; // context label, e.g. "Support" or "Contract · <role>"
  createdAt: string;
  lastMessageAt: string;
  lastMessage: string; // short preview
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderEmail: string;
  senderName: string;
  body: string;
  createdAt: string;
  replyToId?: string | null; // message this one is a reply to
  editedAt?: string | null; // set when the body was edited
};

function rowToConversation(r: any): Conversation {
  return {
    id: String(r.id),
    kind: r.kind === "contract" ? "contract" : "support",
    participants: Array.isArray(r.participants) ? r.participants : [],
    title: r.title ?? "",
    createdAt: r.created_at,
    lastMessageAt: r.last_message_at ?? r.created_at,
    lastMessage: r.last_message ?? "",
  };
}

function rowToMessage(r: any): ChatMessage {
  return {
    id: String(r.id),
    conversationId: String(r.conversation_id),
    senderEmail: r.sender_email,
    senderName: r.sender_name ?? "",
    body: r.body ?? "",
    createdAt: r.created_at,
    replyToId: r.reply_to_id ?? null,
    editedAt: r.edited_at ?? null,
  };
}

export async function conversationCreate(
  kind: "support" | "contract",
  participants: string[],
  title: string,
): Promise<Conversation> {
  const parts = Array.from(new Set(participants.map(lc)));
  const now = new Date().toISOString();
  return chatStore(
    async (sb) => {
      const { data, error } = await sb
        .from("conversations")
        .insert({
          kind,
          participants: parts,
          title,
          last_message_at: now,
          last_message: "",
        })
        .select("*")
        .single();
      if (error) throw error;
      return rowToConversation(data);
    },
    async () => {
      const list = await readJson<Conversation[]>("conversations.json", []);
      const row: Conversation = {
        id: crypto.randomUUID(),
        kind,
        participants: parts,
        title,
        createdAt: now,
        lastMessageAt: now,
        lastMessage: "",
      };
      list.push(row);
      await writeJson("conversations.json", list);
      return row;
    },
  );
}

export async function conversationGet(id: string): Promise<Conversation | null> {
  return chatStore(
    async (sb) => {
      const { data, error } = await sb
        .from("conversations")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToConversation(data) : null;
    },
    async () => {
      const list = await readJson<Conversation[]>("conversations.json", []);
      return list.find((c) => c.id === id) ?? null;
    },
  );
}

export async function conversationsForUser(email: string): Promise<Conversation[]> {
  return chatStore(
    async (sb) => {
      const { data, error } = await sb
        .from("conversations")
        .select("*")
        .contains("participants", [lc(email)])
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToConversation);
    },
    async () => {
      const list = await readJson<Conversation[]>("conversations.json", []);
      return list
        .filter((c) => c.participants.includes(lc(email)))
        .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
    },
  );
}

export async function conversationsAll(): Promise<Conversation[]> {
  return chatStore(
    async (sb) => {
      const { data, error } = await sb
        .from("conversations")
        .select("*")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToConversation);
    },
    async () => {
      const list = await readJson<Conversation[]>("conversations.json", []);
      return [...list].sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
    },
  );
}

// Existing open support conversation for a member (avoid duplicates).
export async function supportConversationFor(
  email: string,
): Promise<Conversation | null> {
  const mine = await conversationsForUser(email);
  return mine.find((c) => c.kind === "support") ?? null;
}

export async function messagesList(conversationId: string): Promise<ChatMessage[]> {
  return chatStore(
    async (sb) => {
      const { data, error } = await sb
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(rowToMessage);
    },
    async () => {
      const list = await readJson<ChatMessage[]>("messages.json", []);
      return list
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
    },
  );
}

export async function messageAdd(
  conversationId: string,
  senderEmail: string,
  senderName: string,
  body: string,
  replyToId?: string | null,
): Promise<ChatMessage> {
  const now = new Date().toISOString();
  const preview = body.slice(0, 120);
  const reply = replyToId || null;
  return chatStore(
    async (sb) => {
      // Only reference reply_to_id when it's actually a reply, so ordinary
      // sends keep working even if the column hasn't been migrated yet.
      const payload: Record<string, unknown> = {
        conversation_id: conversationId,
        sender_email: lc(senderEmail),
        sender_name: senderName,
        body,
      };
      if (reply) payload.reply_to_id = reply;
      let { data, error } = await sb
        .from("messages")
        .insert(payload)
        .select("*")
        .single();
      // DB not migrated for replies yet — resend without the reply link.
      if (error && reply && isUnknownColumn(error)) {
        delete payload.reply_to_id;
        ({ data, error } = await sb
          .from("messages")
          .insert(payload)
          .select("*")
          .single());
      }
      if (error) throw error;
      await sb
        .from("conversations")
        .update({ last_message_at: now, last_message: preview })
        .eq("id", conversationId);
      return rowToMessage(data);
    },
    async () => {
      const list = await readJson<ChatMessage[]>("messages.json", []);
      const row: ChatMessage = {
        id: crypto.randomUUID(),
        conversationId,
        senderEmail: lc(senderEmail),
        senderName,
        body,
        createdAt: now,
        replyToId: reply,
        editedAt: null,
      };
      list.push(row);
      await writeJson("messages.json", list);
      const convs = await readJson<Conversation[]>("conversations.json", []);
      for (const c of convs)
        if (c.id === conversationId) {
          c.lastMessageAt = now;
          c.lastMessage = preview;
        }
      await writeJson("conversations.json", convs);
      return row;
    },
  );
}

// Edit a message's body (only the original sender). Returns the updated message
// or null if it isn't found / isn't theirs. Keeps the conversation preview in
// sync when the edited message is the latest one.
export async function messageEdit(
  conversationId: string,
  id: string,
  senderEmail: string,
  body: string,
): Promise<ChatMessage | null> {
  const now = new Date().toISOString();
  const preview = body.slice(0, 120);
  return chatStore(
    async (sb) => {
      let { data, error } = await sb
        .from("messages")
        .update({ body, edited_at: now })
        .eq("id", id)
        .eq("conversation_id", conversationId)
        .eq("sender_email", lc(senderEmail))
        .select("*")
        .maybeSingle();
      // edited_at column not migrated yet — save the body without the marker.
      if (error && isUnknownColumn(error)) {
        ({ data, error } = await sb
          .from("messages")
          .update({ body })
          .eq("id", id)
          .eq("conversation_id", conversationId)
          .eq("sender_email", lc(senderEmail))
          .select("*")
          .maybeSingle());
      }
      if (error) throw error;
      if (!data) return null;
      const { data: latest } = await sb
        .from("messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latest && String(latest.id) === id) {
        await sb
          .from("conversations")
          .update({ last_message: preview })
          .eq("id", conversationId);
      }
      return rowToMessage(data);
    },
    async () => {
      const list = await readJson<ChatMessage[]>("messages.json", []);
      const msg = list.find(
        (m) =>
          m.id === id &&
          m.conversationId === conversationId &&
          m.senderEmail === lc(senderEmail),
      );
      if (!msg) return null;
      msg.body = body;
      msg.editedAt = now;
      await writeJson("messages.json", list);
      const convMsgs = list
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
      if (convMsgs.length && convMsgs[convMsgs.length - 1].id === id) {
        const convs = await readJson<Conversation[]>("conversations.json", []);
        for (const c of convs) if (c.id === conversationId) c.lastMessage = preview;
        await writeJson("conversations.json", convs);
      }
      return msg;
    },
  );
}

// Delete a single message. Allowed for the original sender, or an admin
// (moderation). Returns true if a row was removed. Recomputes the conversation
// preview from whatever remains.
export async function messageDelete(
  conversationId: string,
  id: string,
  requesterEmail: string,
  isAdmin: boolean,
): Promise<boolean> {
  return chatStore(
    async (sb) => {
      let q = sb
        .from("messages")
        .delete()
        .eq("id", id)
        .eq("conversation_id", conversationId);
      if (!isAdmin) q = q.eq("sender_email", lc(requesterEmail));
      const { data, error } = await q.select("id");
      if (error) throw error;
      if (!data || data.length === 0) return false;
      const { data: latest } = await sb
        .from("messages")
        .select("body, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      await sb
        .from("conversations")
        .update({
          last_message: latest?.body ? String(latest.body).slice(0, 120) : "",
          ...(latest?.created_at ? { last_message_at: latest.created_at } : {}),
        })
        .eq("id", conversationId);
      return true;
    },
    async () => {
      const list = await readJson<ChatMessage[]>("messages.json", []);
      const idx = list.findIndex(
        (m) =>
          m.id === id &&
          m.conversationId === conversationId &&
          (isAdmin || m.senderEmail === lc(requesterEmail)),
      );
      if (idx === -1) return false;
      list.splice(idx, 1);
      await writeJson("messages.json", list);
      const remaining = list
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
      const last = remaining[remaining.length - 1];
      const convs = await readJson<Conversation[]>("conversations.json", []);
      for (const c of convs)
        if (c.id === conversationId) {
          c.lastMessage = last ? last.body.slice(0, 120) : "";
          if (last) c.lastMessageAt = last.createdAt;
        }
      await writeJson("conversations.json", convs);
      return true;
    },
  );
}

// Delete a conversation and all its messages (admin unmatch / cleanup).
export async function conversationDelete(id: string): Promise<void> {
  return chatStore(
    async (sb) => {
      // messages cascade via FK, but delete explicitly for safety.
      await sb.from("messages").delete().eq("conversation_id", id);
      const { error } = await sb.from("conversations").delete().eq("id", id);
      if (error) throw error;
    },
    async () => {
      const convs = await readJson<Conversation[]>("conversations.json", []);
      await writeJson(
        "conversations.json",
        convs.filter((c) => c.id !== id),
      );
      const msgs = await readJson<ChatMessage[]>("messages.json", []);
      await writeJson(
        "messages.json",
        msgs.filter((m) => m.conversationId !== id),
      );
    },
  );
}

// ---- unread tracking -----------------------------------------------------
// Per-(conversation, member) "last read" markers. These are lightweight UI
// state — which chats a member has caught up on — not durable records, so they
// live in the local file store rather than adding a Supabase table.

type ConvRead = { conversationId: string; email: string; lastReadAt: string };

// Mark a conversation as read for a member (call whenever they view it).
// Persists to Supabase (chat_reads table) when configured so unread badges
// survive across serverless instances; falls back to the local file otherwise.
export async function markConversationRead(
  conversationId: string,
  email: string,
): Promise<void> {
  const e = lc(email);
  const now = new Date().toISOString();
  return chatStore(
    async (sb) => {
      const { error } = await sb
        .from("chat_reads")
        .upsert(
          { conversation_id: conversationId, email: e, last_read_at: now },
          { onConflict: "conversation_id,email" },
        );
      if (error) throw error;
    },
    async () => {
      const list = await readJson<ConvRead[]>("chat-reads.json", []);
      const existing = list.find(
        (r) => r.conversationId === conversationId && r.email === e,
      );
      if (existing) existing.lastReadAt = now;
      else list.push({ conversationId, email: e, lastReadAt: now });
      await writeJson("chat-reads.json", list);
    },
  );
}

// A member's read markers, as { conversationId -> lastReadAt ISO }.
export async function conversationReads(
  email: string,
): Promise<Record<string, string>> {
  const e = lc(email);
  return chatStore(
    async (sb) => {
      const { data, error } = await sb
        .from("chat_reads")
        .select("conversation_id,last_read_at")
        .eq("email", e);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const r of data ?? []) map[String(r.conversation_id)] = r.last_read_at;
      return map;
    },
    async () => {
      const list = await readJson<ConvRead[]>("chat-reads.json", []);
      const map: Record<string, string> = {};
      for (const r of list) if (r.email === e) map[r.conversationId] = r.lastReadAt;
      return map;
    },
  );
}

// The latest time anyone OTHER than `email` read this conversation. Powers the
// read receipts ("✓✓ Read") on the sender's own messages. Includes an admin who
// read a support chat even though they aren't a listed participant.
export async function peerLastReadAt(
  conversationId: string,
  email: string,
): Promise<string | null> {
  const e = lc(email);
  return chatStore(
    async (sb) => {
      const { data, error } = await sb
        .from("chat_reads")
        .select("email,last_read_at")
        .eq("conversation_id", conversationId);
      if (error) throw error;
      let max: string | null = null;
      for (const r of data ?? []) {
        if (lc(String(r.email)) === e) continue;
        const t = r.last_read_at as string | null;
        if (t && (!max || t > max)) max = t;
      }
      return max;
    },
    async () => {
      const list = await readJson<ConvRead[]>("chat-reads.json", []);
      let max: string | null = null;
      for (const r of list) {
        if (r.conversationId !== conversationId || lc(r.email) === e) continue;
        if (!max || r.lastReadAt > max) max = r.lastReadAt;
      }
      return max;
    },
  );
}

// How many messages in a conversation the member hasn't seen yet — i.e. sent by
// someone else after their last read.
export async function unreadCount(
  conversationId: string,
  email: string,
  lastReadAt?: string,
): Promise<number> {
  const e = lc(email);
  const msgs = await messagesList(conversationId);
  return msgs.filter(
    (m) =>
      m.senderEmail.toLowerCase() !== e &&
      (!lastReadAt || m.createdAt > lastReadAt),
  ).length;
}

// Health check: are the chat tables actually present in Supabase? Used to warn
// the admin when chat is silently running on the (non-durable) local fallback
// because the schema hasn't been applied. Returns true when using the local
// file store (dev) or when the tables exist.
// Only the "ready" result is cached (permanently) — a "missing" result is
// re-checked each call, so the banner clears as soon as the tables are created
// (no server restart needed) without probing forever once things are set up.
let chatReadyCache = false;
export async function chatTablesReady(): Promise<boolean> {
  if (chatReadyCache) return true;
  const sb = getSupabase();
  if (!sb) return true; // local file store — fine
  try {
    const { error } = await sb.from("conversations").select("id").limit(1);
    const missing =
      !!error && (error.code === "PGRST205" || error.code === "42P01");
    if (!missing) chatReadyCache = true;
    return !missing;
  } catch {
    return true; // transient — don't nag
  }
}

// ---- voice calls ----------------------------------------------------------
// WebRTC signaling state. A call is created "ringing" with the caller's SDP
// offer; the callee answers with their SDP (→ "active"); either party ends it.
// Non-trickle ICE: candidates are gathered into the offer/answer before they're
// posted, so we only exchange two blobs — no per-candidate churn. Media flows
// peer-to-peer; the server only relays signaling.

export type CallStatus =
  | "ringing"
  | "active"
  | "ended"
  | "declined"
  | "missed";

export type Call = {
  id: string;
  conversationId: string;
  caller: string;
  callerName: string;
  callee: string;
  calleeName: string;
  status: CallStatus;
  offer: string | null;
  answer: string | null;
  createdAt: string;
  updatedAt: string;
};

// A ringing call is abandoned as "missed" after this long with no answer.
const RING_TIMEOUT_MS = 45_000;
// How far back callForUser looks — an ended call older than this stops being
// reported, so a hung-up call clears instead of lingering in the poll forever.
const CALL_RECENT_MS = 60_000;

function rowToCall(r: any): Call {
  return {
    id: String(r.id),
    conversationId: String(r.conversation_id),
    caller: r.caller,
    callerName: r.caller_name ?? "",
    callee: r.callee,
    calleeName: r.callee_name ?? "",
    status: (r.status ?? "ringing") as CallStatus,
    offer: r.offer ?? null,
    answer: r.answer ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at ?? r.created_at,
  };
}

// Start a new call. Any earlier unfinished call in the same conversation is
// closed first, so a fresh ring never collides with a stale one.
export async function callStart(args: {
  conversationId: string;
  caller: string;
  callerName: string;
  callee: string;
  calleeName: string;
  offer: string;
}): Promise<Call> {
  const caller = lc(args.caller);
  const callee = lc(args.callee);
  const now = new Date().toISOString();
  return chatStore(
    async (sb) => {
      await sb
        .from("calls")
        .update({ status: "ended", updated_at: now })
        .eq("conversation_id", args.conversationId)
        .in("status", ["ringing", "active"]);
      const { data, error } = await sb
        .from("calls")
        .insert({
          conversation_id: args.conversationId,
          caller,
          caller_name: args.callerName,
          callee,
          callee_name: args.calleeName,
          status: "ringing",
          offer: args.offer,
          created_at: now,
          updated_at: now,
        })
        .select("*")
        .single();
      if (error) throw error;
      return rowToCall(data);
    },
    async () => {
      const list = await readJson<Call[]>("calls.json", []);
      for (const c of list) {
        if (
          c.conversationId === args.conversationId &&
          (c.status === "ringing" || c.status === "active")
        ) {
          c.status = "ended";
          c.updatedAt = now;
        }
      }
      const row: Call = {
        id: crypto.randomUUID(),
        conversationId: args.conversationId,
        caller,
        callerName: args.callerName,
        callee,
        calleeName: args.calleeName,
        status: "ringing",
        offer: args.offer,
        answer: null,
        createdAt: now,
        updatedAt: now,
      };
      list.push(row);
      await writeJson("calls.json", list);
      return row;
    },
  );
}

export async function callGet(id: string): Promise<Call | null> {
  return chatStore(
    async (sb) => {
      const { data, error } = await sb
        .from("calls")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToCall(data) : null;
    },
    async () => {
      const list = await readJson<Call[]>("calls.json", []);
      return list.find((c) => c.id === id) ?? null;
    },
  );
}

// The single call currently relevant to a member — the most recent one they're
// party to, within the recent window. Ringing calls that have gone unanswered
// past the timeout are flipped to "missed" so both sides converge on that.
export async function callForUser(email: string): Promise<Call | null> {
  const e = lc(email);
  const cutoff = new Date(Date.now() - CALL_RECENT_MS).toISOString();
  const call = await chatStore(
    async (sb) => {
      const { data, error } = await sb
        .from("calls")
        .select("*")
        .or(`caller.eq.${e},callee.eq.${e}`)
        .gte("updated_at", cutoff)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToCall(data) : null;
    },
    async () => {
      const list = await readJson<Call[]>("calls.json", []);
      const mine = list
        .filter((c) => (c.caller === e || c.callee === e) && c.updatedAt >= cutoff)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      return mine[0] ?? null;
    },
  );
  if (
    call &&
    call.status === "ringing" &&
    Date.now() - new Date(call.createdAt).getTime() > RING_TIMEOUT_MS
  ) {
    const missed = await callSetStatus(call.id, e, "missed");
    return missed ?? { ...call, status: "missed" };
  }
  return call;
}

// Callee accepts: record their SDP answer and go active. Only works while the
// call is still ringing and only for the addressed callee.
export async function callAnswer(
  id: string,
  callee: string,
  answer: string,
): Promise<Call | null> {
  const e = lc(callee);
  const now = new Date().toISOString();
  return chatStore(
    async (sb) => {
      const { data, error } = await sb
        .from("calls")
        .update({ answer, status: "active", updated_at: now })
        .eq("id", id)
        .eq("callee", e)
        .eq("status", "ringing")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? rowToCall(data) : null;
    },
    async () => {
      const list = await readJson<Call[]>("calls.json", []);
      const c = list.find(
        (x) => x.id === id && x.callee === e && x.status === "ringing",
      );
      if (!c) return null;
      c.answer = answer;
      c.status = "active";
      c.updatedAt = now;
      await writeJson("calls.json", list);
      return c;
    },
  );
}

// End a call (hang up, decline, or expire). Either party may set a terminal
// status; a call that's already finished isn't touched.
export async function callSetStatus(
  id: string,
  email: string,
  status: "ended" | "declined" | "missed",
): Promise<Call | null> {
  const e = lc(email);
  const now = new Date().toISOString();
  return chatStore(
    async (sb) => {
      const { data, error } = await sb
        .from("calls")
        .update({ status, updated_at: now })
        .eq("id", id)
        .or(`caller.eq.${e},callee.eq.${e}`)
        .in("status", ["ringing", "active"])
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? rowToCall(data) : null;
    },
    async () => {
      const list = await readJson<Call[]>("calls.json", []);
      const c = list.find(
        (x) =>
          x.id === id &&
          (x.caller === e || x.callee === e) &&
          (x.status === "ringing" || x.status === "active"),
      );
      if (!c) return null;
      c.status = status;
      c.updatedAt = now;
      await writeJson("calls.json", list);
      return c;
    },
  );
}

// ---- analytics + presence -------------------------------------------------

export type StatEvent = {
  id: string;
  type: string; // "visit" | "login"
  email: string;
  createdAt: string;
};

export type Presence = { email: string; name: string; lastSeenAt: string };

// Record a tracked event (a page visit, a login, …). Best-effort — analytics
// must never break the request that triggered it, so callers swallow errors.
export async function recordEvent(type: string, email = ""): Promise<void> {
  const now = new Date().toISOString();
  return store(
    async (sb) => {
      const { error } = await sb
        .from("stat_events")
        .insert({ type, email: lc(email), created_at: now });
      if (error) throw error;
    },
    async () => {
      const list = await readJson<StatEvent[]>("stat-events.json", []);
      list.push({ id: crypto.randomUUID(), type, email: lc(email), createdAt: now });
      // Bound the dev file so it can't grow without limit.
      if (list.length > 20000) list.splice(0, list.length - 20000);
      await writeJson("stat-events.json", list);
    },
  );
}

// All tracked events since a cutoff (for daily aggregation).
export async function eventsSince(sinceIso: string): Promise<StatEvent[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("stat_events")
        .select("*")
        .gte("created_at", sinceIso);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: String(r.id),
        type: r.type,
        email: r.email ?? "",
        createdAt: r.created_at,
      }));
    },
    async () => {
      const list = await readJson<StatEvent[]>("stat-events.json", []);
      return list.filter((e) => e.createdAt >= sinceIso);
    },
  );
}

// Upsert a member's presence heartbeat.
export async function heartbeat(email: string, name: string): Promise<void> {
  const now = new Date().toISOString();
  const e = lc(email);
  return store(
    async (sb) => {
      const { error } = await sb
        .from("presence")
        .upsert({ email: e, name, last_seen_at: now }, { onConflict: "email" });
      if (error) throw error;
    },
    async () => {
      const list = await readJson<Presence[]>("presence.json", []);
      const ex = list.find((p) => p.email === e);
      if (ex) {
        ex.lastSeenAt = now;
        ex.name = name;
      } else {
        list.push({ email: e, name, lastSeenAt: now });
      }
      await writeJson("presence.json", list);
    },
  );
}

type ChatSeen = { email: string; chatSeenAt: string };

// Heartbeat that a member is currently in the chat area. Kept separate from the
// site-wide presence table so browsing elsewhere doesn't count as "in chat".
export async function noteChatSeen(email: string): Promise<void> {
  const now = new Date().toISOString();
  const e = lc(email);
  return store(
    async (sb) => {
      const { error } = await sb
        .from("chat_presence")
        .upsert({ email: e, chat_seen_at: now }, { onConflict: "email" });
      if (error) throw error;
    },
    async () => {
      const list = await readJson<ChatSeen[]>("chat-presence.json", []);
      const ex = list.find((p) => p.email === e);
      if (ex) ex.chatSeenAt = now;
      else list.push({ email: e, chatSeenAt: now });
      await writeJson("chat-presence.json", list);
    },
  );
}

// Chat-area last-seen for a set of members, as { email -> chatSeenAt ISO }.
// Powers the online/last-seen status in the chat contact list.
export async function chatPresenceFor(
  emails: string[],
): Promise<Record<string, string>> {
  const uniq = Array.from(new Set(emails.map(lc).filter(Boolean)));
  if (uniq.length === 0) return {};
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("chat_presence")
        .select("email,chat_seen_at")
        .in("email", uniq);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const r of data ?? []) map[r.email] = r.chat_seen_at;
      return map;
    },
    async () => {
      const list = await readJson<ChatSeen[]>("chat-presence.json", []);
      const set = new Set(uniq);
      const map: Record<string, string> = {};
      for (const p of list) if (set.has(p.email)) map[p.email] = p.chatSeenAt;
      return map;
    },
  );
}

// Last-seen timestamps for a set of members, as { email -> lastSeenAt ISO }.
// Used to show online/last-seen status next to chat contacts.
export async function presenceFor(
  emails: string[],
): Promise<Record<string, string>> {
  const uniq = Array.from(new Set(emails.map(lc).filter(Boolean)));
  if (uniq.length === 0) return {};
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("presence")
        .select("email,last_seen_at")
        .in("email", uniq);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const r of data ?? []) map[r.email] = r.last_seen_at;
      return map;
    },
    async () => {
      const list = await readJson<Presence[]>("presence.json", []);
      const set = new Set(uniq);
      const map: Record<string, string> = {};
      for (const p of list) if (set.has(p.email)) map[p.email] = p.lastSeenAt;
      return map;
    },
  );
}

// Members seen since a cutoff (the "online now" list), most-recent first.
export async function onlineUsers(sinceIso: string): Promise<Presence[]> {
  return store(
    async (sb) => {
      const { data, error } = await sb
        .from("presence")
        .select("*")
        .gte("last_seen_at", sinceIso)
        .order("last_seen_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        email: r.email,
        name: r.name ?? "",
        lastSeenAt: r.last_seen_at,
      }));
    },
    async () => {
      const list = await readJson<Presence[]>("presence.json", []);
      return list
        .filter((p) => p.lastSeenAt >= sinceIso)
        .sort((a, b) => (a.lastSeenAt < b.lastSeenAt ? 1 : -1));
    },
  );
}
