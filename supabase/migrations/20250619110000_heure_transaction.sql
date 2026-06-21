-- Heure déclarée par le pro lors de la confirmation du paiement Orange Money

alter table public.demandes_abonnement
  add column if not exists heure_transaction timestamptz;

create or replace function public.create_demande_abonnement(
  p_legacy_pro_id bigint default null,
  p_pro_nom text default null,
  p_pro_email text default null,
  p_plan_demande text default null,
  p_plan_actuel text default 'gratuit',
  p_montant integer default null,
  p_numero_emetteur text default null,
  p_id_transaction text default null,
  p_heure_transaction timestamptz default null
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
  if p_heure_transaction is null then
    raise exception 'Heure de transaction requise';
  end if;

  insert into public.demandes_abonnement (
    user_id, legacy_pro_id, pro_nom, pro_email,
    plan_demande, plan_actuel, montant,
    numero_emetteur, id_transaction, heure_transaction
  ) values (
    v_user, p_legacy_pro_id, p_pro_nom, p_pro_email,
    p_plan_demande, coalesce(p_plan_actuel, 'gratuit'), coalesce(p_montant, 0),
    trim(p_numero_emetteur), nullif(trim(p_id_transaction), ''), p_heure_transaction
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_demande_abonnement(
  bigint, text, text, text, text, integer, text, text, timestamptz
) to anon, authenticated;
