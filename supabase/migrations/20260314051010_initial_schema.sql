-- Supabase commonly installs extensions into the `extensions` schema, which is
-- not always on the default `search_path` for the login role used by the CLI.
-- Ensure both `public` and `extensions` are on the path so extension functions
-- like `uuid_generate_v4()` resolve consistently.
set search_path = public, extensions;

create extension if not exists "uuid-ossp";

create table if not exists roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique check (name in ('admin', 'plant_manager', 'technician')),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key,
  email text not null unique,
  full_name text,
  role_id uuid not null references roles(id),
  plant_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists plants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text not null,
  timezone text not null default 'Asia/Kolkata',
  target_oee numeric(5,2) not null default 85.00,
  created_at timestamptz not null default now()
);

alter table users
  add constraint users_plant_id_fkey
  foreign key (plant_id) references plants(id);

create table if not exists equipment (
  id uuid primary key default uuid_generate_v4(),
  plant_id uuid not null references plants(id) on delete cascade,
  name text not null,
  category text not null,
  status text not null check (status in ('running', 'idle', 'maintenance', 'offline')),
  service_interval_hours integer not null default 2400,
  health_score numeric(5,2) not null default 100.00,
  installed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists sensors (
  id uuid primary key default uuid_generate_v4(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  sensor_type text not null check (sensor_type in ('temperature', 'vibration', 'runtime', 'energy', 'emissions')),
  unit text not null,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists measurements (
  id bigint generated always as identity primary key,
  sensor_id uuid not null references sensors(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  value numeric(12,3) not null
);

create index if not exists measurements_sensor_time_idx on measurements(sensor_id, recorded_at desc);

create table if not exists maintenance_schedules (
  id uuid primary key default uuid_generate_v4(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  scheduled_for timestamptz not null,
  service_interval_hours integer not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'overdue')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  plant_id uuid not null references plants(id) on delete cascade,
  equipment_id uuid references equipment(id) on delete cascade,
  severity text not null check (severity in ('critical', 'warning', 'info')),
  title text not null,
  description text not null,
  source text not null default 'predictive_maintenance',
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists alerts_plant_created_idx on alerts(plant_id, created_at desc);

create table if not exists energy_consumption (
  id bigint generated always as identity primary key,
  plant_id uuid not null references plants(id) on delete cascade,
  equipment_id uuid references equipment(id) on delete cascade,
  measured_at timestamptz not null default now(),
  usage_kwh numeric(12,3) not null,
  production_units integer not null default 0,
  energy_per_unit numeric(12,4) generated always as (
    case when production_units = 0 then null else usage_kwh / production_units end
  ) stored
);

create index if not exists energy_consumption_plant_time_idx on energy_consumption(plant_id, measured_at desc);

create table if not exists emissions (
  id bigint generated always as identity primary key,
  plant_id uuid not null references plants(id) on delete cascade,
  equipment_id uuid references equipment(id) on delete cascade,
  measured_at timestamptz not null default now(),
  energy_kwh numeric(12,3) not null,
  carbon_factor numeric(8,4) not null default 0.42,
  emissions_kg_co2 numeric(12,3) generated always as (energy_kwh * carbon_factor) stored
);

create index if not exists emissions_plant_time_idx on emissions(plant_id, measured_at desc);

insert into roles (name, description)
values
  ('admin', 'Platform administrator with full access'),
  ('plant_manager', 'Operational manager with analytics and alerts access'),
  ('technician', 'Maintenance technician focused on equipment and alerts')
on conflict (name) do nothing;
