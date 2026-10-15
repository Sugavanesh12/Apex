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
  secondary_muscles text[],
  category text not null,
  image text not null,
  video_url text,
  equipment text not null,
  difficulty text default 'Intermediate',
  description text,
  target_sets_reps text,
  form_cues text[],
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

-- 9. Seed Core Exercise & Mobility Library
insert into public.exercises (id, name, muscle, secondary_muscles, category, image, video_url, equipment, difficulty, description, target_sets_reps, form_cues)
values
  ('deficit-sumo-squat', 'Deficit Dumbbell Sumo Deadlift', 'Glutes', array['Adductors', 'Hamstrings', 'Quads'], 'Strength', '/img/ex-sumo-squat-3d.png', '/video/demo-workout.webm', 'Dumbbell & Plates', 'Intermediate', 'Elevated stance on bumper plates maximizing depth and adductor/glute elongation at the bottom of the hinge.', '4 × 10', array['Elevate feet on 20kg bumper plates for extended range of motion', 'Wide stance with toes pointed outwards at 45 degrees', 'Maintain upright torso, hinge hips back and drive through heels', 'Squeeze glutes hard at full lockout without hyperextending']),
  ('back-squat', 'Barbell Back Squat', 'Quads', array['Glutes', 'Hamstrings', 'Core'], 'Strength', '/img/ex-back-squat.jpg', '/video/demo-workout.webm', 'Barbell', 'Intermediate', 'Primary compound movement for lower-body power and quad development.', '4 × 5', array['Set bar on mid-traps, pull elbows down to create upper back shelf', 'Brace core 360 degrees before descent', 'Break at hips and knees simultaneously', 'Drive through mid-foot']),
  ('front-squat', 'Barbell Front Squat', 'Quads', array['Core', 'Upper Back'], 'Strength', '/img/ex-back-squat.jpg', '/video/demo-workout.webm', 'Barbell', 'Advanced', 'Anterior-loaded squat demanding immense thoracic extension and direct quadriceps recruitment.', '3 × 6', array['Fingertip grip with high elbows parallel to the floor', 'Stay completely upright throughout']),
  ('rdl', 'Romanian Deadlift (RDL)', 'Hamstrings', array['Glutes', 'Erectors'], 'Strength', '/img/ex-rdl.jpg', '/video/demo-workout.webm', 'Barbell', 'Intermediate', 'Posterior chain hinge targeting hamstrings, glutes, and lower back.', '3 × 8', array['Slight soft bend in the knees kept constant', 'Push hips back as far as possible', 'Keep bar skimming down thighs and shins']),
  ('bulgarian-split-squat', 'Bulgarian Split Squat', 'Quads', array['Glutes', 'Adductors'], 'Hypertrophy', '/img/ex-back-squat.jpg', '/video/demo-workout.webm', 'Dumbbells & Bench', 'Intermediate', 'Unilateral gold standard for eliminating left-right imbalances.', '3 × 10', array['Rear foot flat on bench behind you', 'Drop rear knee straight down toward ground', 'Maintain slight forward torso lean for glute bias']),
  ('goblet-squat', 'Goblet Squat', 'Quads', array['Glutes', 'Core'], 'Strength', '/img/ex-goblet-squat.jpg', '/video/demo-workout.webm', 'Dumbbell', 'Beginner', 'Anterior-loaded squat focusing on torso uprightness and quad depth.', '3 × 10', array['Hold dumbbell vertically against upper chest', 'Push elbows inside knees at the bottom to open hips']),
  ('bench-press', 'Barbell Flat Bench Press', 'Chest', array['Triceps', 'Front Delts'], 'Strength', '/img/ex-bench-press.jpg', '/video/demo-workout.webm', 'Barbell & Bench', 'Intermediate', 'Primary upper-body pushing compound for maximum pec, tricep, and anterior deltoid power.', '4 × 5', array['Plant feet flat with aggressive leg drive', 'Retract and depress shoulder blades into bench', 'Touch bar to lower sternum; flare elbows at 45-75 degrees']),
  ('incline-bench-press', 'Incline Barbell Bench Press', 'Chest', array['Front Delts', 'Triceps'], 'Strength', '/img/ex-bench-press.jpg', '/video/demo-workout.webm', 'Barbell & Incline Bench', 'Intermediate', 'Targets clavicular head with natural scapular movement.', '3 × 8', array['Set bench to 30 degrees incline', 'Lower bar slowly until touching upper chest']),
  ('overhead-press', 'Standing Overhead Press', 'Shoulders', array['Triceps', 'Core'], 'Strength', '/img/ex-overhead-press.jpg', '/video/demo-workout.webm', 'Barbell', 'Intermediate', 'True test of overhead vertical push power.', '4 × 5', array['Grip just outside shoulder width with vertical forearms', 'Squeeze glutes and quads to create a rigid pillar', 'Lock out overhead with head through the window']),
  ('pull-up', 'Strict Bodyweight Pull-Up', 'Back', array['Biceps', 'Rhomboids', 'Rear Delts'], 'Strength', '/img/ex-pullup.jpg', '/video/demo-workout.webm', 'Pull-up Bar', 'Intermediate', 'Gold standard vertical pull test. Builds wide V-taper lats.', '4 × 6', array['Overhand grip slightly wider than shoulders', 'Depress scapulae before bending elbows', 'Touch chest to bar']),
  ('barbell-hip-thrust', 'Barbell Glute Hip Thrust', 'Glutes', array['Hamstrings', 'Core'], 'Hypertrophy', '/img/ex-hip-thrust.jpg', '/video/demo-workout.webm', 'Barbell & Bench', 'Intermediate', 'Maximal glute contraction without spinal compression.', '4 × 10', array['Upper back against bench edge', 'Drive through heels to full lockout', 'Tuck chin and look forward']),
  ('barbell-bicep-curl', 'Standing Barbell Bicep Curl', 'Biceps', array['Forearms', 'Brachialis'], 'Hypertrophy', '/img/ex-bicep-curl.jpg', '/video/demo-workout.webm', 'Barbell', 'Intermediate', 'Heavy compound curl for arm thickness and peak.', '3 × 8', array['Elbows pinned to sides of torso', 'Curl bar in smooth arc without swinging hips', 'Squeeze at apex for 1 second']),
  ('tricep-pushdown-rope', 'Cable Triceps Rope Pushdown', 'Triceps', array['Forearms'], 'Hypertrophy', '/img/ex-tricep-pushdown.jpg', '/video/demo-workout.webm', 'Cable & Rope', 'Beginner', 'Isolates the lateral and medial heads of the triceps.', '3 × 12', array['Pin elbows to ribcage', 'Spread rope ends at bottom lockout', 'Control return to 90 degrees']),
  ('90-90-hip-mobility', '90/90 Hip Flow & Rotation', 'Hips', array['Glutes', 'Lower Back'], 'Mobility', '/img/ex-sumo-squat-3d.png', '/video/demo-workout.webm', 'Bodyweight / Mat', 'Beginner', 'Gold standard hip mobility protocol targeting internal and external hip rotation.', '3 × 8', array['Front leg bent at 90 degrees, back leg bent at 90 degrees', 'Keep chest tall and rotate pelvis forward over front shin']),
  ('kettlebell-swing', 'Explosive Kettlebell Swing', 'Hamstrings', array['Glutes', 'Core'], 'HIIT', '/img/ex-kb-swing.jpg', '/video/demo-workout.webm', 'Kettlebell', 'Intermediate', 'Explosive hip hinge developing posterior chain power and cardio capacity.', '4 × 15', array['Hike kettlebell high between legs', 'Snap hips forward into vertical plank', 'Bell floats weightlessly to chest height'])
on conflict (id) do nothing;

