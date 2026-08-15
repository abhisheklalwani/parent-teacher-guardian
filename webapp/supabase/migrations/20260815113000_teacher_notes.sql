-- Persist teacher voice notes for BridgeAI.
-- Server-only access via SUPABASE_SECRET_KEY (no anon policies).

create extension if not exists "pgcrypto";

create table if not exists public.teacher_notes (
  id uuid primary key default gen_random_uuid(),
  class_id text not null,
  student_id text not null,
  note text not null,
  note_date date not null,
  week_of date not null,
  created_at timestamptz not null default now()
);

create index if not exists teacher_notes_class_student_idx
  on public.teacher_notes (class_id, student_id, note_date);

alter table public.teacher_notes enable row level security;
