import { supabase, useSupabase } from '../lib/supabaseClient';
import { toPlanDemande, fromPlanDemande } from '../utils/plans';

export async function fetchConfigPaiementSupabase() {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_config_paiement');
  if (error) throw error;
  return data;
}

export async function createDemandeSupabase({ account, planDemande, numeroEmetteur, idTransaction, heureTransaction }) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('create_demande_abonnement', {
    p_legacy_pro_id: account?.id ?? null,
    p_pro_nom: account?.nom ?? null,
    p_pro_email: account?.email ?? null,
    p_plan_demande: planDemande,
    p_plan_actuel: toPlanDemande(account?.plan || 'free'),
    p_montant: planDemande === 'premium' ? 50000 : 15000,
    p_numero_emetteur: numeroEmetteur,
    p_id_transaction: idTransaction || null,
    p_heure_transaction: heureTransaction || null,
  });
  if (error) throw error;
  return data;
}

export async function fetchPendingDemandesSupabase() {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('get_demandes_abonnement_pending');
  if (error) throw error;
  return data || [];
}

export async function validerDemandeSupabase(demandeId) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('valider_demande_abonnement', {
    p_demande_id: demandeId,
    p_admin_id: null,
  });
  if (error) throw error;
  return data;
}

export async function refuserDemandeSupabase(demandeId, motif) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('refuser_demande_abonnement', {
    p_demande_id: demandeId,
    p_motif: motif,
    p_admin_id: null,
  });
  if (error) throw error;
  return data;
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
  const { data, error } = await supabase.rpc('get_subscription_status_by_legacy', {
    p_legacy_pro_id: legacyProId,
  });
  if (error) throw error;
  return data;
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
