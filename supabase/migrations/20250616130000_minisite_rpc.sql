-- Permet à l'app (sans Supabase Auth) d'enregistrer un mini-site via legacy_local_id
-- À exécuter dans Supabase SQL Editor après les migrations précédentes

create or replace function public.upsert_minisite_by_legacy(
  p_legacy_id bigint,
  p_slug text,
  p_published boolean,
  p_template_id text default 'artisan',
  p_theme jsonb default '{}',
  p_sections jsonb default '[]',
  p_pages jsonb default '[]',
  p_settings jsonb default '{}',
  p_seo jsonb default '{}',
  p_locale jsonb default '{}',
  p_integrations jsonb default '{}',
  p_advanced jsonb default '{}',
  p_security jsonb default '{}'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pro_id bigint;
  v_slug text;
begin
  select id into v_pro_id
  from public.professionals
  where legacy_local_id = p_legacy_id;

  if v_pro_id is null then
    raise exception 'PROFESSIONAL_NOT_FOUND';
  end if;

  v_slug := lower(regexp_replace(coalesce(p_slug, 'mon-site'), '[^a-z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then
    v_slug := 'mon-site';
  end if;

  insert into public.minisites (
    professional_id, slug, published, template_id,
    theme, sections, pages, settings, seo, locale, integrations, advanced, security,
    updated_at
  ) values (
    v_pro_id, v_slug, coalesce(p_published, false), coalesce(p_template_id, 'artisan'),
    coalesce(p_theme, '{}'), coalesce(p_sections, '[]'), coalesce(p_pages, '[]'),
    coalesce(p_settings, '{}'), coalesce(p_seo, '{}'), coalesce(p_locale, '{}'),
    coalesce(p_integrations, '{}'), coalesce(p_advanced, '{}'), coalesce(p_security, '{}'),
    now()
  )
  on conflict (professional_id) do update set
    slug = excluded.slug,
    published = excluded.published,
    template_id = excluded.template_id,
    theme = excluded.theme,
    sections = excluded.sections,
    pages = excluded.pages,
    settings = excluded.settings,
    seo = excluded.seo,
    locale = excluded.locale,
    integrations = excluded.integrations,
    advanced = excluded.advanced,
    security = excluded.security,
    updated_at = now();

  return jsonb_build_object('ok', true, 'slug', v_slug, 'published', coalesce(p_published, false));
end;
$$;

grant execute on function public.upsert_minisite_by_legacy(
  bigint, text, boolean, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb
) to anon, authenticated;

-- Lecture publique par slug (page /pro/:slug)
create or replace function public.get_published_minisite_by_slug(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
  v_result jsonb;
begin
  v_slug := lower(regexp_replace(coalesce(p_slug, ''), '[^a-z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);

  select jsonb_build_object(
    'site', jsonb_build_object(
      'slug', m.slug,
      'published', m.published,
      'template_id', m.template_id,
      'theme', m.theme,
      'sections', m.sections,
      'pages', m.pages,
      'settings', m.settings,
      'seo', m.seo,
      'locale', m.locale,
      'integrations', m.integrations,
      'advanced', m.advanced,
      'security', m.security
    ),
    'pro', jsonb_build_object(
      'id', coalesce(p.legacy_local_id, p.id),
      'nom', p.nom,
      'profession', p.profession,
      'categorie', p.categorie,
      'region', p.region,
      'quartier', p.quartier,
      'telephone', p.telephone,
      'whatsapp', coalesce(p.whatsapp, p.telephone),
      'description', p.description,
      'slogan', p.slogan,
      'plan', p.plan,
      'social', p.social,
      'horaires', p.horaires
    )
  ) into v_result
  from public.minisites m
  join public.professionals p on p.id = m.professional_id
  where m.slug = v_slug
    and m.published = true;

  return v_result;
end;
$$;

grant execute on function public.get_published_minisite_by_slug(text) to anon, authenticated;
