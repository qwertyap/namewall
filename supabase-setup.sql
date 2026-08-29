-- NameWall - Supabase setup
-- Paste this whole file into Supabase -> SQL Editor -> New query -> Run.

create table if not exists public.names (
  id          bigint generated always as identity primary key,
  name        text not null check (char_length(btrim(name)) between 2 and 40),
  created_at  timestamptz not null default now()
);

create index if not exists names_created_at_idx on public.names (created_at desc);

alter table public.names enable row level security;

-- Anyone (even signed out) can read the wall.
drop policy if exists "anyone can read names" on public.names;
create policy "anyone can read names"
  on public.names for select
  to anon, authenticated
  using (true);

-- Anyone can add a valid name...
drop policy if exists "anyone can add a name" on public.names;
create policy "anyone can add a name"
  on public.names for insert
  to anon, authenticated
  with check (char_length(btrim(name)) between 2 and 40);

-- ...but nobody can edit or delete (no update/delete policy = denied).

-- Stream new rows to every open app in real time.
-- Wrapped so re-running the file does not fail with
-- "relation is already member of publication" (SQLSTATE 42710).
do $$
begin
  alter publication supabase_realtime add table public.names;
exception
  when duplicate_object then null;
end $$;

