# Connect SkyHunter to Supabase (+ the admin site)

The app works **without** Supabase (it uses local JSON files under `.data/`).
Point it at Supabase to get a real, persistent, multi-user database.

## 1. Create the project & tables
1. Create a project at https://supabase.com.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and **Run**.
   This creates the `users`, `pending_signups`, `registrations`, `jobs`, and
   `content` tables (with RLS on — only the server-side service key can touch them).

## 2. Add your keys to `.env`
From **Project Settings → API**, copy:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # "service_role" key — server only, keep secret
```

> The service role key bypasses RLS and must never be exposed to the browser.
> It's only imported in server code (`src/lib/supabase.ts`).

Restart the dev server. The admin header will show **"Supabase connected"**.

## 3. Become an admin
Admins can reach `/admin`. Two ways to become one:
- **Easiest:** set `ADMIN_EMAILS` in `.env` (comma-separated), then sign up with
  that email:
  ```bash
  ADMIN_EMAILS=you@example.com,teammate@example.com
  ```
- **Or** in Supabase, after signing up:
  ```sql
  update public.users set is_admin = true where email = 'you@example.com';
  ```

Your account menu (top-right) will then show **"Admin dashboard"**.

## 4. The admin site — `/admin`
- **Dashboard** — totals and breakdowns (by month, provider, industry, situation, country).
- **Users** — search, grant/revoke admin, delete accounts.
- **Signups** — every signup that was recorded.
- **Jobs** — add / edit / delete job listings (JSON). On Supabase, click
  **"Load default jobs"** once to copy the built-in roles into the DB.
- **Content** — edit any community/site section (principles, offerings, members,
  stories, resources, …) as JSON. Changes go live immediately; clear a section
  to fall back to the built-in defaults.

## Notes
- **Data model:** the storage adapter (`src/lib/store.ts`) uses Supabase when the
  keys are set and the local file store otherwise — the same code path either way.
- **Auth is unchanged** (password + 6-digit email code + Google/LinkedIn). Supabase
  just stores the data; users are still authenticated by the app's own session cookies.
- **Migrating existing local data:** if you tested locally first, your users live in
  `.data/users.json`. You can insert them into the `users` table manually, or just
  start fresh once Supabase is connected.
