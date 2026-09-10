-- SkyHunter — Supabase schema.
-- Run this once in your Supabase project: SQL Editor → paste → Run.
-- All access is server-side via the service_role key, which bypasses RLS.
-- RLS is enabled with no policies so the anon/public key can't read these.

create table if not exists public.users (
  email         text primary key,
  name          text not null,
  password_hash text,
  provider      text,
  is_admin      boolean not null default false,
  profile       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create table if not exists public.pending_signups (
  email         text primary key,
  name          text not null,
  password_hash text not null,
  profile       jsonb not null default '{}'::jsonb,
  code          text not null,
  expires_at    bigint not null,
  attempts      int not null default 0
);

create table if not exists public.registrations (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  name          text,
  email         text,
  previous_role text,
  industry      text,
  situation     text,
  location      text
);

create table if not exists public.jobs (
  id         text primary key,
  data       jsonb not null,
  sort       int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  type       text not null,
  title      text not null,
  body       text not null default '',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_email_idx on public.notifications (email);

create table if not exists public.applications (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  job_id     text not null,
  job_title  text not null default '',
  status     text not null default 'applied',
  note       text not null default '',
  created_at timestamptz not null default now(),
  unique (email, job_id)
);
create index if not exists applications_email_idx on public.applications (email);
-- If the applications table already exists from an earlier deploy, add the note
-- column (the app degrades gracefully until this is run):
alter table public.applications add column if not exists note text not null default '';

create table if not exists public.intro_requests (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  name          text not null default '',
  partner       text not null,
  role          text not null default '',
  contact_email text not null default '',
  phone         text not null default '',
  message       text not null default '',
  status        text not null default 'pending',
  scheduled_at  timestamptz,
  meeting_link  text not null default '',
  schedule_note text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists intro_requests_email_idx on public.intro_requests (email);
-- add contact columns to any pre-existing table
alter table public.intro_requests add column if not exists contact_email text not null default '';
alter table public.intro_requests add column if not exists phone text not null default '';
alter table public.intro_requests add column if not exists message text not null default '';
-- schedule columns (admin schedules & sends the interview to the member)
alter table public.intro_requests add column if not exists scheduled_at  timestamptz;
alter table public.intro_requests add column if not exists meeting_link  text not null default '';
alter table public.intro_requests add column if not exists schedule_note text not null default '';

-- Real-time chat: conversations (support: member↔admins; contract: member↔member)
-- and their messages. Access is enforced in the app (service-role key).
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  kind            text not null default 'support',
  participants    text[] not null default '{}',
  title           text not null default '',
  last_message    text not null default '',
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now()
);
create index if not exists conversations_participants_idx
  on public.conversations using gin (participants);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_email    text not null,
  sender_name     text not null default '',
  body            text not null,
  created_at      timestamptz not null default now()
);
create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

-- Reply threading + edit marker (added after initial launch).
alter table public.messages add column if not exists reply_to_id uuid;
alter table public.messages add column if not exists edited_at   timestamptz;

-- Per-(conversation, member) "last read" markers that drive unread badges.
-- One row per participant per conversation; upserted whenever they view a chat.
create table if not exists public.chat_reads (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  email           text not null,
  last_read_at    timestamptz not null default now(),
  primary key (conversation_id, email)
);

-- Lightweight analytics: one row per tracked event (visits, logins). Signups
-- are derived from users.created_at, so they aren't duplicated here.
create table if not exists public.stat_events (
  id         uuid primary key default gen_random_uuid(),
  type       text not null,
  email      text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists stat_events_created_idx on public.stat_events (created_at);

-- Online presence: heartbeats from signed-in users on ANY page. "Online" = a
-- recent last_seen_at. Powers the admin Analytics "online now" list.
create table if not exists public.presence (
  email        text primary key,
  name         text not null default '',
  last_seen_at timestamptz not null default now()
);
create index if not exists presence_seen_idx on public.presence (last_seen_at);

-- Chat presence: heartbeats sent ONLY while a member is in the Messages area.
-- Drives the online/last-seen status shown in the chat contact list, so someone
-- browsing elsewhere on the site doesn't read as "online" in a chat.
create table if not exists public.chat_presence (
  email        text primary key,
  chat_seen_at timestamptz not null default now()
);

-- Voice calls: WebRTC signaling + ring state. One row per call attempt. The
-- offer/answer SDP are exchanged here (non-trickle: ICE candidates are bundled
-- into the SDP), then audio flows peer-to-peer — no media touches the server.
-- Rows are short-lived; leaving old ones around is harmless.
create table if not exists public.calls (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  caller          text not null,
  caller_name     text not null default '',
  callee          text not null,
  callee_name     text not null default '',
  status          text not null default 'ringing', -- ringing|active|ended|declined|missed
  offer           text,
  answer          text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists calls_callee_idx on public.calls (callee, status, updated_at);
create index if not exists calls_caller_idx on public.calls (caller, updated_at);

alter table public.stat_events     enable row level security;
alter table public.presence        enable row level security;
alter table public.chat_presence   enable row level security;
alter table public.calls           enable row level security;
alter table public.users           enable row level security;
alter table public.pending_signups enable row level security;
alter table public.registrations   enable row level security;
alter table public.jobs            enable row level security;
alter table public.content         enable row level security;
alter table public.notifications   enable row level security;
alter table public.applications    enable row level security;
alter table public.intro_requests  enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;

-- Tip: to make yourself an admin after signing up, either add your email to the
-- ADMIN_EMAILS env var, or run:
--   update public.users set is_admin = true where email = 'you@example.com';
