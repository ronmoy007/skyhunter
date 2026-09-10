// Seeds the built-in default jobs into the Supabase `jobs` table.
// Uses the canonical seed from src/lib/jobs.ts (no duplicated data).
// Run:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-jobs.mjs
import { createClient } from "@supabase/supabase-js";
import { JOBS } from "../src/lib/jobs.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const rows = JOBS.map((job, i) => ({
  id: job.id,
  data: { ...job, status: job.status ?? "Hiring" },
  sort: i,
  updated_at: new Date().toISOString(),
}));

const { error } = await sb.from("jobs").upsert(rows, { onConflict: "id" });
if (error) {
  console.error("Seed failed:", error);
  process.exit(1);
}
console.log(`✓ Seeded ${rows.length} jobs into Supabase.`);
