set search_path = public, auth, extensions;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role_id uuid references roles(id),
  plant_id uuid references plants(id),
  created_at timestamptz not null default now()
);

alter table profiles
  alter column role_id set not null;

insert into profiles (id, email, full_name, role_id, plant_id, created_at)
select
  users.id,
  users.email,
  users.full_name,
  users.role_id,
  users.plant_id,
  users.created_at
from users
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  role_id = excluded.role_id,
  plant_id = excluded.plant_id;

drop table if exists users;

alter table profiles enable row level security;
alter table roles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own"
on profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
on profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "roles_select_authenticated" on roles;
create policy "roles_select_authenticated"
on roles
for select
to authenticated
using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  requested_role_id uuid;
  requested_plant_id uuid;
begin
  requested_role := coalesce(
    new.raw_app_meta_data ->> 'role',
    new.raw_user_meta_data ->> 'role'
  );

  if requested_role is null then
    raise exception 'A valid role is required for signup.';
  end if;

  if requested_role not in ('admin', 'plant_manager', 'technician') then
    raise exception 'Unsupported role %.', requested_role;
  end if;

  if requested_role = 'admin'
    and coalesce(
      new.raw_app_meta_data ->> 'seeded_admin',
      new.raw_user_meta_data ->> 'seeded_admin',
      'false'
    ) <> 'true' then
    raise exception 'Admin accounts must be created by the seed script.';
  end if;

  select id
  into requested_role_id
  from public.roles
  where name = requested_role;

  if requested_role_id is null then
    raise exception 'Role % is not configured.', requested_role;
  end if;

  requested_plant_id := nullif(new.raw_user_meta_data ->> 'plant_id', '')::uuid;

  insert into public.profiles (id, email, full_name, role_id, plant_id)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    requested_role_id,
    requested_plant_id
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role_id = excluded.role_id,
    plant_id = excluded.plant_id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
