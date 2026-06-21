-- Abonnement manuel (Orange Money) — en attendant CinetPay
-- Compatible avec le schéma G-List existant (profiles, professionals)

-- ── Colonnes abonnement sur profiles ───────────────────────────────────────
alter table public.profiles
  add column if not exists plan text default 'gratuit'
    check (plan in ('gratuit', 'pro', 'premium')),
  add column if not exists plan_debut timestamptz,
  add column if not exists plan_fin timestamptz,
  add column if not exists plan_actif boolean default false,
  add column if not exists alerte_expiration_envoyee boolean default false;

-- ── Colonnes abonnement sur professionals (sync) ───────────────────────────
alter table public.professionals
  add column if not exists plan_actif boolean default false,
  add column if not exists alerte_expiration_envoyee boolean default false;

-- ── Config paiement (une seule ligne) ──────────────────────────────────────
create table if not exists public.config_paiement (
  id integer primary key default 1,
  numero_depot text not null,
  nom_titulaire text,
  operateur text default 'Orange Money',
  email_admin text,
  frais_pro integer default 0,
  frais_premium integer default 0,
  constraint config_paiement_single_row check (id = 1)
);

insert into public.config_paiement (
  id, numero_depot, nom_titulaire, operateur, email_admin
) values (
  1,
  '+224626419331',
  'G-List Administration',
  'Orange Money',
  null
) on conflict (id) do update set
  numero_depot = excluded.numero_depot,
  nom_titulaire = excluded.nom_titulaire,
  operateur = excluded.operateur;

-- ── Demandes d'abonnement ────────────────────────────────────────────────────
create table if not exists public.demandes_abonnement (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  legacy_pro_id bigint,
  pro_nom text,
  pro_email text,
  plan_demande text not null
    check (plan_demande in ('pro', 'premium')),
  plan_actuel text default 'gratuit'
    check (plan_actuel in ('gratuit', 'pro', 'premium')),
  montant integer not null,
  numero_emetteur text not null,
  id_transaction text,
  statut text default 'en_attente'
    check (statut in ('en_attente', 'validee', 'refusee')),
  motif_refus text,
  traite_par uuid references auth.users (id) on delete set null,
  traite_le timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists demandes_abonnement_statut_idx
  on public.demandes_abonnement (statut, created_at desc);
create index if not exists demandes_abonnement_user_idx
  on public.demandes_abonnement (user_id);
create index if not exists demandes_abonnement_legacy_idx
  on public.demandes_abonnement (legacy_pro_id);

-- ── Notifications — colonnes optionnelles ───────────────────────────────────
alter table public.notifications
  add column if not exists type text,
  add column if not exists lien text,
  add column if not exists lue boolean default false;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.demandes_abonnement enable row level security;
alter table public.config_paiement enable row level security;

drop policy if exists demande_own on public.demandes_abonnement;
create policy demande_own on public.demandes_abonnement
  for select using (auth.uid() = user_id);

drop policy if exists demande_insert on public.demandes_abonnement;
create policy demande_insert on public.demandes_abonnement
  for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists demande_admin_all on public.demandes_abonnement;
create policy demande_admin_all on public.demandes_abonnement
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists config_read_all on public.config_paiement;
create policy config_read_all on public.config_paiement
  for select using (true);

drop policy if exists config_admin_write on public.config_paiement;
create policy config_admin_write on public.config_paiement
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists notifications_insert_service on public.notifications;
create policy notifications_insert_service on public.notifications
  for insert with check (true);
