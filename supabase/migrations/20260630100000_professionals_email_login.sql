-- Connexion multi-appareils : lier l'email au profil pro dans Supabase

alter table public.professionals
  add column if not exists email text;

create index if not exists professionals_email_idx
  on public.professionals (lower(email));

-- RPC : récupérer le profil pro par email (utilisé à la connexion sur un nouvel appareil)
create or replace function public.get_professional_by_email(p_email text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_row public.professionals;
begin
  select * into v_row
  from public.professionals
  where lower(email) = lower(trim(p_email))
  limit 1;

  if not found then
    return jsonb_build_object('found', false);
  end if;

  return jsonb_build_object(
    'found',         true,
    'id',            v_row.legacy_local_id,
    'nom',           v_row.nom,
    'profession',    v_row.profession,
    'categorie',     v_row.categorie,
    'region',        v_row.region,
    'quartier',      v_row.quartier,
    'telephone',     v_row.telephone,
    'whatsapp',      v_row.whatsapp,
    'description',   v_row.description,
    'slogan',        v_row.slogan,
    'plan',          v_row.plan,
    'horaires',      v_row.horaires,
    'specialites',   v_row.specialites,
    'services',      v_row.services,
    'social',        v_row.social,
    'verifie',       v_row.verifie,
    'profile_views', v_row.profile_views
  );
end;
$$;
grant execute on function public.get_professional_by_email(text) to anon, authenticated;

-- RPC : associer un email à un profil pro (appelé après chaque upsert)
create or replace function public.link_professional_email(p_legacy_id bigint, p_email text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.professionals
  set email = lower(trim(p_email))
  where legacy_local_id = p_legacy_id;
end;
$$;
grant execute on function public.link_professional_email(bigint, text) to anon, authenticated;
