import { supabase, useSupabase } from '../lib/supabaseClient';

function parse(data) {
  if (data == null) return null;
  if (typeof data === 'string') { try { return JSON.parse(data); } catch { return null; } }
  return data;
}

export async function pushProNotificationRemote(legacyProId, { type, title, message }) {
  if (!useSupabase || !supabase || !legacyProId) return null;
  const { data, error } = await supabase.rpc('app_push_pro_notification', {
    p_legacy_pro_id: Number(legacyProId),
    p_type: type || 'info',
    p_title: title || '',
    p_message: message || '',
  });
  if (error) throw error;
  return parse(data);
}

export async function fetchProNotificationsRemote(legacyProId, limit = 30) {
  if (!useSupabase || !supabase || !legacyProId) return null;
  const { data, error } = await supabase.rpc('app_get_pro_notifications', {
    p_legacy_pro_id: Number(legacyProId),
    p_limit: limit,
  });
  if (error) throw error;
  return parse(data);
}

export async function markProNotificationReadRemote(id) {
  if (!useSupabase || !supabase) return;
  await supabase.rpc('app_mark_pro_notification_read', { p_id: Number(id) });
}

export async function markAllProNotificationsReadRemote(legacyProId) {
  if (!useSupabase || !supabase || !legacyProId) return;
  await supabase.rpc('app_mark_all_pro_notifications_read', { p_legacy_pro_id: Number(legacyProId) });
}
