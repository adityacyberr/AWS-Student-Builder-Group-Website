-- ============================================================
-- DDL for AWS Student Builder Group Website
-- Run this in your Supabase SQL Editor to set up tables, RLS policies, and storage.
-- This script is IDEMPOTENT — safe to re-run without errors.
-- ============================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES

-- Events Table
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  date text not null,
  time text,
  type text not null check (type in ('Workshop', 'Bootcamp', 'Meetup', 'Webinar', 'Hackathon', 'Celebration', 'Community Event', 'Other')),
  location text not null,
  description text not null,
  long_description text,
  registration_link text not null default 'https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups',
  status text not null check (status in ('upcoming', 'completed')),
  cover_placeholder_color text not null check (cover_placeholder_color in ('orange', 'blue', 'purple', 'mint', 'amber')),
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Team Members Table
create table if not exists public.team_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  branch text not null,
  specialization text not null,
  bio text not null,
  quote text not null,
  focus_areas text[] not null default '{}',
  initials text not null,
  theme_color text not null default 'orange',
  photo text,
  linkedin text not null default '',
  github text not null default '',
  email text,
  portal_role text not null default 'Member' check (portal_role in ('Super Admin', 'Editor', 'Member')),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_name_role unique (name, role)
);

-- Gallery Images Table
create table if not exists public.gallery_images (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date text not null,
  description text not null,
  category text not null check (category in ('events', 'workshops', 'labs', 'celebrations', 'community', 'achievements')),
  placeholder_color text not null default 'orange',
  image_url text,
  event_id uuid references public.events(id) on delete set null,
  instagram_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_gallery_title unique (title)
);

-- Achievements Table
create table if not exists public.achievements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date text not null,
  description text not null,
  badge_type text not null check (badge_type in ('charter', 'team', 'milestone')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_achievement_title unique (title)
);

-- Announcements Table
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  date text not null,
  active boolean default true not null,
  button_text text,
  destination_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Homepage Stats Table
create table if not exists public.homepage_stats (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  value text not null,
  display_order integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_stat_label unique (label)
);

-- Site Settings Table
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2b. MIGRATIONS — Add new columns to existing tables (idempotent)
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'is_active'
  ) then
    alter table public.team_members add column is_active boolean not null default true;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'updated_at'
  ) then
    alter table public.team_members add column updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'email'
  ) then
    alter table public.team_members add column email text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'portal_role'
  ) then
    alter table public.team_members add column portal_role text not null default 'Member' check (portal_role in ('Super Admin', 'Editor', 'Member'));
  end if;
end $$;

-- Alter check constraint on events type
do $$ begin
  alter table public.events drop constraint if exists events_type_check;
  alter table public.events add constraint events_type_check check (type in ('Workshop', 'Bootcamp', 'Meetup', 'Webinar', 'Hackathon', 'Celebration', 'Community Event', 'Other'));
exception
  when others then null;
end $$;

-- Alter gallery_images to add event_id and instagram_url columns & update category check constraint
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'gallery_images' and column_name = 'event_id'
  ) then
    alter table public.gallery_images add column event_id uuid references public.events(id) on delete set null;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'gallery_images' and column_name = 'instagram_url'
  ) then
    alter table public.gallery_images add column instagram_url text;
  end if;
end $$;

do $$ begin
  alter table public.gallery_images drop constraint if exists gallery_images_category_check;
  alter table public.gallery_images add constraint gallery_images_category_check check (category in ('events', 'workshops', 'labs', 'celebrations', 'community', 'achievements'));
exception
  when others then null;
end $$;

-- Migration to add button_text and destination_url columns to public.announcements
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'announcements' and column_name = 'button_text'
  ) then
    alter table public.announcements add column button_text text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'announcements' and column_name = 'destination_url'
  ) then
    alter table public.announcements add column destination_url text;
  end if;
end $$;

-- 2c. AUTO-UPDATE updated_at TRIGGER for team_members
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists team_members_updated_at on public.team_members;
create trigger team_members_updated_at
  before update on public.team_members
  for each row execute procedure public.handle_updated_at();

-- 2d. DUPLICATE CLEANUP RPC
-- Removes duplicate team_members rows, keeping the oldest (min created_at) per (name, role).
create or replace function public.delete_duplicate_team_members()
returns integer as $$
declare
  deleted_count integer;
begin
  with ranked as (
    select
      id,
      row_number() over (
        partition by lower(name), lower(role)
        order by created_at asc
      ) as rn
    from public.team_members
  ),
  to_delete as (
    select id from ranked where rn > 1
  )
  delete from public.team_members
  where id in (select id from to_delete);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql security definer;

-- 3. ENABLE RLS
alter table public.events enable row level security;
alter table public.team_members enable row level security;
alter table public.gallery_images enable row level security;
alter table public.achievements enable row level security;
alter table public.announcements enable row level security;
alter table public.homepage_stats enable row level security;
alter table public.site_settings enable row level security;

