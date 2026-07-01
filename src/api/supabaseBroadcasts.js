import { supabase, useSupabase } from '../lib/supabaseClient';

function parse(data) {
  if (data == null) return null;
  if (typeof data === 'string') { try { return JSON.parse(data); } catch { return null; } }
  return data;
}

export async function fetchActiveBroadcasts(visitorKey, audience) {
  if (!useSupabase || !supabase) return null;
  const { data, error } = await supabase.rpc('app_list_broadcasts', {
    p_visitor_key: visitorKey || null,
    p_audience: audience || null,
  });
  if (error) throw error;
  return parse(data)?.broadcasts ?? [];
}

export async function fetchAllBroadcastsAdmin() {
  if (!useSupabase || !supabase) return null;
  const { data, error } = await supabase.rpc('app_get_broadcasts_admin');
  if (error) throw error;
  return parse(data)?.broadcasts ?? [];
}

export async function createBroadcastRemote({ title, message, type, audience, expiresAt, pinned, dismissible }) {
  if (!useSupabase || !supabase) return null;
  const { data, error } = await supabase.rpc('app_create_broadcast', {
    p_title: title,
    p_message: message,
    p_type: type || 'info',
    p_audience: audience || 'all',
    p_expires_at: expiresAt || null,
    p_pinned: pinned ?? false,
    p_dismissible: dismissible ?? true,
  });
  if (error) throw error;
  return parse(data);
}

export async function dismissBroadcastRemote(visitorKey, broadcastId) {
  if (!useSupabase || !supabase || !visitorKey) return;
  const { error } = await supabase.rpc('app_dismiss_broadcast', {
    p_visitor_key: String(visitorKey),
    p_broadcast_id: Number(broadcastId),
  });
  if (error) console.warn('[broadcast dismiss]', error.message);
}

export async function updateBroadcastRemote(id, { active, pinned } = {}) {
  if (!useSupabase || !supabase) return;
  const { error } = await supabase.rpc('app_update_broadcast', {
    p_id: Number(id),
    p_active: active ?? null,
    p_pinned: pinned ?? null,
  });
  if (error) throw error;
}

export async function deleteBroadcastRemote(id) {
  if (!useSupabase || !supabase) return;
  const { error } = await supabase.rpc('app_delete_broadcast', { p_id: Number(id) });
  if (error) throw error;
}
