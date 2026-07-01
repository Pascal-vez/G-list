-- ── G-List : notifications pro cross-device ──────────────────────────────────
-- Coller dans Supabase Dashboard → SQL Editor → Run

create table if not exists public.app_pro_notifications (
  id             bigint generated always as identity primary key,
  legacy_pro_id  bigint not null,
  type           text not null default 'info',
  title          text not null,
  message        text not null,
  read_at        timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists app_pro_notifications_pro_idx
  on public.app_pro_notifications(legacy_pro_id, created_at desc);

-- Envoyer une notification à un pro (cross-device)
create or replace function public.app_push_pro_notification(
  p_legacy_pro_id bigint,
  p_type          text default 'info',
  p_title         text default '',
  p_message       text default ''
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_id bigint;
begin
  if p_legacy_pro_id is null then
    return jsonb_build_object('ok', false, 'error', 'PRO_ID_REQUIRED');
  end if;
  insert into public.app_pro_notifications(legacy_pro_id, type, title, message)
  values(p_legacy_pro_id, coalesce(nullif(trim(p_type), ''), 'info'), coalesce(p_title, ''), coalesce(p_message, ''))
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;
grant execute on function public.app_push_pro_notification(bigint, text, text, text) to anon, authenticated;

-- Lire les notifications d'un pro
create or replace function public.app_get_pro_notifications(
  p_legacy_pro_id bigint,
  p_limit         int default 30
)
returns jsonb
language plpgsql security definer set search_path = public
stable
as $$
declare v_notifs jsonb; v_unread int;
begin
  select coalesce(jsonb_agg(row_to_json(n) order by n.created_at desc), '[]'::jsonb)
  into v_notifs
  from (
    select * from public.app_pro_notifications
    where legacy_pro_id = p_legacy_pro_id
    order by created_at desc
    limit coalesce(p_limit, 30)
  ) n;

  select count(*)::int into v_unread
  from public.app_pro_notifications
  where legacy_pro_id = p_legacy_pro_id and read_at is null;

  return jsonb_build_object('ok', true, 'notifications', v_notifs, 'unread', v_unread);
end;
$$;
grant execute on function public.app_get_pro_notifications(bigint, int) to anon, authenticated;

-- Marquer une notification comme lue
create or replace function public.app_mark_pro_notification_read(p_id bigint)
returns jsonb
language plpgsql security definer set search_path = public
as $$
begin
  update public.app_pro_notifications set read_at = now() where id = p_id and read_at is null;
  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.app_mark_pro_notification_read(bigint) to anon, authenticated;

-- Marquer toutes les notifications d'un pro comme lues
create or replace function public.app_mark_all_pro_notifications_read(p_legacy_pro_id bigint)
returns jsonb
language plpgsql security definer set search_path = public
as $$
begin
  update public.app_pro_notifications
  set read_at = now()
  where legacy_pro_id = p_legacy_pro_id and read_at is null;
  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.app_mark_all_pro_notifications_read(bigint) to anon, authenticated;