-- 4. RLS POLICIES — DROP THEN CREATE (idempotent)

-- Events
drop policy if exists "Allow public read events" on public.events;
create policy "Allow public read events" on public.events for select using (true);
drop policy if exists "Allow admin write events" on public.events;
create policy "Allow admin write events" on public.events for all to authenticated using (true) with check (true);

-- Team Members
drop policy if exists "Allow public read team_members" on public.team_members;
create policy "Allow public read team_members" on public.team_members for select using (true);
drop policy if exists "Allow admin write team_members" on public.team_members;
create policy "Allow admin write team_members" on public.team_members for all to authenticated using (true) with check (true);

-- Gallery Images
drop policy if exists "Allow public read gallery_images" on public.gallery_images;
create policy "Allow public read gallery_images" on public.gallery_images for select using (true);
drop policy if exists "Allow admin write gallery_images" on public.gallery_images;
create policy "Allow admin write gallery_images" on public.gallery_images for all to authenticated using (true) with check (true);

-- Achievements
drop policy if exists "Allow public read achievements" on public.achievements;
create policy "Allow public read achievements" on public.achievements for select using (true);
drop policy if exists "Allow admin write achievements" on public.achievements;
create policy "Allow admin write achievements" on public.achievements for all to authenticated using (true) with check (true);

-- Announcements
drop policy if exists "Allow public read announcements" on public.announcements;
create policy "Allow public read announcements" on public.announcements for select using (true);
drop policy if exists "Allow admin write announcements" on public.announcements;
create policy "Allow admin write announcements" on public.announcements for all to authenticated using (true) with check (true);

-- Homepage Stats
drop policy if exists "Allow public read homepage_stats" on public.homepage_stats;
create policy "Allow public read homepage_stats" on public.homepage_stats for select using (true);
drop policy if exists "Allow admin write homepage_stats" on public.homepage_stats;
create policy "Allow admin write homepage_stats" on public.homepage_stats for all to authenticated using (true) with check (true);

-- Site Settings
drop policy if exists "Allow public read site_settings" on public.site_settings;
create policy "Allow public read site_settings" on public.site_settings for select using (true);
drop policy if exists "Allow admin write site_settings" on public.site_settings;
create policy "Allow admin write site_settings" on public.site_settings for all to authenticated using (true) with check (true);

-- 5. STORAGE BUCKET CREATION
insert into storage.buckets (id, name, public)
values ('builder-assets', 'builder-assets', true)
on conflict (id) do nothing;

-- 6. STORAGE POLICIES (idempotent)
drop policy if exists "Allow public read storage" on storage.objects;
create policy "Allow public read storage" on storage.objects for select using (bucket_id = 'builder-assets');
drop policy if exists "Allow admin write storage" on storage.objects;
create policy "Allow admin write storage" on storage.objects for all to authenticated using (
  bucket_id = 'builder-assets'
) with check (
  bucket_id = 'builder-assets'
  and (
    lower(storage.extension(name)) = 'jpg' or 
    lower(storage.extension(name)) = 'jpeg' or 
    lower(storage.extension(name)) = 'png' or 
    lower(storage.extension(name)) = 'webp'
  )
);

-- ============================================================
-- 7. INITIAL SEED DATA
-- ============================================================

-- Seed events
insert into public.events (title, slug, date, time, type, location, description, long_description, registration_link, status, cover_placeholder_color)
values (
  'Yet to be announced',
  'yet-to-be-announced',
  'July 29, 2026',
  'TBA',
  'Meetup',
  'RIMT University Campus',
  'Details for this upcoming AWS developer meetup will be announced soon. Registrations will open shortly.',
  'Our team is coordinating the speaker schedule and topic details for the upcoming AWS Student Builder Group session on July 29, 2026. Join our community on Meetup to get notified as soon as registrations open.',
  'https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups',
  'upcoming',
  'orange'
) on conflict (slug) do nothing;

