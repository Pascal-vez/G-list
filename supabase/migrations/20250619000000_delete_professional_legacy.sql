-- Suppression d'une fiche pro créée via legacy_local_id (mini-site / compte local)

create or replace function public.delete_professional_by_legacy(p_legacy_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pro_id bigint;
begin
  if p_legacy_id is null then
    return jsonb_build_object('ok', false, 'error', 'LEGACY_ID_REQUIRED');
  end if;

  select id into v_pro_id
  from public.professionals
  where legacy_local_id = p_legacy_id;

  if v_pro_id is null then
    return jsonb_build_object('ok', true, 'deleted', false);
  end if;

  delete from public.minisites where professional_id = v_pro_id;
  delete from public.professionals where id = v_pro_id;

  return jsonb_build_object('ok', true, 'deleted', true, 'professional_id', v_pro_id);
end;
$$;

grant execute on function public.delete_professional_by_legacy(bigint) to anon, authenticated;

-- Suppression par slug (secours admin / compte déjà effacé localement)
create or replace function public.delete_professional_by_slug(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
  v_pro_id bigint;
begin
  v_slug := lower(regexp_replace(coalesce(p_slug, ''), '[^a-z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);

  if v_slug = '' then
    return jsonb_build_object('ok', false, 'error', 'SLUG_REQUIRED');
  end if;

  select m.professional_id into v_pro_id
  from public.minisites m
  where m.slug = v_slug
  limit 1;

  if v_pro_id is null then
    return jsonb_build_object('ok', true, 'deleted', false);
  end if;

  delete from public.minisites where professional_id = v_pro_id;
  delete from public.professionals where id = v_pro_id;

  return jsonb_build_object('ok', true, 'deleted', true, 'professional_id', v_pro_id, 'slug', v_slug);
end;
$$;

grant execute on function public.delete_professional_by_slug(text) to anon, authenticated;
