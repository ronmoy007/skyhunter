// One-off: upsert the 30+ remote/hourly jobs into the live Supabase jobs table.
// The jobs table is authoritative (the app serves DB rows when the table is
// non-empty), so new listings must land here to appear on the site.
//
//   node scripts/seed-remote-jobs.mjs
//
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

// Minimal .env reader (no dotenv dependency).
const env = {};
for (const line of readFileSync(join(root, ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const jobs = JSON.parse(
  readFileSync(join(root, "src", "lib", "remote-jobs.json"), "utf8"),
);

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

async function main() {
  // Find the current max sort so new listings slot in after existing ones.
  const existing = await rest("jobs?select=id,sort&order=sort.desc.nullslast");
  const maxSort = existing.reduce(
    (m, r) => Math.max(m, typeof r.sort === "number" ? r.sort : 0),
    0,
  );
  console.log(`Existing jobs: ${existing.length} (max sort ${maxSort})`);

  const now = new Date().toISOString();
  const rows = jobs.map((job, i) => ({
    id: job.id,
    data: { ...job, status: job.status || "Hiring" },
    sort: maxSort + 1 + i,
    updated_at: now,
  }));

  // Upsert by primary key (id). resolution=merge-duplicates makes it idempotent.
  await rest("jobs?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });

  const after = await rest("jobs?select=id");
  console.log(`Upserted ${rows.length} remote jobs. Table now has ${after.length} rows.`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
