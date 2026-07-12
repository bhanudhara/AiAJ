-- =====================================================================
-- AiAJ schema + auth trigger + role-based RLS
-- Run this whole file in the Supabase SQL editor.
-- It is idempotent: safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Enum types
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_role') then
    create type profile_role as enum ('teacher', 'student');
  end if;
  if not exists (select 1 from pg_type where typname = 'attendance_status') then
    create type attendance_status as enum ('present', 'absent');
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role profile_role not null default 'student',
  full_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references profiles(id) on delete cascade,
  class_name text not null,
  date date not null default current_date
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  subject text not null,
  topic_name text not null
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  status attendance_status not null
);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  date date not null,
  total_score numeric not null default 0,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists assessment_details (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade,
  topic_id uuid references topics(id) on delete cascade,
  score numeric not null default 0,
  recommendation_urls text[] not null default '{}'
);

-- ---------------------------------------------------------------------
-- 3. Auth trigger: create a profile automatically when a new auth user
--    is created. Reads full_name / role from the signUp metadata.
--    SECURITY DEFINER so it can bypass RLS during insert.
--
--    THIS is what fixes "Database error saving new user":
--    the previous trigger failed because profiles.role / full_name were
--    NOT NULL with no value. This version always supplies safe values.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'student')::profile_role,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop any old/broken trigger and recreate it cleanly.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 4. Helper: current user's role (SECURITY DEFINER to avoid RLS
--    recursion when used inside policies on the profiles table).
-- ---------------------------------------------------------------------
create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- 5. Enable Row Level Security
-- ---------------------------------------------------------------------
alter table profiles          enable row level security;
alter table classes           enable row level security;
alter table topics            enable row level security;
alter table attendance        enable row level security;
alter table assessments       enable row level security;
alter table assessment_details enable row level security;

-- ---------------------------------------------------------------------
-- 6. Policies (drop-then-create so this file stays idempotent)
-- ---------------------------------------------------------------------

-- profiles ------------------------------------------------------------
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles
  for select to authenticated
  using (id = auth.uid() or public.current_app_role() = 'teacher');

drop policy if exists profiles_insert on profiles;
create policy profiles_insert on profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- classes -------------------------------------------------------------
drop policy if exists classes_select on classes;
create policy classes_select on classes
  for select to authenticated
  using (true);

drop policy if exists classes_write on classes;
create policy classes_write on classes
  for all to authenticated
  using (public.current_app_role() = 'teacher' and teacher_id = auth.uid())
  with check (public.current_app_role() = 'teacher' and teacher_id = auth.uid());

-- topics --------------------------------------------------------------
drop policy if exists topics_select on topics;
create policy topics_select on topics
  for select to authenticated
  using (true);

drop policy if exists topics_write on topics;
create policy topics_write on topics
  for all to authenticated
  using (public.current_app_role() = 'teacher')
  with check (public.current_app_role() = 'teacher');

-- attendance ----------------------------------------------------------
drop policy if exists attendance_select on attendance;
create policy attendance_select on attendance
  for select to authenticated
  using (student_id = auth.uid() or public.current_app_role() = 'teacher');

drop policy if exists attendance_write on attendance;
create policy attendance_write on attendance
  for all to authenticated
  using (public.current_app_role() = 'teacher')
  with check (public.current_app_role() = 'teacher');

-- assessments ---------------------------------------------------------
drop policy if exists assessments_select on assessments;
create policy assessments_select on assessments
  for select to authenticated
  using (student_id = auth.uid() or public.current_app_role() = 'teacher');

drop policy if exists assessments_insert on assessments;
create policy assessments_insert on assessments
  for insert to authenticated
  with check (student_id = auth.uid());

drop policy if exists assessments_update on assessments;
create policy assessments_update on assessments
  for update to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- assessment_details --------------------------------------------------
drop policy if exists assessment_details_select on assessment_details;
create policy assessment_details_select on assessment_details
  for select to authenticated
  using (
    exists (
      select 1 from assessments a
      where a.id = assessment_details.assessment_id
        and (a.student_id = auth.uid() or public.current_app_role() = 'teacher')
    )
  );

drop policy if exists assessment_details_insert on assessment_details;
create policy assessment_details_insert on assessment_details
  for insert to authenticated
  with check (
    exists (
      select 1 from assessments a
      where a.id = assessment_details.assessment_id
        and a.student_id = auth.uid()
    )
  );

-- =====================================================================
-- NOTE for n8n + Gemini writes:
-- Use the SERVICE ROLE key in n8n (server-side only). The service role
-- bypasses RLS, so n8n can write assessments / assessment_details /
-- summaries without hitting the policies above. Never expose the
-- service role key to the browser.
-- =====================================================================
