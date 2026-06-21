-- Permet de créer automatiquement la fiche pro depuis l'app (sans Supabase Auth)
-- lors de la première sauvegarde mini-site.

alter table public.professionals
  alter column user_id drop not null;

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
  p_security jsonb default '{}',
  p_nom text default 'Professionnel',
  p_profession text default 'Professionnel',
  p_categorie text default 'Services',
  p_region text default 'Conakry',
  p_quartier text default 'Centre',
  p_telephone text default '',
  p_whatsapp text default null,
  p_description text default '',
  p_slogan text default '',
  p_plan text default 'free',
  p_horaires text default 'Lun-Sam 8h-18h',
  p_social jsonb default '{}'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pro_id bigint;
  v_slug text;
  v_plan public.plan_tier;
begin
  select id into v_pro_id
  from public.professionals
  where legacy_local_id = p_legacy_id;

  v_plan := case lower(coalesce(p_plan, 'free'))
    when 'premium' then 'premium'::public.plan_tier
    when 'advanced' then 'advanced'::public.plan_tier
    else 'free'::public.plan_tier
  end;

  if v_pro_id is null then
    insert into public.professionals (
      user_id, legacy_local_id, nom, profession, categorie, region, quartier,
      telephone, whatsapp, description, slogan, plan, horaires, social, updated_at
    ) values (
      null,
      p_legacy_id,
      coalesce(nullif(trim(p_nom), ''), 'Professionnel'),
      coalesce(nullif(trim(p_profession), ''), 'Professionnel'),
      coalesce(nullif(trim(p_categorie), ''), 'Services'),
      coalesce(nullif(trim(p_region), ''), 'Conakry'),
      coalesce(nullif(trim(p_quartier), ''), 'Centre'),
      coalesce(nullif(trim(p_telephone), ''), '000000000'),
      nullif(trim(coalesce(p_whatsapp, '')), ''),
      coalesce(p_description, ''),
      coalesce(p_slogan, ''),
      v_plan,
      coalesce(nullif(trim(p_horaires), ''), 'Lun-Sam 8h-18h'),
      coalesce(p_social, '{}'::jsonb),
      now()
    )
    returning id into v_pro_id;
  else
    update public.professionals set
      nom = coalesce(nullif(trim(p_nom), ''), nom),
      profession = coalesce(nullif(trim(p_profession), ''), profession),
      categorie = coalesce(nullif(trim(p_categorie), ''), categorie),
      region = coalesce(nullif(trim(p_region), ''), region),
      quartier = coalesce(nullif(trim(p_quartier), ''), quartier),
      telephone = coalesce(nullif(trim(p_telephone), ''), telephone),
      whatsapp = coalesce(nullif(trim(coalesce(p_whatsapp, '')), ''), whatsapp),
      description = coalesce(p_description, description),
      slogan = coalesce(p_slogan, slogan),
      plan = v_plan,
      horaires = coalesce(nullif(trim(p_horaires), ''), horaires),
      social = coalesce(p_social, social),
      updated_at = now()
    where id = v_pro_id;
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
  bigint, text, boolean, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb,
  text, text, text, text, text, text, text, text, text, text, text, jsonb
) to anon, authenticated;
