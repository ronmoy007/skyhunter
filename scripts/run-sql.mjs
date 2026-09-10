// Applies a SQL file to your Supabase Postgres.
// Connection comes from PG* env vars (PGHOST, PGPORT, PGUSER, PGPASSWORD,
// PGDATABASE) so no secret is stored in this file. Usage:
//   PGHOST=... PGPORT=... PGUSER=... PGPASSWORD=... PGDATABASE=postgres \
//     node scripts/run-sql.mjs supabase/schema.sql
import { readFile } from "node:fs/promises";
import pg from "pg";

const file = process.argv[2] || "supabase/schema.sql";
const sql = await readFile(file, "utf8");

const client = new pg.Client({ ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query(sql);
  console.log(`✓ Applied ${file}`);
} finally {
  await client.end();
}
