-- Run in Supabase → SQL Editor. Safe to re-run.

create table if not exists sensor_logs (
  id bigint generated always as identity primary key,
  tma double precision,
  moisture double precision,
  temperature double precision,
  risk_index double precision,
  created_at timestamptz not null default now()
);

alter table sensor_logs enable row level security;
drop policy if exists "anon insert" on sensor_logs;
create policy "anon insert" on sensor_logs for insert to anon with check (true);
drop policy if exists "anon read" on sensor_logs;
create policy "anon read" on sensor_logs for select to anon using (true);
