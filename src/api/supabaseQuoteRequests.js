import { supabase, useSupabase } from '../lib/supabaseClient';

function parse(data) {
  if (data == null) return null;
  if (typeof data === 'string') { try { return JSON.parse(data); } catch { return null; } }
  return data;
}

export async function submitQuoteRemote(legacyProId, { nom, service, message, visitorEmail }) {
  if (!useSupabase || !supabase) return null;
  const { data, error } = await supabase.rpc('app_submit_quote', {
    p_legacy_pro_id: Number(legacyProId),
    p_nom: nom || 'Visiteur',
    p_service: service || '',
    p_message: message || '',
    p_visitor_email: visitorEmail || null,
  });
  if (error) throw error;
  return parse(data);
}

export async function fetchQuotesForPro(legacyProId) {
  if (!useSupabase || !supabase) return null;
  const { data, error } = await supabase.rpc('app_get_quotes_for_pro', {
    p_legacy_pro_id: Number(legacyProId),
  });
  if (error) throw error;
  return parse(data)?.quotes ?? [];
}

export async function updateQuoteStatusRemote(quoteId, status) {
  if (!useSupabase || !supabase) return;
  const { error } = await supabase.rpc('app_update_quote_status', {
    p_quote_id: Number(quoteId),
    p_status: status,
  });
  if (error) throw error;
}

export async function fetchVisitorQuotes(visitorEmail) {
  if (!useSupabase || !supabase || !visitorEmail) return null;
  const { data, error } = await supabase.rpc('app_get_visitor_quotes', {
    p_visitor_email: visitorEmail,
  });
  if (error) throw error;
  return parse(data)?.quotes ?? [];
}
