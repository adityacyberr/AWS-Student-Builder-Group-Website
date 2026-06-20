-- =========================================================================
-- SQL Migration: Team Member Profile Ownership & Role Permissions Setup
-- Run this in your Supabase SQL Editor.
-- =========================================================================

-- 1. Ensure columns exist on team_members
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'owner_user_id') THEN
    ALTER TABLE public.team_members ADD COLUMN owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'portal_role') THEN
    ALTER TABLE public.team_members ADD COLUMN portal_role text NOT NULL DEFAULT 'Member' CHECK (portal_role IN ('Super Admin', 'Member'));
  END IF;
END $$;

-- 2. Clean up any invalid portal_role values (keep only 'Super Admin' or 'Member')
UPDATE public.team_members 
SET portal_role = 'Member' 
WHERE portal_role NOT IN ('Super Admin', 'Member');

-- 2b. Map existing seeded emails to their actual auth emails
UPDATE public.team_members SET email = 'pranavbansal1103@gmail.com' WHERE lower(name) LIKE '%pranav%';
UPDATE public.team_members SET email = 'adityajangra2008@gmail.com' WHERE lower(name) LIKE '%aditya%';
UPDATE public.team_members SET email = 'amishamishu29@gmail.com' WHERE lower(name) LIKE '%amisha%';
UPDATE public.team_members SET email = 'prasheramber@gmail.com' WHERE lower(name) LIKE '%amber%';
UPDATE public.team_members SET email = 'rvterry2020@gmail.com' WHERE lower(name) LIKE '%rohan%';
UPDATE public.team_members SET email = 'bhalotiyarinku0302@gmail.com' WHERE lower(name) LIKE '%rinku%';

-- 3. Match emails and backfill owner_user_id from auth.users
UPDATE public.team_members tm
SET owner_user_id = au.id
FROM auth.users au
WHERE lower(tm.email) = lower(au.email)
  AND tm.owner_user_id IS NULL;


-- 4. Force adityajangra2008@gmail.com to be Super Admin
UPDATE public.team_members
SET portal_role = 'Super Admin'
WHERE lower(email) = 'adityajangra2008@gmail.com';

-- If there's an auth user but no team member record, seed one
DO $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE lower(email) = 'adityajangra2008@gmail.com';
  IF user_id IS NOT NULL THEN
    INSERT INTO public.team_members (name, role, branch, specialization, bio, quote, initials, email, portal_role, owner_user_id)
    VALUES ('Aditya', 'Technical Head', 'B.Tech CSE', 'Cybersecurity', 'Super Admin for AWS SBG Chapter.', 'Building secure and scalable cloud architectures.', 'AJ', 'adityajangra2008@gmail.com', 'Super Admin', user_id)
    ON CONFLICT (name, role) DO UPDATE SET
      portal_role = 'Super Admin',
      owner_user_id = user_id,
      email = 'adityajangra2008@gmail.com';
  END IF;
END $$;

-- 5. Demote Pranav's portal role to 'Member' as per requirements:
-- "Pranav should only be able to edit Pranav's profile."
UPDATE public.team_members
SET portal_role = 'Member'
WHERE lower(name) LIKE '%pranav%';

-- 6. Setup RLS Policies for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read team_members" ON public.team_members;
CREATE POLICY "Allow public read team_members" ON public.team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "super_admin_insert_profiles" ON public.team_members;
CREATE POLICY "super_admin_insert_profiles"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT portal_role FROM public.team_members WHERE owner_user_id = auth.uid()) = 'Super Admin'
  );

DROP POLICY IF EXISTS "manage_own_profile_or_super_admin_update" ON public.team_members;
CREATE POLICY "manage_own_profile_or_super_admin_update"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_user_id
    OR (SELECT portal_role FROM public.team_members WHERE owner_user_id = auth.uid()) = 'Super Admin'
  )
  WITH CHECK (
    auth.uid() = owner_user_id
    OR (SELECT portal_role FROM public.team_members WHERE owner_user_id = auth.uid()) = 'Super Admin'
  );

