import { supabase, useSupabase } from '../lib/supabaseClient';

function parse(data) {
  if (data == null) return null;
  if (typeof data === 'string') { try { return JSON.parse(data); } catch { return null; } }
  return data;
}

export async function logAuditRemote({ actor, actorType, action, target, details }) {
  if (!useSupabase || !supabase) return;
  try {
    await supabase.rpc('app_log_audit', {
      p_actor_email: String(actor || 'system'),
      p_actor_type: actorType || 'system',
      p_action: action || 'system',
      p_target: target ? String(target) : null,
      p_details: details ? String(details) : null,
    });
  } catch { /* silent — audit ne doit pas bloquer l'action */ }
}

export async function fetchAuditLogRemote({ limit = 100, action, actorType, startDate, endDate } = {}) {
  if (!useSupabase || !supabase) return null;
  const { data, error } = await supabase.rpc('app_get_audit_log', {
    p_limit: limit,
    p_action: action || null,
    p_actor_type: actorType || null,
    p_start_date: startDate || null,
    p_end_date: endDate || null,
  });
  if (error) throw error;
  return parse(data)?.entries ?? [];
}
