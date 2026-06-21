-- RPC abonnement manuel — appels depuis le frontend (anon + legacy_pro_id)

create or replace function public.plan_demande_to_tier(p text)
returns public.plan_tier language sql immutable as $$
  select case p
    when 'pro' then 'advanced'::public.plan_tier
    when 'premium' then 'premium'::public.plan_tier
    else 'free'::public.plan_tier
  end;
$$;

create or replace function public.plan_tier_to_demande(p public.plan_tier)
returns text language sql immutable as $$
  select case p
    when 'advanced' then 'pro'
    when 'premium' then 'premium'
    else 'gratuit'
  end;
$$;

-- Config paiement (lecture publique)
create or replace function public.get_config_paiement()
returns json language sql stable security definer set search_path = public as $$
  select to_json(c.*) from public.config_paiement c where c.id = 1;
$$;

grant execute on function public.get_config_paiement() to anon, authenticated;

-- Créer une demande (auth ou legacy)
create or replace function public.create_demande_abonnement(
  p_legacy_pro_id bigint default null,
  p_pro_nom text default null,
  p_pro_email text default null,
  p_plan_demande text default null,
  p_plan_actuel text default 'gratuit',
  p_montant integer default null,
  p_numero_emetteur text default null,
  p_id_transaction text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_user uuid := auth.uid();
begin
  if p_plan_demande not in ('pro', 'premium') then
    raise exception 'Plan invalide';
  end if;
  if coalesce(trim(p_numero_emetteur), '') = '' then
    raise exception 'Numéro émetteur requis';
  end if;

  insert into public.demandes_abonnement (
    user_id, legacy_pro_id, pro_nom, pro_email,
    plan_demande, plan_actuel, montant,
    numero_emetteur, id_transaction
  ) values (
    v_user, p_legacy_pro_id, p_pro_nom, p_pro_email,
    p_plan_demande, coalesce(p_plan_actuel, 'gratuit'), coalesce(p_montant, 0),
    trim(p_numero_emetteur), nullif(trim(p_id_transaction), '')
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_demande_abonnement(
  bigint, text, text, text, text, integer, text, text
) to anon, authenticated;

-- Demandes en attente (admin — via service role ou admin auth)
create or replace function public.get_demandes_abonnement_pending()
returns setof public.demandes_abonnement language sql stable security definer set search_path = public as $$
  select * from public.demandes_abonnement
  where statut = 'en_attente'
  order by created_at asc;
$$;

grant execute on function public.get_demandes_abonnement_pending() to anon, authenticated;

-- Statut abonnement par legacy pro id
create or replace function public.get_subscription_status_by_legacy(p_legacy_pro_id bigint)
returns json language plpgsql stable security definer set search_path = public as $$
declare
  v_pro public.professionals%rowtype;
  v_prof public.profiles%rowtype;
  v_pending integer;
begin
  select * into v_pro from public.professionals where legacy_local_id = p_legacy_pro_id limit 1;

  if v_pro.user_id is not null then
    select * into v_prof from public.profiles where id = v_pro.user_id;
  end if;

  select count(*) into v_pending
  from public.demandes_abonnement d
  where d.statut = 'en_attente'
    and (d.legacy_pro_id = p_legacy_pro_id
      or (v_pro.user_id is not null and d.user_id = v_pro.user_id));

  return json_build_object(
    'plan', coalesce(v_prof.plan, public.plan_tier_to_demande(v_pro.plan)),
    'plan_actif', coalesce(v_prof.plan_actif, v_pro.plan_actif, false),
    'plan_debut', coalesce(v_prof.plan_debut, v_pro.premium_since),
    'plan_fin', coalesce(v_prof.plan_fin, v_pro.premium_expires),
    'demandes_en_attente', v_pending
  );
end;
$$;

grant execute on function public.get_subscription_status_by_legacy(bigint) to anon, authenticated;

-- Valider une demande
create or replace function public.valider_demande_abonnement(
  p_demande_id uuid,
  p_admin_id uuid default null
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_d public.demandes_abonnement%rowtype;
  v_pro public.professionals%rowtype;
  v_debut timestamptz := now();
  v_fin timestamptz;
  v_duree integer := 30;
  v_tier public.plan_tier;
begin
  select * into v_d from public.demandes_abonnement where id = p_demande_id for update;
  if not found then raise exception 'Demande introuvable'; end if;
  if v_d.statut <> 'en_attente' then raise exception 'Demande déjà traitée'; end if;

  v_tier := public.plan_demande_to_tier(v_d.plan_demande);
  v_fin := v_debut + (v_duree || ' days')::interval;

  if v_d.legacy_pro_id is not null then
    select * into v_pro from public.professionals where legacy_local_id = v_d.legacy_pro_id limit 1;
  elsif v_d.user_id is not null then
    select * into v_pro from public.professionals where user_id = v_d.user_id limit 1;
  end if;

  if v_pro.id is not null then
    update public.professionals set
      plan = v_tier,
      plan_actif = true,
      premium_since = v_debut,
      premium_expires = v_fin,
      alerte_expiration_envoyee = false,
      updated_at = now()
    where id = v_pro.id;
  end if;

  if v_d.user_id is not null then
    update public.profiles set
      plan = v_d.plan_demande,
      plan_debut = v_debut,
      plan_fin = v_fin,
      plan_actif = true,
      alerte_expiration_envoyee = false,
      updated_at = now()
    where id = v_d.user_id;
  end if;

  update public.demandes_abonnement set
    statut = 'validee',
    traite_par = p_admin_id,
    traite_le = now()
  where id = p_demande_id;

  if v_d.user_id is not null then
    insert into public.notifications (user_id, source, type, title, message, lien, lue)
    values (
      v_d.user_id,
      'abonnement',
      'abonnement_active',
      'Abonnement activé !',
      format('Votre plan %s est actif jusqu''au %s.', v_d.plan_demande, to_char(v_fin, 'DD/MM/YYYY')),
      '/espace-pro?tab=settings',
      false
    );
  end if;

  return json_build_object(
    'ok', true,
    'plan', v_d.plan_demande,
    'plan_fin', v_fin,
    'legacy_pro_id', v_d.legacy_pro_id,
    'user_id', v_d.user_id,
    'pro_email', v_d.pro_email
  );
end;
$$;

grant execute on function public.valider_demande_abonnement(uuid, uuid) to anon, authenticated;

-- Refuser une demande
create or replace function public.refuser_demande_abonnement(
  p_demande_id uuid,
  p_motif text default null,
  p_admin_id uuid default null
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_d public.demandes_abonnement%rowtype;
begin
  select * into v_d from public.demandes_abonnement where id = p_demande_id for update;
  if not found then raise exception 'Demande introuvable'; end if;
  if v_d.statut <> 'en_attente' then raise exception 'Demande déjà traitée'; end if;

  update public.demandes_abonnement set
    statut = 'refusee',
    motif_refus = nullif(trim(p_motif), ''),
    traite_par = p_admin_id,
    traite_le = now()
  where id = p_demande_id;

  if v_d.user_id is not null then
    insert into public.notifications (user_id, source, type, title, message, lien, lue)
    values (
      v_d.user_id,
      'abonnement',
      'abonnement_refuse',
      'Demande d''abonnement refusée',
      coalesce(nullif(trim(p_motif), ''), 'Votre demande n''a pas pu être validée. Contactez le support.'),
      '/espace-pro?tab=upgrade',
      false
    );
  end if;

  return json_build_object('ok', true, 'pro_email', v_d.pro_email, 'user_id', v_d.user_id);
end;
$$;

grant execute on function public.refuser_demande_abonnement(uuid, text, uuid) to anon, authenticated;

-- Désactiver abonnement manuellement
create or replace function public.desactiver_abonnement_pro(
  p_legacy_pro_id bigint default null,
  p_user_id uuid default null
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_pro public.professionals%rowtype;
begin
  if p_legacy_pro_id is not null then
    select * into v_pro from public.professionals where legacy_local_id = p_legacy_pro_id limit 1;
  elsif p_user_id is not null then
    select * into v_pro from public.professionals where user_id = p_user_id limit 1;
  end if;

  if v_pro.id is not null then
    update public.professionals set
      plan = 'free',
      plan_actif = false,
      premium_expires = now(),
      updated_at = now()
    where id = v_pro.id;
  end if;

  if coalesce(p_user_id, v_pro.user_id) is not null then
    update public.profiles set
      plan = 'gratuit',
      plan_actif = false,
      plan_fin = now(),
      updated_at = now()
    where id = coalesce(p_user_id, v_pro.user_id);
  end if;

  return json_build_object('ok', true, 'pro_email', (select email from public.profiles where id = coalesce(p_user_id, v_pro.user_id)));
end;
$$;

grant execute on function public.desactiver_abonnement_pro(bigint, uuid) to anon, authenticated;

-- Cron : alertes J-10 + expirations
create or replace function public.verifier_abonnements_expiration()
returns json language plpgsql security definer set search_path = public as $$
declare
  v_alertes integer := 0;
  v_expires integer := 0;
  r record;
  v_plan_label text;
begin
  for r in
    select p.id, p.plan, p.plan_fin, p.email, coalesce(pr.legacy_local_id, pr.id) as legacy_ref
    from public.profiles p
    left join public.professionals pr on pr.user_id = p.id
    where p.plan <> 'gratuit'
      and p.plan_actif = true
      and p.alerte_expiration_envoyee = false
      and p.plan_fin is not null
      and p.plan_fin <= now() + interval '10 days'
      and p.plan_fin > now()
  loop
    v_plan_label := r.plan;
    insert into public.notifications (user_id, source, type, title, message, lien, lue)
    values (
      r.id,
      'abonnement',
      'abonnement_expire_bientot',
      format('Votre plan %s expire bientôt', v_plan_label),
      format('Votre plan %s expire dans 10 jours. Renouvelez ou passez à un plan supérieur.', v_plan_label),
      '/espace-pro?tab=upgrade',
      false
    );
    update public.profiles set alerte_expiration_envoyee = true where id = r.id;
    v_alertes := v_alertes + 1;
  end loop;

  for r in
    select p.id, p.plan, p.email, pr.legacy_local_id
    from public.profiles p
    left join public.professionals pr on pr.user_id = p.id
    where p.plan <> 'gratuit'
      and p.plan_actif = true
      and p.plan_fin is not null
      and p.plan_fin <= now()
  loop
    update public.profiles set
      plan = 'gratuit',
      plan_actif = false,
      alerte_expiration_envoyee = false
    where id = r.id;

    if r.legacy_local_id is not null then
      update public.professionals set
        plan = 'free',
        plan_actif = false,
        premium_expires = now()
      where legacy_local_id = r.legacy_local_id;
    end if;

    insert into public.notifications (user_id, source, type, title, message, lien, lue)
    values (
      r.id,
      'abonnement',
      'abonnement_expire',
      'Abonnement expiré',
      format('Votre abonnement %s a expiré. Vous êtes sur le plan gratuit.', r.plan),
      '/espace-pro?tab=upgrade',
      false
    );
    v_expires := v_expires + 1;
  end loop;

  return json_build_object('alertes_j10', v_alertes, 'expirations', v_expires);
end;
$$;

grant execute on function public.verifier_abonnements_expiration() to anon, authenticated, service_role;

-- Mettre à jour config (admin)
create or replace function public.update_config_paiement(
  p_numero_depot text,
  p_nom_titulaire text default null,
  p_operateur text default null,
  p_email_admin text default null
)
returns json language sql security definer set search_path = public as $$
  update public.config_paiement set
    numero_depot = coalesce(nullif(trim(p_numero_depot), ''), numero_depot),
    nom_titulaire = coalesce(p_nom_titulaire, nom_titulaire),
    operateur = coalesce(p_operateur, operateur),
    email_admin = coalesce(p_email_admin, email_admin)
  where id = 1
  returning to_json(config_paiement.*);
$$;

grant execute on function public.update_config_paiement(text, text, text, text) to anon, authenticated;
