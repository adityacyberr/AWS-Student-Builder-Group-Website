# AWS Student Builder Group — RIMT University

Official website for the AWS Student Builder Group chapter at RIMT University. Built with **Next.js 16**, **Tailwind CSS 4**, and **Supabase** (Auth + Postgres + Storage).

> **Live CMS**: Team members sign into the admin dashboard from _any device_ to manage events, gallery, team profiles, achievements, announcements, and stats. Changes appear instantly for all public visitors.

---

## Quick Start (Local Development)

```bash
# 1. Clone & install
git clone <your-repo-url>
cd AWS-Student-Builder-Group-Website
npm install

# 2. (Optional) Set up Supabase — see section below
#    Without env vars, the site runs with local seed data

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup (Full CMS Mode)

Follow these steps to connect the site to a real Supabase backend so your team can edit content from any device.

### Step 1 — Create a Free Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (GitHub login works).
2. Click **New Project**.
3. Choose an organization, name your project (e.g., `aws-sbg-rimt`), set a database password, and pick a region close to your users (e.g., `South Asia (Mumbai)`).
4. Wait ~2 minutes for provisioning.

### Step 2 — Run the SQL Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar).
2. Click **New Query**.
3. Open [`supabase_schema.sql`](./supabase_schema.sql) from this repo and **paste the entire contents** into the editor.
4. Click **Run** (or press `Ctrl+Enter`).
5. You should see `Success. No rows returned` — this creates all tables, RLS policies, a storage bucket, and seeds initial data (6 team members, 1 placeholder event, gallery items, stats, settings, and 2 founding achievements).

> **Re-running is safe** — the script uses `IF NOT EXISTS`, `ON CONFLICT`, and `DROP POLICY IF EXISTS` so it won't duplicate data.

### Step 3 — Create Admin Accounts

Since there's no public signup, you manually create accounts for each team member:

1. Go to **Authentication** → **Users** in the Supabase dashboard.
2. Click **Add User** → **Create new user**.
3. Enter the team member's email and a password, then click **Create user**.
4. Repeat for each admin (e.g., `pranav@sbg-rimt.com`, `aditya@sbg-rimt.com`, etc.).

> **Important**: Any authenticated user has full write access via RLS policies. Only create accounts for trusted team members.

### Step 4 — Set Environment Variables

1. In your Supabase dashboard, go to **Project Settings** → **API**.
2. Copy the **Project URL** and the **anon/public** key.
3. Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

4. Fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. Restart the dev server:

```bash
npm run dev
```

### Step 5 — Verify It Works

1. Open [http://localhost:3000](http://localhost:3000) — the homepage should load with seed data from Supabase.
2. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin).
3. You should see the **Admin Authentication** login screen.
4. Sign in with one of the accounts you created in Step 3.
5. You're now in the admin dashboard with full CRUD for all content types.

---

## Deploy to Vercel

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com), click **New Project**, and import your repo.
3. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
4. Click **Deploy**.

After deployment, your team can access the admin dashboard at `https://your-site.vercel.app/admin` from any phone, tablet, or laptop.

---

## Admin Dashboard Walkthrough

### Logging In
1. Go to `/admin` on your deployed site.
2. Enter your email and password (created in Supabase Auth).
3. Click **Log In** — you'll land on the admin dashboard with a sidebar listing all content sections.

### Uploading a Gallery Image
1. Click **Manage Gallery** in the sidebar.
2. Click **Add Gallery Image**.
3. Fill in the title, date, category, and description.
4. Click the **upload icon** next to the image field — select a photo from your device.
5. The photo uploads to Supabase Storage and the URL auto-fills.
6. Click **Publish Image**.
7. Go to `/gallery` — your photo appears instantly for all visitors.

### Editing an Event
1. Click **Manage Events** in the sidebar.
2. Find the event in the table and click the **pencil icon**.
3. Edit the title, date, time, description, or status.
4. Click **Save Event**.
5. Go to `/events` — the changes are live immediately.

### Managing Team Members
1. Click **Manage Team** in the sidebar.
2. Click **Add Builder** to add a new team member, or click the pencil icon to edit existing ones.
3. Upload a profile photo, fill in all fields, and click **Save Profile**.
4. Go to `/team` — the new/updated member card and modal appear instantly.

### Creating Announcements
1. Click **Announcements** in the sidebar.
2. Click **Create Announcement**, fill in title, content, and date.
3. Check **Show as active banner** to display it on the homepage.
4. Click **Save Banner** — the homepage now shows the announcement banner.

---

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Homepage (reads events, stats, announcements from Supabase)
│   ├── events/               # Events listing + [slug] detail pages
│   ├── team/                 # Team grid + org hierarchy + member modals
│   ├── gallery/              # Photo gallery with category filters
│   ├── achievements/         # Timeline of milestones
│   ├── admin/                # Protected admin dashboard (auth + CRUD for all content)
│   ├── about/                # About page
│   └── contact/              # Contact page
├── components/
│   ├── Header.tsx            # Sticky nav with responsive mobile menu
│   └── Footer.tsx            # Site footer
├── data/
│   ├── events.ts             # Local seed data + types (fallback when no Supabase)
│   ├── team.ts               # Local team data + types
│   └── achievements.ts       # Local achievements + gallery data + types
└── lib/
    └── supabase.ts           # Supabase client (null if env vars missing)
```

### Data Flow

```
Public visitor → page loads → checks isSupabaseConfigured
  ├─ YES → fetches from Supabase Postgres (live data)
  └─ NO  → uses local seed data from src/data/

Admin user → /admin → Supabase Auth login
  → CRUD operations → writes to Supabase Postgres
  → Image uploads → writes to Supabase Storage
  → Changes visible instantly on public pages
```

### Security Model

| Actor | Read | Write |
|-------|------|-------|
| Public / anonymous | ✅ All published content | ❌ Blocked by RLS |
| Authenticated admin | ✅ All content | ✅ Insert / Update / Delete |

RLS is enforced at the **database level** — even if someone finds the admin UI, they can't write without a valid Supabase auth token.

---

## Supabase Tables

| Table | Purpose |
|-------|---------|
| `events` | Workshops, hackathons, meetups, webinars |
| `team_members` | Core team profiles with photos and socials |
| `gallery_images` | Event/workshop photos with upload support |
| `achievements` | Community milestones timeline |
| `announcements` | Homepage banner messages with active toggle |
| `homepage_stats` | Hero section counter values (Members, Bootcamps, etc.) |
| `site_settings` | Global config (Meetup URL, contact email) |

---

## Fallback Behavior

If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set:

- The site runs fully with **local seed data** from `src/data/`.
- The admin dashboard enters **Sandbox Mode** — edits save to `localStorage` (browser-only).
- The site **never looks broken** — all pages render with placeholder content.

This is useful for local development without setting up Supabase.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Icons**: Lucide React
- **Fonts**: Amazon Ember Display (custom loaded)
- **Deployment**: Vercel (recommended)

---

## License

Internal project — AWS Student Builder Group, RIMT University.
