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

alter table profiles enable row level security;
alter table classes enable row level security;
alter table topics enable row level security;
alter table attendance enable row level security;
alter table assessments enable row level security;
alter table assessment_details enable row level security;

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Teachers can view all profiles" on profiles;
create policy "Teachers can view all profiles"
  on profiles for select
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists "Students can view own profile" on profiles;
create policy "Students can view own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Anyone authenticated can view classes" on classes;
create policy "Anyone authenticated can view classes"
  on classes for select
  to authenticated
  using (true);

drop policy if exists "Teachers can manage classes" on classes;
create policy "Teachers can manage classes"
  on classes for all
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'teacher' and classes.teacher_id = p.id
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'teacher' and classes.teacher_id = p.id
    )
  );

drop policy if exists "Anyone authenticated can view topics" on topics;
create policy "Anyone authenticated can view topics"
  on topics for select
  to authenticated
  using (true);

drop policy if exists "Teachers can manage topics" on topics;
create policy "Teachers can manage topics"
  on topics for insert
  to authenticated
  with check (
    exists (
      select 1 from classes c
      join profiles p on p.id = c.teacher_id
      where c.id = topics.class_id and p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists "Teachers manage topics update delete" on topics;
create policy "Teachers manage topics update delete"
  on topics for update
  to authenticated
  using (
    exists (
      select 1 from classes c
      join profiles p on p.id = c.teacher_id
      where c.id = topics.class_id and p.id = auth.uid() and p.role = 'teacher'
    )
  )
  with check (
    exists (
      select 1 from classes c
      join profiles p on p.id = c.teacher_id
      where c.id = topics.class_id and p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists "Teachers delete topics" on topics;
create policy "Teachers delete topics"
  on topics for delete
  to authenticated
  using (
    exists (
      select 1 from classes c
      join profiles p on p.id = c.teacher_id
      where c.id = topics.class_id and p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists "Anyone authenticated can view attendance" on attendance;
create policy "Anyone authenticated can view attendance"
  on attendance for select
  to authenticated
  using (true);

drop policy if exists "Teachers can manage attendance" on attendance;
create policy "Teachers can manage attendance"
  on attendance for all
  to authenticated
  using (
    exists (
      select 1 from classes c
      join profiles p on p.id = c.teacher_id
      where c.id = attendance.class_id and p.id = auth.uid() and p.role = 'teacher'
    )
  )
  with check (
    exists (
      select 1 from classes c
      join profiles p on p.id = c.teacher_id
      where c.id = attendance.class_id and p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists "Students can view own assessment" on assessments;
create policy "Students can view own assessment"
  on assessments for select
  to authenticated
  using (auth.uid() = student_id);

drop policy if exists "Students can submit own assessment" on assessments;
create policy "Students can submit own assessment"
  on assessments for insert
  to authenticated
  with check (auth.uid() = student_id);

drop policy if exists "Teachers can view student assessments" on assessments;
create policy "Teachers can view student assessments"
  on assessments for select
  to authenticated
  using (
    exists (
      select 1 from classes c
      join attendance a on a.class_id = c.id
      join profiles p on p.id = c.teacher_id
      where assessments.student_id = a.student_id and c.id = a.class_id and p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists "Teachers can insert assessments" on assessments;
create policy "Teachers can insert assessments"
  on assessments for insert
  to authenticated
  with check (
    exists (
      select 1 from classes c
      join attendance a on a.class_id = c.id
      join profiles p on p.id = c.teacher_id
      where assessments.student_id = a.student_id and c.id = a.class_id and p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists "Students can view own assessment details" on assessment_details;
create policy "Students can view own assessment details"
  on assessment_details for select
  to authenticated
  using (
    auth.uid() in (select student_id from assessments where id = assessment_details.assessment_id)
  );

drop policy if exists "Students can insert own assessment details" on assessment_details;
create policy "Students can insert own assessment details"
  on assessment_details for insert
  to authenticated
  with check (
    auth.uid() in (select student_id from assessments where id = assessment_details.assessment_id)
  );
