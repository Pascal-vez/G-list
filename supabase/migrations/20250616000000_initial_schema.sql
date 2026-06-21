-- G-List — schéma initial (PostgreSQL / Supabase)
-- Idempotent : peut être relancé si une exécution précédente a échoué en cours de route.
-- Supabase Dashboard → SQL Editor → Run

-- ── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Enums (ignore si déjà créés) ────────────────────────────────────────────
do $$ begin
  create type public.user_role as enum ('visitor', 'pro', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.plan_tier as enum ('free', 'advanced', 'premium');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.billing_cycle as enum ('monthly', 'annual');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.report_status as enum ('pending', 'reviewed', 'resolved', 'dismissed');
exception when duplicate_object then null;
end $$;

-- ── Profils (extension de auth.users) ───────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'visitor',
  nom text,
  email text not null,
  telephone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_idx on public.profiles (email);

-- ── Professionnels ──────────────────────────────────────────────────────────
create table if not exists public.professionals (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  nom text not null,
  profession text not null,
  categorie text not null,
  region text not null,
  quartier text default 'Centre',
  telephone text not null,
  whatsapp text,
  description text default '',
  slogan text default '',
  horaires text default 'Lun-Sam 8h-18h',
  specialites jsonb not null default '[]',
  services jsonb not null default '[]',
  social jsonb not null default '{}',
  plan public.plan_tier not null default 'free',
  billing_cycle public.billing_cycle default 'monthly',
  premium_since timestamptz,
  premium_expires timestamptz,
  verifie boolean not null default false,
  profile_views integer not null default 0,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists professionals_region_idx on public.professionals (region);
create index if not exists professionals_categorie_idx on public.professionals (categorie);
create index if not exists professionals_plan_idx on public.professionals (plan);

-- ── Overrides admin ─────────────────────────────────────────────────────────
create table if not exists public.admin_overrides (
  professional_id bigint primary key references public.professionals (id) on delete cascade,
  verifie boolean,
  disabled boolean not null default false,
  hidden boolean not null default false,
  flagged_duplicate boolean not null default false,
  merged_into bigint references public.professionals (id),
  updated_at timestamptz not null default now()
);

-- ── Avis ────────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  professional_id bigint not null references public.professionals (id) on delete cascade,
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  source text default 'visitor',
  created_at timestamptz not null default now()
);

create index if not exists reviews_professional_id_idx on public.reviews (professional_id);

create table if not exists public.review_responses (
  id bigint generated always as identity primary key,
  review_id bigint not null unique references public.reviews (id) on delete cascade,
  professional_id bigint not null references public.professionals (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- ── Favoris & historiques visiteur ──────────────────────────────────────────
create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  professional_id bigint not null references public.professionals (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, professional_id)
);

create table if not exists public.view_events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  professional_id bigint references public.professionals (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.search_events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  query text not null,
  created_at timestamptz not null default now()
);

-- ── Devis & CRM ─────────────────────────────────────────────────────────────
create table if not exists public.quote_requests (
  id bigint generated always as identity primary key,
  professional_id bigint not null references public.professionals (id) on delete cascade,
  visitor_id uuid references public.profiles (id) on delete set null,
  nom text,
  service text,
  message text,
  visitor_email text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.crm_prospects (
  id bigint generated always as identity primary key,
  professional_id bigint not null references public.professionals (id) on delete cascade,
  prenom text not null,
  telephone text,
  email text,
  note text,
  status text not null default 'nouveau',
  created_at timestamptz not null default now()
);

-- ── Mini-sites ──────────────────────────────────────────────────────────────
create table if not exists public.minisites (
  id bigint generated always as identity primary key,
  professional_id bigint not null unique references public.professionals (id) on delete cascade,
  slug text not null unique,
  published boolean not null default false,
  settings jsonb not null default '{}',
  locale jsonb not null default '{}',
  seo jsonb not null default '{}',
  integrations jsonb not null default '{}',
  pages jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.minisite_events (
  id bigint generated always as identity primary key,
  minisite_id bigint not null references public.minisites (id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.form_submissions (
  id bigint generated always as identity primary key,
  minisite_id bigint not null references public.minisites (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- ── Abonnements & facturation ───────────────────────────────────────────────
create table if not exists public.billing_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  professional_id bigint references public.professionals (id) on delete set null,
  plan public.plan_tier not null,
  billing_cycle public.billing_cycle,
  amount integer not null,
  currency text not null default 'GNF',
  status text not null default 'pending',
  provider_ref text,
  note text,
  created_at timestamptz not null default now()
);

-- ── Plateforme ──────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  professional_id bigint references public.professionals (id) on delete set null,
  reporter_email text,
  reason text not null,
  details text,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  nom text not null,
  email text not null,
  sujet text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.waitlist_entries (
  id bigint generated always as identity primary key,
  nom text not null,
  email text not null,
  telephone text,
  profession text,
  region text,
  created_at timestamptz not null default now()
);

create table if not exists public.broadcasts (
  id bigint generated always as identity primary key,
  title text not null,
  message text not null,
  type text not null default 'info',
  audience text not null default 'all',
  active boolean not null default true,
  pinned boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  source text not null,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  actor_type text,
  action text not null,
  target text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ── Trigger updated_at ──────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists professionals_updated_at on public.professionals;
create trigger professionals_updated_at before update on public.professionals
  for each row execute function public.set_updated_at();

drop trigger if exists minisites_updated_at on public.minisites;
create trigger minisites_updated_at before update on public.minisites
  for each row execute function public.set_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.minisites enable row level security;

drop policy if exists "Professionals are publicly readable" on public.professionals;
create policy "Professionals are publicly readable"
  on public.professionals for select
  using (true);

drop policy if exists "Pros can update own profile" on public.professionals;
create policy "Pros can update own profile"
  on public.professionals for update
  using (auth.uid() = user_id);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Reviews are publicly readable" on public.reviews;
create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

drop policy if exists "Authenticated users can post reviews" on public.reviews;
create policy "Authenticated users can post reviews"
  on public.reviews for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Users manage own favorites" on public.favorites;
create policy "Users manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Published minisites are public" on public.minisites;
create policy "Published minisites are public"
  on public.minisites for select
  using (published = true or auth.uid() = (
    select user_id from public.professionals p where p.id = professional_id
  ));
