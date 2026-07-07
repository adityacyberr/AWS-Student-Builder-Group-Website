-- ============================================================
-- SQL Migration to create the speakers table and insert pre-fill data.
-- Run this in your Supabase SQL Editor to set up the speakers feature.
-- This script is IDEMPOTENT — safe to re-run.
-- ============================================================

-- 1. Create speakers table
create table if not exists public.speakers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  title text not null,
  bio text not null,
  image_url text,
  achievements text[] not null default '{}',
  social_links jsonb not null default '{}'::jsonb, -- linkedin, twitter, website
  event_id uuid references public.events(id) on delete set null,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  quote text,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.speakers enable row level security;

-- 3. Create RLS Policies
drop policy if exists "Allow public read speakers" on public.speakers;
create policy "Allow public read speakers" on public.speakers
  for select using (true);

drop policy if exists "Allow super admins and owners to manage speakers" on public.speakers;
create policy "Allow super admins and owners to manage speakers" on public.speakers
  for all to authenticated
  using (
    auth.uid() = owner_user_id or 
    (select portal_role from public.team_members where email = auth.jwt()->>'email') = 'Super Admin'
  )
  with check (
    auth.uid() = owner_user_id or 
    (select portal_role from public.team_members where email = auth.jwt()->>'email') = 'Super Admin'
  );

-- 4. Pre-fill Bhoomi Raut speaker details (idempotent insert)
do $$
declare
  k_event_id uuid;
  admin_user_id uuid;
begin
  -- Get the event id for 'kiroverse'
  select id into k_event_id from public.events where slug = 'kiroverse' limit 1;
  
  -- Get any Super Admin's owner_user_id from team_members to set as owner
  select owner_user_id into admin_user_id from public.team_members where portal_role = 'Super Admin' and owner_user_id is not null limit 1;

  -- Insert speaker if name 'Bhoomi Raut' does not exist
  if not exists (select 1 from public.speakers where name = 'Bhoomi Raut') then
    insert into public.speakers (
      name,
      title,
      bio,
      image_url,
      achievements,
      social_links,
      event_id,
      is_featured,
      sort_order,
      quote,
      owner_user_id,
      created_by,
      updated_by
    ) values (
      'Bhoomi Raut',
      'AWS Community Builder & Former AWS Cloud Club Captain',
      'AWS Community Builder (AI Engineering), AWS 3x Certified professional, AWS New Voices 2025 & 2026, Udemy Instructor and technology community leader. Founder & Former AWS Cloud Club Captain at Sanjivani College of Engineering. Delivered 11+ talks across AWS Community Days, AWS Global Community Gatherings, and AWS Student Community Days.',
      '/events/bhoomi-raut.png',
      array['AWS Community Builder (AI Engineering)', 'AWS 3x Certified', 'AWS New Voices 2025 & 2026', 'Former AWS Cloud Club Captain', '11+ Talks & Workshops', 'Udemy Instructor'],
      '{"linkedin": "https://www.linkedin.com/in/bhoomi-ganesh-raut", "twitter": "", "website": ""}'::jsonb,
      k_event_id,
      true,
      0,
      'Building the future with cloud, code and community.',
      admin_user_id,
      admin_user_id,
      admin_user_id
    );
  end if;
end $$;
