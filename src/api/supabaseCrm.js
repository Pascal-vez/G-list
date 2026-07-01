import { supabase, useSupabase } from '../lib/supabaseClient';

function parse(data) {
  if (data == null) return null;
  if (typeof data === 'string') { try { return JSON.parse(data); } catch { return null; } }
  return data;
}

export async function fetchCrmProspects(legacyProId) {
  if (!useSupabase || !supabase) return null;
  const { data, error } = await supabase.rpc('app_get_crm_prospects', {
    p_legacy_pro_id: Number(legacyProId),
  });
  if (error) throw error;
  return parse(data)?.prospects ?? null;
}

export async function addCrmProspectRemote(legacyProId, { prenom, telephone, email, note }) {
  if (!useSupabase || !supabase) return null;
  const { data, error } = await supabase.rpc('app_add_crm_prospect', {
    p_legacy_pro_id: Number(legacyProId),
    p_prenom: prenom || 'Visiteur',
    p_telephone: telephone || null,
    p_email: email || null,
    p_note: note ? String(note).slice(0, 100) : null,
  });
  if (error) throw error;
  return parse(data);
}

export async function moveCrmProspectRemote(prospectId, column) {
  if (!useSupabase || !supabase) return;
  const { error } = await supabase.rpc('app_move_crm_prospect', {
    p_prospect_id: Number(prospectId),
    p_column: column,
  });
  if (error) throw error;
}

export async function deleteCrmProspectRemote(prospectId) {
  if (!useSupabase || !supabase) return;
  const { error } = await supabase.rpc('app_delete_crm_prospect', {
    p_prospect_id: Number(prospectId),
  });
  if (error) throw error;
}
