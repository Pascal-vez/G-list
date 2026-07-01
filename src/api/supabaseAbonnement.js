import { supabase, useSupabase } from '../lib/supabaseClient';
import { toPlanDemande, getMontantPlan, fromPlanDemande } from '../utils/plans';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeDemandeUuid(id) {
  const s = String(id || '').trim();
  return UUID_RE.test(s) ? s : null;
}

function parseRpcJson(data) {
  if (data == null) return null;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return null; }
  }
  return data;
}

export async function fetchConfigPaiementSupabase() {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_config_paiement');
  if (error) throw error;
  return data;
}

export async function createDemandeSupabase({ account, planDemande, numeroEmetteur, idTransaction, heureTransaction }) {
  if (!supabase) throw new Error('Supabase non configuré');
  const legacyId = Number(account?.id);
  const { data, error } = await supabase.rpc('create_demande_abonnement', {
    p_legacy_pro_id: Number.isFinite(legacyId) ? legacyId : null,
    p_pro_nom: account?.nom ?? null,
    p_pro_email: account?.email ?? null,
    p_plan_demande: planDemande,
    p_plan_actuel: toPlanDemande(account?.plan || 'free'),
    p_montant: getMontantPlan(planDemande),
    p_numero_emetteur: numeroEmetteur,
    p_id_transaction: idTransaction || null,
    p_heure_transaction: heureTransaction || null,
  });
  if (error) throw new Error(error.message || 'Création de la demande impossible');
  if (!data) throw new Error('La demande n\'a pas pu être enregistrée');
  return data;
}

export async function fetchPendingDemandesSupabase() {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('get_demandes_abonnement_pending');
  if (error) throw error;
  return (data || []).filter((d) => d?.statut === 'en_attente');
}

export async function validerDemandeSupabase(demandeId) {
  if (!supabase) throw new Error('Supabase non configuré');
  const uuid = normalizeDemandeUuid(demandeId);
  if (!uuid) throw new Error('Identifiant de demande invalide');
  const { data, error } = await supabase.rpc('valider_demande_abonnement', {
    p_demande_id: uuid,
    p_admin_id: null,
  });
  if (error) throw new Error(error.message || 'Activation impossible');
  return parseRpcJson(data);
}

export async function refuserDemandeSupabase(demandeId, motif) {
  if (!supabase) throw new Error('Supabase non configuré');
  const uuid = normalizeDemandeUuid(demandeId);
  if (!uuid) throw new Error('Identifiant de demande invalide');
  const { data, error } = await supabase.rpc('refuser_demande_abonnement', {
    p_demande_id: uuid,
    p_motif: motif,
    p_admin_id: null,
  });
  if (error) throw new Error(error.message || 'Refus impossible');
  return parseRpcJson(data);
}

export async function resolveDemandeLegacySupabase(legacyProId, action, motif = null) {
  if (!supabase) throw new Error('Supabase non configuré');
  const id = Number(legacyProId);
  if (!Number.isFinite(id)) throw new Error('Professionnel invalide');
  const { data, error } = await supabase.rpc('admin_resolve_demande_legacy', {
    p_legacy_pro_id: id,
    p_action: action,
    p_motif: motif,
  });
  if (error) throw new Error(error.message || 'Action impossible');
  const parsed = parseRpcJson(data);
  if (parsed?.ok === false) throw new Error(parsed.error || 'Action impossible');
  return parsed;
}

export async function desactiverAbonnementSupabase(proId) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('desactiver_abonnement_pro', {
    p_legacy_pro_id: proId,
    p_user_id: null,
  });
  if (error) throw error;
  return data;
}

export async function fetchSubscriptionStatusSupabase(legacyProId) {
  if (!supabase) return null;
  const id = Number(legacyProId);
  if (!Number.isFinite(id)) return null;
  const { data, error } = await supabase.rpc('get_subscription_status_by_legacy', {
    p_legacy_pro_id: id,
  });
  if (error) throw error;
  return data;
}

/** Compte les demandes en attente par legacy id ou email pro (fallback fiable). */
export async function countPendingDemandesForAccount(account) {
  if (!supabase || !account) return 0;
  const legacyId = Number(account.id);
  const email = account.email?.trim().toLowerCase();
  let count = 0;

  if (Number.isFinite(legacyId)) {
    const { data, error } = await supabase.rpc('get_subscription_status_by_legacy', {
      p_legacy_pro_id: legacyId,
    });
    if (!error && data?.demandes_en_attente > 0) {
      return data.demandes_en_attente;
    }
  }

  const { data: pending, error: pendingErr } = await supabase.rpc('get_demandes_abonnement_pending');
  if (pendingErr || !Array.isArray(pending)) return count;

  count = pending.filter((d) => {
    if (d.statut !== 'en_attente') return false;
    if (Number.isFinite(legacyId) && d.legacy_pro_id != null && Number(d.legacy_pro_id) === legacyId) {
      return true;
    }
    if (email && d.pro_email?.trim().toLowerCase() === email) return true;
    return false;
  }).length;

  return count;
}

export async function updateConfigPaiementSupabase(partial) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('update_config_paiement', {
    p_numero_depot: partial.numero_depot,
    p_nom_titulaire: partial.nom_titulaire,
    p_operateur: partial.operateur,
    p_email_admin: partial.email_admin,
  });
  if (error) throw error;
  return data;
}

export async function triggerExpirationCronSupabase() {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('verifier_abonnements_expiration');
  if (error) throw error;
  return data;
}

export { useSupabase, fromPlanDemande };
