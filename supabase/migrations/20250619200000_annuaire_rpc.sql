-- Annuaire public : liste et fiches pro synchronisées (source de vérité Supabase)

create or replace function public.upsert_professional_by_legacy(
  p_legacy_id bigint,
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
  p_social jsonb default '{}',
  p_services jsonb default '[]',
  p_specialites jsonb default '[]',
  p_verifie boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pro_id bigint;
  v_plan public.plan_tier;
begin
  if p_legacy_id is null then
    return jsonb_build_object('ok', false, 'error', 'LEGACY_ID_REQUIRED');
  end if;

  v_plan := case lower(coalesce(p_plan, 'free'))
    when 'premium' then 'premium'::public.plan_tier
    when 'advanced' then 'advanced'::public.plan_tier
    else 'free'::public.plan_tier
  end;

  select id into v_pro_id
  from public.professionals
  where legacy_local_id = p_legacy_id;

  if v_pro_id is null then
    insert into public.professionals (
      user_id, legacy_local_id, nom, profession, categorie, region, quartier,
      telephone, whatsapp, description, slogan, plan, horaires, social,
      services, specialites, verifie, updated_at
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
      coalesce(p_services, '[]'::jsonb),
      coalesce(p_specialites, '[]'::jsonb),
      coalesce(p_verifie, false),
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
      services = coalesce(p_services, services),
      specialites = coalesce(p_specialites, specialites),
      verifie = coalesce(p_verifie, verifie),
      updated_at = now()
    where id = v_pro_id;
  end if;

  return jsonb_build_object('ok', true, 'professional_id', v_pro_id, 'legacy_local_id', p_legacy_id);
end;
$$;

grant execute on function public.upsert_professional_by_legacy(
  bigint, text, text, text, text, text, text, text, text, text, text, text, jsonb, jsonb, jsonb, boolean
) to anon, authenticated;

-- Liste annuaire (visiteurs publics)
create or replace function public.list_annuaire_professionals(p_include_hidden boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_result jsonb;
begin
  select coalesce(jsonb_agg(row_to_json(t) order by t.updated_at desc), '[]'::jsonb)
  into v_result
  from (
    select
      p.legacy_local_id as id,
      p.nom,
      p.profession,
      p.categorie,
      p.region,
      p.quartier,
      p.telephone,
      coalesce(p.whatsapp, p.telephone) as whatsapp,
      p.description,
      p.slogan,
      p.plan::text as plan,
      p.horaires,
      p.specialites,
      p.services,
      p.social,
      coalesce(ao.verifie, p.verifie) as verifie,
      p.profile_views,
      p.updated_at,
      round(coalesce(avg(r.rating)::numeric, 0), 1) as note,
      count(r.id)::int as nombre_avis
    from public.professionals p
    left join public.reviews r on r.professional_id = p.id
    left join public.admin_overrides ao on ao.professional_id = p.id
    where p.legacy_local_id is not null
      and (
        p_include_hidden
        or (coalesce(ao.hidden, false) = false and coalesce(ao.disabled, false) = false)
      )
    group by p.id, ao.verifie, ao.hidden, ao.disabled
  ) t;

  return jsonb_build_object('ok', true, 'professionals', v_result);
end;
$$;

grant execute on function public.list_annuaire_professionals(boolean) to anon, authenticated;

-- Fiche annuaire par id legacy (/profil/:id)
create or replace function public.get_annuaire_professional(p_legacy_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_result jsonb;
begin
  select row_to_json(t)::jsonb into v_result
  from (
    select
      p.legacy_local_id as id,
      p.nom,
      p.profession,
      p.categorie,
      p.region,
      p.quartier,
      p.telephone,
      coalesce(p.whatsapp, p.telephone) as whatsapp,
      p.description,
      p.slogan,
      p.plan::text as plan,
      p.horaires,
      p.specialites,
      p.services,
      p.social,
      coalesce(ao.verifie, p.verifie) as verifie,
      p.profile_views,
      round(coalesce(avg(r.rating)::numeric, 0), 1) as note,
      count(r.id)::int as nombre_avis
    from public.professionals p
    left join public.reviews r on r.professional_id = p.id
    left join public.admin_overrides ao on ao.professional_id = p.id
    where p.legacy_local_id = p_legacy_id
      and coalesce(ao.hidden, false) = false
      and coalesce(ao.disabled, false) = false
    group by p.id, ao.verifie, ao.hidden, ao.disabled
  ) t;

  if v_result is null then
    return jsonb_build_object('ok', true, 'professional', null);
  end if;

  return jsonb_build_object('ok', true, 'professional', v_result);
end;
$$;

grant execute on function public.get_annuaire_professional(bigint) to anon, authenticated;
