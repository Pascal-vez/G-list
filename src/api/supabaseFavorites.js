import { supabase, useSupabase } from '../lib/supabaseClient';

function parse(data) {
  if (data == null) return null;
  if (typeof data === 'string') { try { return JSON.parse(data); } catch { return null; } }
  return data;
}

export async function fetchFavorites(visitorKey) {
  if (!useSupabase || !supabase || !visitorKey) return null;
  const { data, error } = await supabase.rpc('app_get_favorites', { p_visitor_key: visitorKey });
  if (error) throw error;
  return (parse(data)?.favorites ?? []).map(Number);
}

export async function toggleFavoriteRemote(visitorKey, legacyProId) {
  if (!useSupabase || !supabase || !visitorKey) return null;
  const { data, error } = await supabase.rpc('app_toggle_favorite', {
    p_visitor_key: visitorKey,
    p_legacy_pro_id: Number(legacyProId),
  });
  if (error) throw error;
  return parse(data);
}
