create extension if not exists pgcrypto;
create table if not exists public.films (
 id uuid primary key default gen_random_uuid(),
 tmdb_id integer unique,
 title text not null,
 year integer,
 poster text,
 overview text,
 slava numeric(3,1) check(slava between 0 and 10),
 veronika numeric(3,1) check(veronika between 0 and 10),
 created_at timestamptz not null default now()
);
alter table public.films enable row level security;
-- No public RLS policies: only server-side service-role can access films.
