-- Admin & stats réels : overrides Supabase, KPIs corrigés, nettoyage données orphelines

-- ── Nettoyage : pros sans legacy_local_id (anciennes données fictives) ───────
delete from public.review_responses
where review_id in (
  select r.id from public.reviews r
  join public.professionals p on p.id = r.professional_id
  where p.legacy_local_id is null
);
delete from public.reviews
where professional_id in (select id from public.professionals where legacy_local_id is null);
delete from public.view_events
where professional_id in (select id from public.professionals where legacy_local_id is null);
delete from public.admin_overrides
where professional_id in (select id from public.professionals where legacy_local_id is null);
delete from public.minisites
where professional_id in (select id from public.professionals where legacy_local_id is null);
delete from public.professionals where legacy_local_id is null;

-- ── Override admin synchronisé ──────────────────────────────────────────────
create or replace function public.upsert_admin_override_by_legacy(
  p_legacy_id bigint,
  p_verifie boolean default null,
  p_disabled boolean default null,
  p_hidden boolean default null,
  p_flagged_duplicate boolean default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pro_id bigint;
begin
  select id into v_pro_id from public.professionals where legacy_local_id = p_legacy_id;
  if v_pro_id is null then
    return jsonb_build_object('ok', false, 'error', 'PRO_NOT_FOUND');
  end if;

  insert into public.admin_overrides (professional_id, verifie, disabled, hidden, flagged_duplicate, updated_at)
  values (
    v_pro_id,
    p_verifie,
    coalesce(p_disabled, false),
    coalesce(p_hidden, false),
    coalesce(p_flagged_duplicate, false),
    now()
  )
  on conflict (professional_id) do update set
    verifie = coalesce(excluded.verifie, public.admin_overrides.verifie),
    disabled = coalesce(excluded.disabled, public.admin_overrides.disabled),
    hidden = coalesce(excluded.hidden, public.admin_overrides.hidden),
    flagged_duplicate = coalesce(excluded.flagged_duplicate, public.admin_overrides.flagged_duplicate),
    updated_at = now();

  return jsonb_build_object('ok', true, 'professional_id', v_pro_id);
end;
$$;

grant execute on function public.upsert_admin_override_by_legacy(
  bigint, boolean, boolean, boolean, boolean
) to anon, authenticated;

-- ── Analytics plateforme corrigés ───────────────────────────────────────────
create or replace function public.get_platform_analytics(
  p_start_date date default (current_date - 30),
  p_end_date date default current_date
)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_total_pros int;
  v_verified int;
  v_premium int;
  v_advanced int;
  v_free int;
  v_total_views int;
  v_whatsapp int;
  v_total_reviews int;
  v_new_pros int;
  v_total_users int;
  v_total_searches int;
  v_mrr int;
  v_daily jsonb;
  v_by_category jsonb;
  v_by_region jsonb;
  v_opportunities jsonb;
begin
  select count(*)::int into v_total_pros
  from public.professionals p
  left join public.admin_overrides ao on ao.professional_id = p.id
  where p.legacy_local_id is not null
    and coalesce(ao.hidden, false) = false
    and coalesce(ao.disabled, false) = false;

  select count(*)::int into v_verified
  from public.professionals p
  left join public.admin_overrides ao on ao.professional_id = p.id
  where p.legacy_local_id is not null
    and coalesce(ao.hidden, false) = false
    and coalesce(ao.disabled, false) = false
    and coalesce(ao.verifie, p.verifie) = true;

  select
    count(*) filter (where p.plan = 'premium' and coalesce(p.plan_actif, false))::int,
    count(*) filter (where p.plan = 'advanced' and coalesce(p.plan_actif, false))::int,
    count(*) filter (where p.plan = 'free' or not coalesce(p.plan_actif, false))::int
  into v_premium, v_advanced, v_free
  from public.professionals p
  left join public.admin_overrides ao on ao.professional_id = p.id
  where p.legacy_local_id is not null
    and coalesce(ao.hidden, false) = false
    and coalesce(ao.disabled, false) = false;

  select count(*)::int into v_total_views
  from public.view_events
  where event_type = 'profile_view'
    and created_at::date between p_start_date and p_end_date;

  select count(*)::int into v_whatsapp
  from public.view_events
  where event_type = 'whatsapp_click'
    and created_at::date between p_start_date and p_end_date;

  select count(*)::int into v_total_reviews
  from public.reviews r
  join public.professionals p on p.id = r.professional_id
  where p.legacy_local_id is not null;

  select count(*)::int into v_new_pros
  from public.professionals
  where legacy_local_id is not null
    and created_at::date between p_start_date and p_end_date;

  select count(*)::int into v_total_users
  from public.professionals
  where legacy_local_id is not null;

  select count(*)::int into v_total_searches
  from public.search_events
  where created_at::date between p_start_date and p_end_date;

  v_mrr := v_advanced * 50000 + v_premium * 120000;

  select coalesce(jsonb_agg(row_to_json(d) order by d.day), '[]'::jsonb)
  into v_daily
  from (
    select gs.day::date as day, count(ve.id)::int as views
    from generate_series(p_start_date, p_end_date, interval '1 day') as gs(day)
    left join public.view_events ve
      on ve.event_type = 'profile_view'
      and ve.created_at::date = gs.day::date
    group by gs.day::date
  ) d;

  select coalesce(jsonb_agg(row_to_json(c) order by c.count desc), '[]'::jsonb)
  into v_by_category
  from (
    select p.categorie as name, count(*)::int as count
    from public.professionals p
    left join public.admin_overrides ao on ao.professional_id = p.id
    where p.legacy_local_id is not null
      and coalesce(ao.hidden, false) = false
      and coalesce(ao.disabled, false) = false
    group by p.categorie
    order by count desc
    limit 10
  ) c;

  select coalesce(jsonb_agg(row_to_json(r) order by r.count desc), '[]'::jsonb)
  into v_by_region
  from (
    select p.region as name, count(*)::int as count
    from public.professionals p
    left join public.admin_overrides ao on ao.professional_id = p.id
    where p.legacy_local_id is not null
      and coalesce(ao.hidden, false) = false
      and coalesce(ao.disabled, false) = false
    group by p.region
    order by count desc
    limit 10
  ) r;

  -- Opportunités réelles : catégories/régions avec peu de pros
  select coalesce(jsonb_agg(row_to_json(o) order by o.score desc), '[]'::jsonb)
  into v_opportunities
  from (
    select
      cat.name as cat,
      reg.region as region,
      (
        select count(*)::int from public.professionals p2
        left join public.admin_overrides ao2 on ao2.professional_id = p2.id
        where p2.legacy_local_id is not null
          and p2.categorie = cat.name
          and p2.region = reg.region
          and coalesce(ao2.hidden, false) = false
          and coalesce(ao2.disabled, false) = false
      ) as pros,
      (
        select count(*)::int from public.search_events se
        where se.created_at::date between p_start_date and p_end_date
          and (
            lower(se.query) like '%' || lower(reg.region) || '%'
            or lower(se.query) like '%' || lower(split_part(cat.name, ' ', 1)) || '%'
          )
      ) as searches,
      greatest(
        (
          select count(*)::int from public.search_events se
          where se.created_at::date between p_start_date and p_end_date
            and (
              lower(se.query) like '%' || lower(reg.region) || '%'
              or lower(se.query) like '%' || lower(split_part(cat.name, ' ', 1)) || '%'
            )
        ),
        1
      )::float / greatest(
        (
          select count(*)::int from public.professionals p2
          left join public.admin_overrides ao2 on ao2.professional_id = p2.id
          where p2.legacy_local_id is not null
            and p2.categorie = cat.name
            and p2.region = reg.region
            and coalesce(ao2.hidden, false) = false
            and coalesce(ao2.disabled, false) = false
        ),
        1
      ) as score
    from (
      select distinct categorie as name from public.professionals where legacy_local_id is not null
      union select 'Juridique & Notariat'
      union select 'Peinture & Déco'
      union select 'Santé & Médecine'
    ) cat
    cross join (
      select distinct region from public.professionals where legacy_local_id is not null
      union select 'Conakry' union select 'Kindia' union select 'Labé'
    ) reg
    limit 20
  ) o
  where o.pros <= 2;

  return jsonb_build_object('ok', true, 'metrics', jsonb_build_object(
    'totalPros', coalesce(v_total_pros, 0),
    'verified', coalesce(v_verified, 0),
    'premium', coalesce(v_premium, 0),
    'advanced', coalesce(v_advanced, 0),
    'free', coalesce(v_free, 0),
    'totalViews', coalesce(v_total_views, 0),
    'whatsappClicks', coalesce(v_whatsapp, 0),
    'totalReviews', coalesce(v_total_reviews, 0),
    'newPros', coalesce(v_new_pros, 0),
    'totalUsers', coalesce(v_total_users, 0),
    'totalSearches', coalesce(v_total_searches, 0),
    'mrr', coalesce(v_mrr, 0),
    'daily', v_daily,
    'byCategory', v_by_category,
    'byRegion', v_by_region,
    'opportunities', v_opportunities
  ));
end;
$$;

-- ── Annuaire : inclure statuts admin dans la réponse ────────────────────────
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
      coalesce(ao.hidden, false) as hidden,
      coalesce(ao.disabled, false) as disabled,
      coalesce(ao.flagged_duplicate, false) as flagged_duplicate,
      p.profile_views,
      p.whatsapp_clicks,
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
    group by p.id, ao.verifie, ao.hidden, ao.disabled, ao.flagged_duplicate
  ) t;

  return jsonb_build_object('ok', true, 'professionals', v_result);
end;
$$;
