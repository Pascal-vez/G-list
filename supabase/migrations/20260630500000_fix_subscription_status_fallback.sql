-- ── G-List : correction statut abonnement ────────────────────────────────────
-- Problème : get_subscription_status_by_legacy retourne plan_actif=false quand
-- le pro n'existe pas encore dans la table professionals (compte localStorage
-- jamais synchronisé avec Supabase). La demande est bien validée dans
-- demandes_abonnement, mais professionals n'est pas mise à jour.
-- Correction : ajouter un fallback sur demandes_abonnement (statut=validee).
-- Coller dans Supabase Dashboard → SQL Editor → Run

create or replace function public.get_subscription_status_by_legacy(p_legacy_pro_id bigint)
returns json language plpgsql stable security definer set search_path = public as $$
declare
  v_pro    public.professionals%rowtype;
  v_prof   public.profiles%rowtype;
  v_pending integer;
  v_plan        text;
  v_plan_actif  boolean;
  v_plan_debut  timestamptz;
  v_plan_fin    timestamptz;
  v_dem_plan    text;
  v_dem_traite  timestamptz;
begin
  select * into v_pro from public.professionals
  where legacy_local_id = p_legacy_pro_id limit 1;

  if v_pro.user_id is not null then
    select * into v_prof from public.profiles where id = v_pro.user_id;
  end if;

  select count(*) into v_pending
  from public.demandes_abonnement d
  where d.statut = 'en_attente'
    and (d.legacy_pro_id = p_legacy_pro_id
      or (v_pro.user_id is not null and d.user_id = v_pro.user_id));

  -- Source principale : table professionals / profiles
  v_plan       := coalesce(v_prof.plan, public.plan_tier_to_demande(v_pro.plan));
  v_plan_actif := coalesce(v_prof.plan_actif, v_pro.plan_actif, false);
  v_plan_debut := coalesce(v_prof.plan_debut, v_pro.premium_since);
  v_plan_fin   := coalesce(v_prof.plan_fin,   v_pro.premium_expires);

  -- Fallback : si plan non actif, chercher la dernière demande validée non expirée
  if not coalesce(v_plan_actif, false) then
    select plan_demande, traite_le
    into   v_dem_plan, v_dem_traite
    from   public.demandes_abonnement
    where  legacy_pro_id = p_legacy_pro_id
      and  statut = 'validee'
      and  (traite_le is null or traite_le + interval '30 days' > now())
    order by traite_le desc nulls last
    limit 1;

    if v_dem_plan is not null then
      v_plan       := v_dem_plan;
      v_plan_actif := true;
      v_plan_debut := coalesce(v_plan_debut, v_dem_traite);
      v_plan_fin   := coalesce(
        v_plan_fin,
        case when v_dem_traite is not null
             then v_dem_traite + interval '30 days'
             else null end
      );
    end if;
  end if;

  return json_build_object(
    'plan',               v_plan,
    'plan_actif',         coalesce(v_plan_actif, false),
    'plan_debut',         v_plan_debut,
    'plan_fin',           v_plan_fin,
    'demandes_en_attente', v_pending
  );
end;
$$;

grant execute on function public.get_subscription_status_by_legacy(bigint) to anon, authenticated;
