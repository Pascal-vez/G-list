import { supabase, useSupabase } from '../lib/supabaseClient';
import { invalidateProfessionalsCache } from '../api/professionals';

export async function upsertAdminOverrideByLegacy(legacyProId, patch) {
  if (!useSupabase || !supabase) return { ok: false };
  const { data, error } = await supabase.rpc('upsert_admin_override_by_legacy', {
    p_legacy_id: Number(legacyProId),
    p_verifie: patch.verifie ?? null,
    p_disabled: patch.disabled ?? null,
    p_hidden: patch.hidden ?? null,
    p_flagged_duplicate: patch.flaggedDuplicate ?? null,
  });
  if (error) throw error;
  invalidateProfessionalsCache();
  window.dispatchEvent(new Event('glist-accounts-changed'));
  return data;
}
