import { supabase, useSupabase } from '../lib/supabaseClient';

function parse(data) {
  if (data == null) return null;
  if (typeof data === 'string') { try { return JSON.parse(data); } catch { return null; } }
  return data;
}

export async function pushAdminAlertRemote({ type, title, message, link }) {
  if (!useSupabase || !supabase) return null;
  const { data, error } = await supabase.rpc('app_push_admin_alert', {
    p_type: type || 'info',
    p_title: title || '',
    p_message: message || '',
    p_link: link || null,
  });
  if (error) throw error;
  return parse(data);
}

export async function fetchAdminAlertsRemote(limit = 30) {
  if (!useSupabase || !supabase) return null;
  const { data, error } = await supabase.rpc('app_get_admin_alerts', { p_limit: limit });
  if (error) throw error;
  return parse(data);
}

export async function markAdminAlertReadRemote(id) {
  if (!useSupabase || !supabase) return;
  await supabase.rpc('app_mark_admin_alert_read', { p_id: Number(id) });
}

export async function markAllAdminAlertsReadRemote() {
  if (!useSupabase || !supabase) return;
  await supabase.rpc('app_mark_all_admin_alerts_read');
}