DROP POLICY IF EXISTS "super_admin_delete_profiles" ON public.team_members;
CREATE POLICY "super_admin_delete_profiles"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (
    (SELECT portal_role FROM public.team_members WHERE owner_user_id = auth.uid()) = 'Super Admin'
  );

-- 7. Add database trigger to prevent non-Super Admins from editing restricted fields
CREATE OR REPLACE FUNCTION public.check_team_member_update()
RETURNS TRIGGER AS $$
DECLARE
  caller_role text;
BEGIN
  -- Check database role of current authenticated user
  SELECT portal_role INTO caller_role 
  FROM public.team_members 
  WHERE owner_user_id = auth.uid();

  -- If caller is not Super Admin, block edits to restricted fields
  IF caller_role IS NULL OR caller_role != 'Super Admin' THEN
    IF NEW.portal_role IS DISTINCT FROM OLD.portal_role THEN
      RAISE EXCEPTION 'Unauthorized: Members cannot change portal roles.';
    END IF;

    IF NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id THEN
      RAISE EXCEPTION 'Unauthorized: Members cannot change ownership fields.';
    END IF;

    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Unauthorized: Members cannot change linked email.';
    END IF;

    IF NEW.name IS DISTINCT FROM OLD.name THEN
      RAISE EXCEPTION 'Unauthorized: Members cannot change profile names.';
    END IF;

    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Unauthorized: Members cannot change roster roles.';
    END IF;

    IF NEW.display_order IS DISTINCT FROM OLD.display_order THEN
      RAISE EXCEPTION 'Unauthorized: Members cannot change display order.';
    END IF;

    IF NEW.initials IS DISTINCT FROM OLD.initials THEN
      RAISE EXCEPTION 'Unauthorized: Members cannot change initials.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_team_member_restrictions ON public.team_members;
CREATE TRIGGER enforce_team_member_restrictions
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.check_team_member_update();

CREATE OR REPLACE FUNCTION public.auto_map_team_member_owner()
RETURNS TRIGGER AS $$
DECLARE
  user_id uuid;
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email != '' AND NEW.owner_user_id IS NULL THEN
    SELECT id INTO user_id FROM auth.users WHERE lower(email) = lower(NEW.email);
    IF user_id IS NOT NULL THEN
      NEW.owner_user_id := user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS team_members_auto_map_owner ON public.team_members;
CREATE TRIGGER team_members_auto_map_owner
  BEFORE INSERT OR UPDATE OF email ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_map_team_member_owner();

-- =========================================================================
-- 9. Storage Security Policies for Profile Photos
-- =========================================================================

-- Drop existing write policies on storage.objects for builder-assets
DROP POLICY IF EXISTS "Allow admin write storage" ON storage.objects;
DROP POLICY IF EXISTS "admin_and_owner_write_storage" ON storage.objects;

-- Create policy allowing Super Admins full access, and Members restricted access to their own profile photos
CREATE POLICY "admin_and_owner_write_storage" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'builder-assets'
    AND (
      -- 1. Caller is a Super Admin
      (SELECT portal_role FROM public.team_members WHERE owner_user_id = auth.uid()) = 'Super Admin'
      -- 2. Or the file path starts with 'team-photos/' and the prefix matches their team member record id
      OR (
        name LIKE 'team-photos/%'
        AND split_part(substring(name FROM 13), '-', 1) = (
          SELECT id::text FROM public.team_members WHERE owner_user_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    bucket_id = 'builder-assets'
    AND (
      -- 1. Caller is a Super Admin
      (SELECT portal_role FROM public.team_members WHERE owner_user_id = auth.uid()) = 'Super Admin'
      -- 2. Or the file path starts with 'team-photos/', matches their ID, and is an allowed image format
      OR (
        name LIKE 'team-photos/%'
        AND split_part(substring(name FROM 13), '-', 1) = (
          SELECT id::text FROM public.team_members WHERE owner_user_id = auth.uid()
        )
        AND (
          lower(storage.extension(name)) = 'jpg' OR 
          lower(storage.extension(name)) = 'jpeg' OR 
          lower(storage.extension(name)) = 'png' OR 
          lower(storage.extension(name)) = 'webp'
        )
      )
    )
  );

