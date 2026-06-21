-- Suppression complète d'un compte pro (annuaire, mini-site, abonnements)
-- Appelée automatiquement depuis l'app à la suppression du compte.

create or replace function public.delete_professional_complete(
  p_legacy_id bigint default null,
  p_slug text default null,
  p_email text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pro_id bigint;
  v_slug text;
  v_email text;
begin
  v_email := lower(trim(coalesce(p_email, '')));
  v_slug := lower(regexp_replace(coalesce(p_slug, ''), '[^a-z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);

  if p_legacy_id is not null then
    select id into v_pro_id
    from public.professionals
    where legacy_local_id = p_legacy_id
    limit 1;
  end if;

  if v_pro_id is null and v_slug <> '' then
    select m.professional_id into v_pro_id
    from public.minisites m
    where m.slug = v_slug
    limit 1;
  end if;

  if v_pro_id is null and v_email <> '' then
    select pr.id into v_pro_id
    from public.professionals pr
    join public.profiles pf on pf.id = pr.user_id
    where lower(pf.email) = v_email
    limit 1;
  end if;

  -- Nettoyer les demandes d'abonnement liées
  if p_legacy_id is not null then
    delete from public.demandes_abonnement where legacy_pro_id = p_legacy_id;
  end if;
  if v_email <> '' then
    delete from public.demandes_abonnement where lower(pro_email) = v_email;
  end if;

  if v_pro_id is null then
    return jsonb_build_object('ok', true, 'deleted', false);
  end if;

  delete from public.minisites where professional_id = v_pro_id;
  delete from public.professionals where id = v_pro_id;

  return jsonb_build_object(
    'ok', true,
    'deleted', true,
    'professional_id', v_pro_id
  );
end;
$$;

grant execute on function public.delete_professional_complete(bigint, text, text) to anon, authenticated;

-- Compatibilité : les anciens appels continuent de fonctionner
create or replace function public.delete_professional_by_legacy(p_legacy_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.delete_professional_complete(p_legacy_id := p_legacy_id);
end;
$$;

create or replace function public.delete_professional_by_slug(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.delete_professional_complete(p_slug := p_slug);
end;
$$;
