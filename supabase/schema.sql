create type profile_role as enum ('teacher', 'student');
create type attendance_status as enum ('present', 'absent');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role profile_role not null,
  full_name text not null
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
  weaknesses text[] not null default '{}'
);

create table if not exists assessment_details (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade,
  topic_id uuid references topics(id) on delete cascade,
  score numeric not null default 0,
  recommendation_urls text[] not null default '{}'
);
