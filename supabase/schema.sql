-- ==============================================================================
-- APEX Database Schema & RLS Policies (PostgreSQL / Supabase)
-- Based on ARCHITECTURE_AND_TESTING.md Section 2
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text default 'Athlete',
  title text default 'Athlete',
  experience text default 'Intermediate',
  goal text default 'Build Muscle',
  theme text default 'dark',
  height_cm numeric,
  weight_kg numeric,
  activity_level text default 'moderate',
  calories_target integer default 2400,
  protein_target integer default 180,
  carbs_target integer default 300,
  fat_target integer default 90,
  water_target_glasses integer default 8,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to create public.profile on auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', 'Athlete'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Exercises Library
create table if not exists public.exercises (
  id text primary key,
  name text not null,
  muscle text not null,
  category text not null,
  image text not null,
  equipment text not null,
  description text,
  target_sets_reps text,
  is_custom boolean default false,
  owner_id uuid references auth.users on delete cascade
);

alter table public.exercises enable row level security;

create policy "Exercises viewable by everyone"
  on public.exercises for select
  using (true);

create policy "Custom exercises insertable by owner"
  on public.exercises for insert
  with check (auth.uid() = owner_id);

-- 3. Workout Sessions
create table if not exists public.workout_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  duration_seconds integer default 0,
  session_rpe numeric,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workout_sessions enable row level security;

create policy "Users manage own workout sessions"
  on public.workout_sessions for all
  using (auth.uid() = user_id);

create index if not exists idx_sessions_user_date on public.workout_sessions(user_id, started_at);

-- 4. Set Logs
create table if not exists public.set_logs (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.workout_sessions on delete cascade not null,
  exercise_id text references public.exercises(id) on delete cascade not null,
  set_number integer not null,
  weight_kg numeric not null,
  reps integer not null,
  rpe numeric,
  is_warmup boolean default false,
  is_pr boolean default false,
  client_uuid text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.set_logs enable row level security;

create policy "Users manage own set logs"
  on public.set_logs for all
  using (
    exists (
      select 1 from public.workout_sessions
      where workout_sessions.id = set_logs.session_id
      and workout_sessions.user_id = auth.uid()
    )
  );

-- 5. Meals & Food Logs
create table if not exists public.meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  eaten_at timestamp with time zone default timezone('utc'::text, now()) not null,
  image_url text,
  total_kcal integer not null,
  total_protein numeric not null,
  total_carbs numeric not null,
  total_fat numeric not null,
  ai_verified boolean default true,
  confidence text default 'High',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.meals enable row level security;

create policy "Users manage own meals"
  on public.meals for all
  using (auth.uid() = user_id);

create index if not exists idx_meals_user_date on public.meals(user_id, eaten_at);

-- 6. Meal Items
create table if not exists public.meal_items (
  id uuid default uuid_generate_v4() primary key,
  meal_id uuid references public.meals on delete cascade not null,
  name text not null,
  grams numeric not null,
  kcal integer not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  confidence text default 'High',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.meal_items enable row level security;

create policy "Users manage own meal items"
  on public.meal_items for all
  using (
    exists (
      select 1 from public.meals
      where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
    )
  );

-- 7. Water Logs
create table if not exists public.water_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null,
  glasses integer not null default 1,
  ml integer not null default 250
);

alter table public.water_logs enable row level security;

create policy "Users manage own water logs"
  on public.water_logs for all
  using (auth.uid() = user_id);

-- 8. Recovery Checkins
create table if not exists public.recovery_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date default current_date not null,
  mood text not null,
  sleep_hours numeric not null,
  sleep_quality integer default 4,
  soreness_level numeric not null,
  energy_level numeric not null,
  stress_level numeric not null,
  readiness_score integer not null,
  readiness_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.recovery_checkins enable row level security;

create policy "Users manage own recovery checkins"
  on public.recovery_checkins for all
  using (auth.uid() = user_id);

create index if not exists idx_checkins_user_date on public.recovery_checkins(user_id, date);

-- 9. Seed Core Exercise Library
insert into public.exercises (id, name, muscle, category, image, equipment, description, target_sets_reps)
values
  ('back-squat', 'Back Squat', 'Strength', 'Strength', '/img/ex-back-squat.jpg', 'Barbell', 'Primary compound movement for lower-body power and quad development.', '4 × 5'),
  ('rdl', 'Bent Over Row / RDL', 'Strength', 'Strength', '/img/ex-rdl.jpg', 'Barbell', 'Posterior chain hinge targeting hamstrings, glutes, and lower back.', '3 × 8'),
  ('goblet-squat', 'Goblet Squat', 'Strength', 'Strength', '/img/ex-goblet-squat.jpg', 'Dumbbell', 'Anterior-loaded squat focusing on torso uprightness and quad depth.', '3 × 10'),
  ('kettlebell-swing', 'Kettlebell Swing', 'Power', 'HIIT', '/img/ex-kb-swing.jpg', 'Kettlebell', 'Explosive hip hinge developing posterior chain power and cardio capacity.', '3 × 12')
on conflict (id) do nothing;
