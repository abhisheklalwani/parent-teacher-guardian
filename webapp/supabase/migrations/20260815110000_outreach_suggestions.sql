-- Persist generated outreach suggestion batches for BridgeAI.
-- Server-only access via SUPABASE_SECRET_KEY (no anon policies).

create extension if not exists "pgcrypto";

create table if not exists public.outreach_batches (
  id uuid primary key default gen_random_uuid(),
  class_id text not null,
  generated_at timestamptz not null,
  students_not_contacted jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists outreach_batches_class_generated_idx
  on public.outreach_batches (class_id, generated_at desc);

create table if not exists public.outreach_suggestions (
  batch_id uuid not null references public.outreach_batches (id) on delete cascade,
  student_id text not null,
  student_name text not null,
  type text not null,
  reason text not null,
  evidence jsonb not null default '[]'::jsonb,
  subject text not null,
  draft text not null,
  guardian_name text not null,
  guardian_email text not null,
  primary key (batch_id, student_id)
);

create index if not exists outreach_suggestions_batch_idx
  on public.outreach_suggestions (batch_id);

alter table public.outreach_batches enable row level security;
alter table public.outreach_suggestions enable row level security;