-- Seed team members
insert into public.team_members (name, role, branch, specialization, bio, quote, focus_areas, initials, theme_color, photo, linkedin, github, email, display_order, is_active, portal_role)
values 
('Pranav Bansal', 'Group Leader', 'B.Tech ECE', 'AI & ML', 'Founder and driving force behind the chapter, setting the vision and building the partnerships that bring it to life. Passionate about applying AI/ML and edge computing on the cloud, and about creating a space where every student can become a builder.', 'Building a community where students learn, innovate, and grow through cloud, Generative AI, and AWS.', array['Community Strategy', 'Generative AI', 'Cloud Architecture', 'Leadership'], 'PB', 'orange', '/team/pranav.jpg', 'https://www.linkedin.com/in/pranav-bansal-31ba4a261/', '', 'pranav@sbg-rimt.com', 1, true, 'Super Admin'),
('Aditya', 'Technical Head', 'B.Tech CSE', 'Cybersecurity', 'Leads all technical programming — hands-on workshops, cloud labs, and the club''s own infrastructure. A cybersecurity enthusiast focused on secure cloud practices, IAM, and teaching builders to ship projects safely.', 'Secure by design — building cloud skills the right way.', array['Cloud Security', 'IAM', 'Hands-on Labs', 'Web & Infrastructure'], 'AK', 'orange', '/team/aditya.jpg', 'https://www.linkedin.com/in/adityacyber/', '', 'adityacybersecurity@gmail.com', 2, true, 'Super Admin'),
('Amisha', 'Marketing Head', 'B.Tech CSE', 'AI & ML', 'Owns the club''s brand, content, and outreach, turning every event into reach across LinkedIn and Instagram. Drives community growth and makes sure the right students hear about us.', 'Telling the story of every builder.', array['Brand & Content', 'Social Growth', 'Outreach', 'Design'], 'AM', 'orange', '/team/amisha.jpg', 'https://www.linkedin.com/in/amisha-amisha-644aa3390/', '', 'amisha@sbg-rimt.com', 3, true, 'Editor'),
('Amber Prashar', 'Treasurer', 'B.Tech CSE', 'AI & ML', 'Manages budgets, sponsorships, and resource planning so events run smoothly and sustainably. Keeps the club''s operations financially healthy as it scales.', 'Making sure every resource builds something.', array['Budgeting', 'Sponsorships', 'Operations', 'Resource Planning'], 'AP', 'orange', '/team/amber.jpg', 'https://www.linkedin.com/in/amber-prashar-a57b65395/', '', 'amber@sbg-rimt.com', 4, true, 'Member'),
('Rohan Verma', 'Director of Photography', 'B.Tech CE', 'AI & ML', 'Documents every workshop and hackathon through photography, video, and visual storytelling — building the credibility archive that shows the world what the community does.', 'Capturing the moments that become our legacy.', array['Photography', 'Videography', 'Visual Storytelling', 'Media'], 'RV', 'orange', '/team/rohan.jpg', 'https://www.linkedin.com/in/rohan-verma-5a768b3b3/', '', 'rohan@sbg-rimt.com', 5, true, 'Member'),
('Rinku Bhalotiya', 'Event Head', 'B.Tech CSE', 'Software Engineering', 'Plans and runs workshops, bootcamps, and hackathons end-to-end, bridging industry mentors and student builders. Turns ideas into well-run events that people remember.', 'From idea to packed room.', array['Event Operations', 'Hackathons', 'Logistics', 'Partnerships'], 'RB', 'orange', '/team/rinku.jpg', 'https://www.linkedin.com/in/rinku-bhalotiya-7507003b3/', '', 'rinku@sbg-rimt.com', 6, true, 'Member')
on conflict (name, role) do update set
  is_active = coalesce(excluded.is_active, true),
  portal_role = coalesce(excluded.portal_role, team_members.portal_role),
  email = coalesce(excluded.email, team_members.email),
  updated_at = timezone('utc'::text, now());

-- Seed gallery
insert into public.gallery_images (title, date, description, category, placeholder_color)
values
('Inaugural Meetup Kickoff', 'June 2026', 'Snapshot of the launching session inside the School of Computing Seminar Hall, introducing AWS SBG.', 'events', 'blue'),
('Core Team Planning Session', 'June 2026', 'Brainstorming and roadmap planning session for upcoming AWS practitioner workshops.', 'labs', 'orange'),
('GenAI Hands-on Setup', 'July 2026 (Planned)', 'Configuring environment endpoints and Bedrock access keys for student sandbox labs.', 'workshops', 'purple')
on conflict (title) do nothing;

-- Seed achievements
insert into public.achievements (title, date, description, badge_type)
values
('Official Chapter Founded', 'June 2026', 'AWS Student Builder Group officially established at RIMT University under the DRI banner, founding the first student-led cloud engineering community on campus.', 'charter'),
('Core Team Assembled', 'June 2026', 'Six founding members onboarded across Technical, Marketing, Events, Photography, and Finance verticals to build the operational backbone of the chapter.', 'team')
on conflict (title) do nothing;

-- Seed stats
insert into public.homepage_stats (label, value, display_order)
values
('Members', '150+', 1),
('Bootcamps', '3+', 2),
('Hands-On', '100%', 3)
on conflict (label) do nothing;

-- Seed settings
insert into public.site_settings (key, value)
values
('meetup_url', 'https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups'),
('contact_email', 'sbg.rimt@gmail.com')
on conflict (key) do update set value = excluded.value;

-- Seed announcements
insert into public.announcements (title, content, date, active, button_text, destination_url)
select 'AWS Cloud Bootcamp registrations are now open.', 'Register today for our structured study track and get access to cloud sandbox environments.', 'June 22, 2025', true, 'Learn More', 'https://www.meetup.com/aws-sbg-at-rimt-university/'
where not exists (select 1 from public.announcements);
