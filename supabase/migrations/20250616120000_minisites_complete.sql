-- G-List — Mini-sites : compléments + politiques RLS
-- À coller dans Supabase → SQL Editor → Run
-- (La table public.minisites existe déjà dans 20250616000000_initial_schema.sql)

-- ── Lien compte local → ligne Supabase (prototype → production) ─────────────
alter table public.professionals
  add column if not exists legacy_local_id bigint unique;

create index if not exists professionals_legacy_local_id_idx
  on public.professionals (legacy_local_id)
  where legacy_local_id is not null;

-- ── Colonnes complètes pour l'éditeur mini-site ───────────────────────────────
alter table public.minisites
  add column if not exists theme jsonb not null default '{}',
  add column if not exists template_id text default 'artisan',
  add column if not exists sections jsonb not null default '[]',
  add column if not exists advanced jsonb not null default '{}',
  add column if not exists security jsonb not null default '{}';

-- Slug publié : recherche rapide sur le profil public
create index if not exists minisites_published_slug_idx
  on public.minisites (slug)
  where published = true;

-- ── Vue publique : slug + pro (pour profil / annuaire) ───────────────────────
create or replace view public.published_minisites as
select
  m.id as minisite_id,
  m.professional_id,
  m.slug,
  p.legacy_local_id,
  p.plan,
  p.nom
from public.minisites m
join public.professionals p on p.id = m.professional_id
where m.published = true;

grant select on public.published_minisites to anon, authenticated;

-- ── RLS : le pro peut créer / modifier son mini-site ─────────────────────────
drop policy if exists "Pros manage own minisite" on public.minisites;
create policy "Pros manage own minisite"
  on public.minisites
  for all
  to authenticated
  using (
    auth.uid() = (
      select user_id from public.professionals p where p.id = professional_id
    )
  )
  with check (
    auth.uid() = (
      select user_id from public.professionals p where p.id = professional_id
    )
  );

drop policy if exists "Pros can insert own minisite" on public.minisites;
create policy "Pros can insert own minisite"
  on public.minisites
  for insert
  to authenticated
  with check (
    auth.uid() = (
      select user_id from public.professionals p where p.id = professional_id
    )
  );

-- ── Exemple : lier VOTRE compte (à adapter après inscription Supabase) ───────
-- 1) Trouvez votre user_id : select id, email from auth.users;
-- 2) Trouvez ou créez la ligne professionals :
--
-- insert into public.professionals (
--   user_id, nom, profession, categorie, region, telephone, plan, legacy_local_id
-- ) values (
--   'VOTRE-UUID-ICI',
--   'Pascal vézely Guilavogui',
--   'Vidéaste',
--   'Médias',
--   'Nzérékoré',
--   '+224620000000',
--   'premium',
--   1712345678901   -- ← l''id affiché dans l''URL /profil/1712345678901
-- )
-- on conflict (user_id) do update set
--   plan = excluded.plan,
--   legacy_local_id = excluded.legacy_local_id;
--
-- 3) Après publication dans l''éditeur (avec Supabase branché), la ligne minisites
--    est créée automatiquement. Sinon insertion manuelle :
--
-- insert into public.minisites (
--   professional_id, slug, published, pages, sections, theme, settings, seo
-- ) values (
--   (select id from public.professionals where legacy_local_id = 1712345678901),
--   'pascal-vezely-guila',
--   true,
--   '[]'::jsonb,
--   '[]'::jsonb,
--   '{}'::jsonb,
--   '{}'::jsonb,
--   '{}'::jsonb
-- )
-- on conflict (professional_id) do update set
--   slug = excluded.slug,
--   published = excluded.published,
--   updated_at = now();
