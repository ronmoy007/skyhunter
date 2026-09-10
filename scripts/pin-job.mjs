// Upsert the "Developer Support (Remote)" job into the live Supabase jobs table
// and pin it to the TOP (jobsList orders by sort ascending, so lowest = first).
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync("E:/Projects/Job losted/.env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const jobs = JSON.parse(
  readFileSync("E:/Projects/Job losted/src/lib/remote-jobs.json", "utf8"),
);
const job = jobs.find((j) => j.id === "developer-support-remote");

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};
async function rest(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const rows = await rest("jobs?select=sort&order=sort.asc.nullsfirst&limit=1");
const minSort = rows.length && typeof rows[0].sort === "number" ? rows[0].sort : 0;
const sort = minSort - 1; // below everything -> shows first

await rest("jobs?on_conflict=id", {
  method: "POST",
  headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify([
    { id: job.id, data: job, sort, updated_at: new Date().toISOString() },
  ]),
});

console.log(`Pinned "${job.title}" at sort ${sort} (was min ${minSort}).`);
