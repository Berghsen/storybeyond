-- Create stories table
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.stories enable row level security;

-- Add release_at for scheduling if not present
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='stories' and column_name='release_at') then
    alter table public.stories add column release_at timestamptz;
    update public.stories set release_at = now() where release_at is null;
    alter table public.stories alter column release_at set default now();
  end if;
end $$;

-- Policy: Users can insert their own stories (user_id comes from auth.uid())
create policy if not exists "insert_own_stories"
on public.stories for insert
with check (auth.uid() = user_id);

-- Policy: Users can select only their own stories
create policy if not exists "select_own_stories"
on public.stories for select
using (auth.uid() = user_id);

-- Force PostgREST to reload schema after DDL
notify pgrst, 'reload schema';

-- Policy: Users can update only their own stories
create policy if not exists "update_own_stories"
on public.stories for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: Users can delete only their own stories
create policy if not exists "delete_own_stories"
on public.stories for delete
using (auth.uid() = user_id);

-- Storage: ensure a public bucket exists (create manually in UI if needed)
-- Bucket name: story-images (public)

-- Recipients: people intended to receive stories
create table if not exists public.recipients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  first_name text,
  last_name text,
  relationship text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, email)
);

-- Ensure inserts can omit user_id (populated from auth.uid())
alter table public.recipients
  alter column user_id set default auth.uid();

alter table public.recipients enable row level security;

create policy if not exists "insert_own_recipients"
on public.recipients for insert
with check (auth.uid() = user_id);

create policy if not exists "select_own_recipients"
on public.recipients for select
using (auth.uid() = user_id);

create policy if not exists "update_own_recipients"
on public.recipients for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "delete_own_recipients"
on public.recipients for delete
using (auth.uid() = user_id);

-- Join table to associate recipients with stories
create table if not exists public.story_recipients (
  story_id uuid not null references public.stories(id) on delete cascade,
  recipient_id uuid not null references public.recipients(id) on delete cascade,
  user_id uuid not null, -- denormalized for simple RLS
  notify boolean not null default false,
  added_at timestamptz not null default now(),
  primary key (story_id, recipient_id)
);

alter table public.story_recipients enable row level security;

create policy if not exists "insert_own_story_recipients"
on public.story_recipients for insert
with check (auth.uid() = user_id);

create policy if not exists "select_own_story_recipients"
on public.story_recipients for select
using (auth.uid() = user_id);

-- Add avatar_url to recipients if not present
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='recipients' and column_name='avatar_url'
  ) then
    alter table public.recipients add column avatar_url text;
  end if;
end $$;


-- Profiles: basic user profile data
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy if not exists "select_own_profile"
on public.profiles for select
using (auth.uid() = user_id);

create policy if not exists "upsert_own_profile"
on public.profiles for insert
with check (auth.uid() = user_id);

create policy if not exists "update_own_profile"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Public read avatars
create policy if not exists "Public read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- Authenticated can upload avatars
create policy if not exists "Authenticated upload avatars"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars');

create policy if not exists "delete_own_story_recipients"
on public.story_recipients for delete
using (auth.uid() = user_id);


