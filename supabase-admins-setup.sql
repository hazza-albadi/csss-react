-- CSSS Platform admin authorization setup for Supabase.
-- Run this in the Supabase SQL editor after reviewing the bootstrap note below.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null default '',
  role text not null default 'admin' check (role in ('super_admin', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admins
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists email text,
  add column if not exists full_name text default '',
  add column if not exists role text default 'admin',
  add column if not exists active boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.admins
set email = lower(trim(email))
where email is not null;

alter table public.admins
  alter column id set not null,
  alter column email set not null,
  alter column full_name set not null,
  alter column full_name set default '',
  alter column role set not null,
  alter column role set default 'admin',
  alter column active set not null,
  alter column active set default true,
  alter column created_at set not null,
  alter column created_at set default now(),
  alter column updated_at set not null,
  alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'admins_role_check'
      and conrelid = 'public.admins'::regclass
  ) then
    alter table public.admins
      add constraint admins_role_check check (role in ('super_admin', 'admin'));
  end if;
end;
$$;

create unique index if not exists admins_email_lower_unique
on public.admins (lower(email));

create unique index if not exists admins_email_unique
on public.admins (email);

create or replace function public.normalize_admin_email()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(trim(new.email));
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists admins_normalize_email on public.admins;
create trigger admins_normalize_email
before insert or update on public.admins
for each row
execute function public.normalize_admin_email();

create or replace function public.current_admin_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role
  from public.admins
  where email = lower(auth.email())
    and active = true
  limit 1;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_admin_role() = 'super_admin', false);
$$;

alter table public.admins enable row level security;

drop policy if exists "Admins can read own record or super admins can read all" on public.admins;
create policy "Admins can read own record or super admins can read all"
on public.admins
for select
to authenticated
using (
  email = lower(auth.email())
  or public.is_super_admin()
);

drop policy if exists "Only super admins can insert admins" on public.admins;
create policy "Only super admins can insert admins"
on public.admins
for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "Only super admins can update admins" on public.admins;
create policy "Only super admins can update admins"
on public.admins
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "Only super admins can delete admins" on public.admins;
create policy "Only super admins can delete admins"
on public.admins
for delete
to authenticated
using (public.is_super_admin());

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.admins to authenticated;

-- Bootstrap note:
-- After creating the table/policies, insert the first super_admin manually from
-- the SQL editor while using a privileged dashboard/session context:
--
-- insert into public.admins (email, full_name, role, active)
-- values ('your-email@example.com', 'Your Name', 'super_admin', true)
-- on conflict (email) do update
-- set role = 'super_admin', active = true, full_name = excluded.full_name;
