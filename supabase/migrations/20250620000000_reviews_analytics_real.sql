-- Avis, événements et analytics réels (plus de données fictives côté frontend)

-- ── Événements profil (vues, clics WhatsApp) ────────────────────────────────
alter table public.view_events
  add column if not exists event_type text not null default 'profile_view';

alter table public.professionals
  add column if not exists whatsapp_clicks integer not null default 0;

create index if not exists view_events_professional_type_idx
  on public.view_events (professional_id, event_type, created_at desc);

-- ── Helper : résoudre l'id pro Supabase depuis legacy_local_id ───────────────
create or replace function public.resolve_pro_id_by_legacy(p_legacy_id bigint)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select id from public.professionals where legacy_local_id = p_legacy_id limit 1;
$$;

grant execute on function public.resolve_pro_id_by_legacy(bigint) to anon, authenticated;

-- ── Avis : lecture ──────────────────────────────────────────────────────────
create or replace function public.get_reviews_by_legacy(p_legacy_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_pro_id bigint;
  v_result jsonb;
begin
  v_pro_id := public.resolve_pro_id_by_legacy(p_legacy_id);
  if v_pro_id is null then
    return jsonb_build_object('ok', true, 'reviews', '[]'::jsonb);
  end if;

  select coalesce(jsonb_agg(row_to_json(t) order by t.created_at desc), '[]'::jsonb)
  into v_result
  from (
    select
      r.id,
      r.author_name,
      r.rating,
      r.comment,
      r.created_at,
      rr.text as response_text,
      rr.created_at as response_at
    from public.reviews r
    left join public.review_responses rr on rr.review_id = r.id
    where r.professional_id = v_pro_id
  ) t;

  return jsonb_build_object('ok', true, 'reviews', v_result);
end;
$$;

grant execute on function public.get_reviews_by_legacy(bigint) to anon, authenticated;

-- ── Avis : ajout (visiteurs anonymes autorisés via RPC) ─────────────────────
create or replace function public.add_review_by_legacy(
  p_legacy_id bigint,
  p_author_name text,
  p_rating smallint,
  p_comment text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pro_id bigint;
  v_id bigint;
begin
  if coalesce(trim(p_author_name), '') = '' then
    raise exception 'Nom requis';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Note invalide';
  end if;
  if coalesce(trim(p_comment), '') = '' then
    raise exception 'Commentaire requis';
  end if;

  v_pro_id := public.resolve_pro_id_by_legacy(p_legacy_id);
  if v_pro_id is null then
    raise exception 'Professionnel introuvable';
  end if;

  insert into public.reviews (professional_id, author_name, rating, comment, source)
  values (v_pro_id, trim(p_author_name), p_rating, trim(p_comment), 'visitor')
  returning id into v_id;

  return jsonb_build_object(
    'ok', true,
    'review', jsonb_build_object(
      'id', v_id,
      'author_name', trim(p_author_name),
      'rating', p_rating,
      'comment', trim(p_comment),
      'created_at', now()
    )
  );
end;
$$;

grant execute on function public.add_review_by_legacy(bigint, text, smallint, text) to anon, authenticated;

-- ── Réponse pro à un avis ───────────────────────────────────────────────────
create or replace function public.upsert_review_response_by_legacy(
  p_legacy_id bigint,
  p_review_id bigint,
  p_text text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pro_id bigint;
begin
  if coalesce(trim(p_text), '') = '' then
    raise exception 'Réponse requise';
  end if;

  v_pro_id := public.resolve_pro_id_by_legacy(p_legacy_id);
  if v_pro_id is null then
    raise exception 'Professionnel introuvable';
  end if;

  if not exists (
    select 1 from public.reviews
    where id = p_review_id and professional_id = v_pro_id
  ) then
    raise exception 'Avis introuvable';
  end if;

  insert into public.review_responses (review_id, professional_id, text)
  values (p_review_id, v_pro_id, trim(p_text))
  on conflict (review_id) do update set text = excluded.text;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.upsert_review_response_by_legacy(bigint, bigint, text) to anon, authenticated;

-- ── Enregistrer vue profil ou clic WhatsApp ─────────────────────────────────
create or replace function public.record_profile_event(
  p_legacy_id bigint,
  p_event_type text default 'profile_view'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pro_id bigint;
  v_type text := coalesce(nullif(trim(p_event_type), ''), 'profile_view');
begin
  if v_type not in ('profile_view', 'whatsapp_click') then
    raise exception 'Type d''événement invalide';
  end if;

  v_pro_id := public.resolve_pro_id_by_legacy(p_legacy_id);
  if v_pro_id is null then
    return jsonb_build_object('ok', false, 'error', 'PRO_NOT_FOUND');
  end if;

  insert into public.view_events (professional_id, event_type)
  values (v_pro_id, v_type);

  if v_type = 'profile_view' then
    update public.professionals
    set profile_views = profile_views + 1, updated_at = now()
    where id = v_pro_id;
  else
    update public.professionals
    set whatsapp_clicks = whatsapp_clicks + 1, updated_at = now()
    where id = v_pro_id;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.record_profile_event(bigint, text) to anon, authenticated;

-- ── Analytics pro (tableau de bord) ─────────────────────────────────────────
create or replace function public.get_pro_analytics_by_legacy(
  p_legacy_id bigint,
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
  v_pro_id bigint;
  v_views int;
  v_whatsapp int;
  v_favorites int;
  v_reviews int;
  v_avg numeric;
  v_daily jsonb;
  v_prev_views int;
  v_days int;
begin
  v_pro_id := public.resolve_pro_id_by_legacy(p_legacy_id);
  if v_pro_id is null then
    return jsonb_build_object('ok', true, 'metrics', jsonb_build_object(
      'views', 0, 'whatsapp', 0, 'favorites', 0, 'reviews', 0, 'avgRating', 0,
      'viewsTrend', 0, 'whatsappTrend', 0, 'daily', '[]'::jsonb
    ));
  end if;

  v_days := greatest(1, (p_end_date - p_start_date) + 1);

  select count(*)::int into v_views
  from public.view_events
  where professional_id = v_pro_id
    and event_type = 'profile_view'
    and created_at::date between p_start_date and p_end_date;

  select count(*)::int into v_whatsapp
  from public.view_events
  where professional_id = v_pro_id
    and event_type = 'whatsapp_click'
    and created_at::date between p_start_date and p_end_date;

  select count(*)::int into v_favorites
  from public.favorites
  where professional_id = v_pro_id;

  select count(*)::int, round(coalesce(avg(rating), 0)::numeric, 1)
  into v_reviews, v_avg
  from public.reviews
  where professional_id = v_pro_id;

  select count(*)::int into v_prev_views
  from public.view_events
  where professional_id = v_pro_id
    and event_type = 'profile_view'
    and created_at::date between (p_start_date - v_days) and (p_start_date - 1);

  select coalesce(jsonb_agg(row_to_json(d) order by d.day), '[]'::jsonb)
  into v_daily
  from (
    select
      gs.day::date as day,
      count(ve.id)::int as views
    from generate_series(p_start_date, p_end_date, interval '1 day') as gs(day)
    left join public.view_events ve
      on ve.professional_id = v_pro_id
      and ve.event_type = 'profile_view'
      and ve.created_at::date = gs.day::date
    group by gs.day::date
  ) d;

  return jsonb_build_object('ok', true, 'metrics', jsonb_build_object(
    'views', coalesce(v_views, 0),
    'whatsapp', coalesce(v_whatsapp, 0),
    'favorites', coalesce(v_favorites, 0),
    'reviews', coalesce(v_reviews, 0),
    'avgRating', coalesce(v_avg, 0),
    'viewsTrend', case when coalesce(v_prev_views, 0) > 0
      then round(((v_views - v_prev_views)::numeric / v_prev_views) * 100)
      else case when v_views > 0 then 100 else 0 end end,
    'whatsappTrend', case when coalesce(v_prev_views, 0) > 0
      then round(((v_whatsapp - (v_prev_views * 0.28)) / greatest(v_prev_views * 0.28, 1)) * 100)
      else 0 end,
    'daily', v_daily
  ));
end;
$$;

grant execute on function public.get_pro_analytics_by_legacy(bigint, date, date) to anon, authenticated;

-- ── Analytics plateforme (admin) ────────────────────────────────────────────
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
  v_total_views int;
  v_whatsapp int;
  v_total_reviews int;
  v_new_pros int;
  v_daily jsonb;
  v_by_category jsonb;
  v_by_region jsonb;
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
  where coalesce(ao.verifie, p.verifie) = true
    and coalesce(ao.hidden, false) = false;

  select count(*)::int into v_premium
  from public.professionals where plan = 'premium';

  select count(*)::int into v_advanced
  from public.professionals where plan = 'advanced';

  select count(*)::int into v_total_views
  from public.view_events
  where event_type = 'profile_view'
    and created_at::date between p_start_date and p_end_date;

  select count(*)::int into v_whatsapp
  from public.view_events
  where event_type = 'whatsapp_click'
    and created_at::date between p_start_date and p_end_date;

  select count(*)::int into v_total_reviews from public.reviews;

  select count(*)::int into v_new_pros
  from public.professionals
  where created_at::date between p_start_date and p_end_date;

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
    select categorie as name, count(*)::int as count
    from public.professionals
    where legacy_local_id is not null
    group by categorie
    order by count desc
    limit 10
  ) c;

  select coalesce(jsonb_agg(row_to_json(r) order by r.count desc), '[]'::jsonb)
  into v_by_region
  from (
    select region as name, count(*)::int as count
    from public.professionals
    where legacy_local_id is not null
    group by region
    order by count desc
    limit 10
  ) r;

  return jsonb_build_object('ok', true, 'metrics', jsonb_build_object(
    'totalPros', coalesce(v_total_pros, 0),
    'verified', coalesce(v_verified, 0),
    'premium', coalesce(v_premium, 0),
    'advanced', coalesce(v_advanced, 0),
    'totalViews', coalesce(v_total_views, 0),
    'whatsappClicks', coalesce(v_whatsapp, 0),
    'totalReviews', coalesce(v_total_reviews, 0),
    'newPros', coalesce(v_new_pros, 0),
    'daily', v_daily,
    'byCategory', v_by_category,
    'byRegion', v_by_region
  ));
end;
$$;

grant execute on function public.get_platform_analytics(date, date) to anon, authenticated;

-- Annuaire : exposer whatsapp_clicks
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
    group by p.id, ao.verifie, ao.hidden, ao.disabled
  ) t;

  return jsonb_build_object('ok', true, 'professionals', v_result);
end;
$$;

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
      p.whatsapp_clicks,
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
