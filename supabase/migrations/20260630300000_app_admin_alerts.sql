-- ── G-List : admin_alerts cross-device ───────────────────────────────────────
-- Coller dans Supabase Dashboard → SQL Editor → Run

create table if not exists public.app_admin_alerts (
  id         bigint generated always as identity primary key,
  type       text not null default 'info',
  title      text not null,
  message    text not null,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

-- Envoyer une alerte (appelé depuis le frontend pro via anon key)
create or replace function public.app_push_admin_alert(
  p_type    text default 'info',
  p_title   text default '',
  p_message text default '',
  p_link    text default null
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_id bigint;
begin
  if coalesce(trim(p_title), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'TITLE_REQUIRED');
  end if;
  insert into public.app_admin_alerts(type, title, message, link)
  values(coalesce(nullif(trim(p_type), ''), 'info'), trim(p_title), coalesce(p_message, ''), p_link)
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;
grant execute on function public.app_push_admin_alert(text, text, text, text) to anon, authenticated;

-- Lire les alertes (admin)
create or replace function public.app_get_admin_alerts(p_limit int default 30)
returns jsonb
language plpgsql security definer set search_path = public
stable
as $$
declare v_alerts jsonb; v_unread int;
begin
  select coalesce(jsonb_agg(row_to_json(a) order by a.created_at desc), '[]'::jsonb)
  into v_alerts
  from (
    select * from public.app_admin_alerts
    order by created_at desc
    limit coalesce(p_limit, 30)
  ) a;

  select count(*)::int into v_unread
  from public.app_admin_alerts where read_at is null;

  return jsonb_build_object('ok', true, 'alerts', v_alerts, 'unread', v_unread);
end;
$$;
grant execute on function public.app_get_admin_alerts(int) to anon, authenticated;

-- Marquer une alerte comme lue
create or replace function public.app_mark_admin_alert_read(p_id bigint)
returns jsonb
language plpgsql security definer set search_path = public
as $$
begin
  update public.app_admin_alerts set read_at = now() where id = p_id and read_at is null;
  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.app_mark_admin_alert_read(bigint) to anon, authenticated;

-- Marquer toutes les alertes comme lues
create or replace function public.app_mark_all_admin_alerts_read()
returns jsonb
language plpgsql security definer set search_path = public
as $$
begin
  update public.app_admin_alerts set read_at = now() where read_at is null;
  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.app_mark_all_admin_alerts_read() to anon, authenticated;
