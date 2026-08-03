-- ============================================================
-- Certificate Portal Migration
-- Run in Supabase SQL Editor to add certificate tables.
-- This script is IDEMPOTENT — safe to re-run without errors.
-- ============================================================

-- 1. Certificate Events Table
create table if not exists public.certificate_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  template_url text,
  name_x real not null default 50,
  name_y real not null default 55,
  font_family text not null default 'Amazon Ember Display',
  font_size real not null default 48,
  font_weight text not null default 'bold',
  text_color text not null default '#1a1a2e',
  text_align text not null default 'center' check (text_align in ('left', 'center', 'right')),
  is_published boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Certificate Participants Table
create table if not exists public.certificate_participants (
  id uuid default gen_random_uuid() primary key,
  event_id uuid not null references public.certificate_events(id) on delete cascade,
  roll_number text not null,
  participant_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_event_roll unique (event_id, roll_number)
);

-- Index for fast roll number lookups
create index if not exists idx_participants_roll on public.certificate_participants (roll_number);
create index if not exists idx_participants_event on public.certificate_participants (event_id);

-- 3. Certificate Downloads Audit Log
create table if not exists public.certificate_downloads (
  id uuid default gen_random_uuid() primary key,
  participant_id uuid not null references public.certificate_participants(id) on delete cascade,
  event_id uuid not null references public.certificate_events(id) on delete cascade,
  downloaded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ip_address text
);

create index if not exists idx_downloads_event on public.certificate_downloads (event_id);
create index if not exists idx_downloads_participant on public.certificate_downloads (participant_id);

-- 4. ROW LEVEL SECURITY

-- Certificate Events
alter table public.certificate_events enable row level security;

drop policy if exists "Public can view published certificate events" on public.certificate_events;
create policy "Public can view published certificate events"
  on public.certificate_events for select
  using (is_published = true);

drop policy if exists "Authenticated users can manage certificate events" on public.certificate_events;
create policy "Authenticated users can manage certificate events"
  on public.certificate_events for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Certificate Participants
alter table public.certificate_participants enable row level security;

drop policy if exists "Public can lookup participants by roll number" on public.certificate_participants;
create policy "Public can lookup participants by roll number"
  on public.certificate_participants for select
  using (true);

drop policy if exists "Authenticated users can manage participants" on public.certificate_participants;
create policy "Authenticated users can manage participants"
  on public.certificate_participants for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Certificate Downloads
alter table public.certificate_downloads enable row level security;

drop policy if exists "Anyone can insert download logs" on public.certificate_downloads;
create policy "Anyone can insert download logs"
  on public.certificate_downloads for insert
  with check (true);

drop policy if exists "Authenticated users can view download logs" on public.certificate_downloads;
create policy "Authenticated users can view download logs"
  on public.certificate_downloads for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can manage download logs" on public.certificate_downloads;
create policy "Authenticated users can manage download logs"
  on public.certificate_downloads for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
