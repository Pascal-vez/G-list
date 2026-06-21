-- Corrige « Site introuvable » : la page /pro/:slug doit charger dès que published = true.
-- (Le plan Premium est géré côté app ; la ligne professionals peut encore être en plan free.)

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
