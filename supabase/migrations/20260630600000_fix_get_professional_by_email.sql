-- Fix connexion multi-appareils : get_professional_by_email
-- 1. Retourne plan_actif, premium_since, premium_expires (absents de la v1)
-- 2. Fallback sur demandes_abonnement quand le pro n'a pas de ligne dans professionals
--    (compte localStorage jamais synchronisé avec Supabase)

create or replace function public.get_professional_by_email(p_email text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_row        public.professionals%rowtype;
  v_leg_id     bigint;
  v_pro_nom    text;
  v_plan       text;
  v_plan_actif boolean := false;
  v_plan_fin   timestamptz;
begin
  -- Recherche principale dans professionals
  select * into v_row
  from public.professionals
  where lower(email) = lower(trim(p_email))
  limit 1;

  if found then
    return jsonb_build_object(
      'found',           true,
      'id',              v_row.legacy_local_id,
      'nom',             v_row.nom,
      'profession',      v_row.profession,
      'categorie',       v_row.categorie,
      'region',          v_row.region,
      'quartier',        v_row.quartier,
      'telephone',       v_row.telephone,
      'whatsapp',        v_row.whatsapp,
      'description',     v_row.description,
      'slogan',          v_row.slogan,
      'plan',            v_row.plan,
      'plan_actif',      coalesce(v_row.plan_actif, false),
      'premium_since',   v_row.premium_since,
      'premium_expires', v_row.premium_expires,
      'horaires',        v_row.horaires,
      'specialites',     v_row.specialites,
      'services',        v_row.services,
      'social',          v_row.social,
      'verifie',         v_row.verifie,
      'profile_views',   v_row.profile_views
    );
  end if;

  -- Fallback : chercher dans demandes_abonnement par email
  -- (pro enregistré localement, jamais synchronisé dans professionals)
  select legacy_pro_id, pro_nom
  into   v_leg_id, v_pro_nom
  from   public.demandes_abonnement
  where  lower(trim(pro_email)) = lower(trim(p_email))
    and  legacy_pro_id is not null
  order by created_at desc
  limit 1;

  if v_leg_id is null then
    return jsonb_build_object('found', false);
  end if;

  -- Chercher une demande validée non expirée pour ce pro
  select plan_demande,
         traite_le + interval '30 days'
  into   v_plan, v_plan_fin
  from   public.demandes_abonnement
  where  lower(trim(pro_email)) = lower(trim(p_email))
    and  statut = 'validee'
    and  (traite_le is null or traite_le + interval '30 days' > now())
  order by traite_le desc nulls last
  limit 1;

  if v_plan is not null then
    v_plan_actif := true;
  else
    v_plan       := 'gratuit';
    v_plan_actif := false;
    v_plan_fin   := null;
  end if;

  return jsonb_build_object(
    'found',           true,
    'id',              v_leg_id,
    'nom',             coalesce(v_pro_nom, ''),
    'profession',      '',
    'categorie',       'Services',
    'region',          'Conakry',
    'quartier',        'Centre',
    'telephone',       '',
    'whatsapp',        '',
    'description',     '',
    'slogan',          '',
    'plan',            public.plan_demande_to_tier(v_plan)::text,
    'plan_actif',      v_plan_actif,
    'premium_since',   null::timestamptz,
    'premium_expires', v_plan_fin,
    'horaires',        'Lun-Sam 8h-18h',
    'specialites',     '[]'::jsonb,
    'services',        '[]'::jsonb,
    'social',          '{}'::jsonb,
    'verifie',         false,
    'profile_views',   0
  );
end;
$$;

grant execute on function public.get_professional_by_email(text) to anon, authenticated;
