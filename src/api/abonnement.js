import { apiConfig } from './config';
import { apiRequest } from './client';
import { supabase, useSupabase } from '../lib/supabaseClient';
import {
  getConfigPaiement,
  createDemandeAbonnement,
  getDemandesEnAttente,
  activerAbonnementLocal,
  refuserDemandeLocal,
  purgeLocalDemandesEnAttente,
  desactiverAbonnementLocal,
  getSubscriptionStatusForAccount,
  saveConfigPaiement,
  verifierAbonnementsLocal,
} from '../utils/abonnementStorage';
import {
  fetchConfigPaiementSupabase,
  createDemandeSupabase,
  fetchPendingDemandesSupabase,
  validerDemandeSupabase,
  refuserDemandeSupabase,
  resolveDemandeLegacySupabase,
  normalizeDemandeUuid,
  desactiverAbonnementSupabase,
  fetchSubscriptionStatusSupabase,
  countPendingDemandesForAccount,
  updateConfigPaiementSupabase,
  triggerExpirationCronSupabase,
} from './supabaseAbonnement';
import { toPlanDemande, PLANS_INFO, planLabel, fromPlanDemande } from '../utils/plans';
import {
  getProAccount, saveProAccount, adminSetProfessionalPlan, updateProAccountById,
  getAllProAccountsList,
} from '../utils/storage';
import { notifyProInbox } from '../utils/notificationInbox';
import { pushAdminNotification } from '../utils/adminNotifications';

export async function fetchConfigPaiement() {
  if (useSupabase) {
    try {
      const remote = await fetchConfigPaiementSupabase();
      if (remote) return remote;
    } catch { /* fallback local */ }
  }
  return getConfigPaiement();
}

export async function updateConfigPaiement(partial) {
  if (useSupabase) {
    try {
      return await updateConfigPaiementSupabase(partial);
    } catch { /* fallback */ }
  }
  return saveConfigPaiement(partial);
}

export async function fetchPendingDemandes() {
  if (useSupabase) {
    try {
      const remote = await fetchPendingDemandesSupabase();
      purgeLocalDemandesEnAttente();
      return remote;
    } catch (err) {
      console.warn('[abonnement] Lecture demandes Supabase échouée:', err?.message || err);
      return [];
    }
  }
  return getDemandesEnAttente();
}

export async function fetchSubscriptionStatus(account) {
  if (useSupabase && account) {
    try {
      const remote = await fetchSubscriptionStatusSupabase(account.id);
      const pending = await countPendingDemandesForAccount(account);
      if (remote) {
        return { ...remote, demandes_en_attente: Math.max(remote.demandes_en_attente || 0, pending) };
      }
      if (pending > 0) {
        return {
          plan: toPlanDemande(account.plan || 'free'),
          plan_actif: account.planActif !== false,
          plan_debut: account.planDebut || account.premiumSince,
          plan_fin: account.planFin || account.premiumExpires,
          demandes_en_attente: pending,
        };
      }
    } catch { /* fallback local */ }
  }
  return getSubscriptionStatusForAccount(account);
}

async function assertNoPendingDemande(account) {
  if (useSupabase && account) {
    const pending = await countPendingDemandesForAccount(account);
    if (pending > 0) {
      throw new Error('Vous avez déjà une demande en cours de traitement par notre équipe.');
    }
    return;
  }
  const status = getSubscriptionStatusForAccount(account);
  if (status?.demandes_en_attente > 0) {
    throw new Error('Vous avez déjà une demande en cours de traitement par notre équipe.');
  }
}

export async function submitDemandeAbonnement({ account, planId, numeroEmetteur, idTransaction, heureTransaction }) {
  const planDemande = toPlanDemande(planId);
  const acc = account || getProAccount();
  if (!acc) throw new Error('Compte pro requis');
  if (!heureTransaction) throw new Error('Heure de transaction requise');

  await assertNoPendingDemande(acc);

  let demandeId;

  if (useSupabase) {
    demandeId = await createDemandeSupabase({
      account: acc,
      planDemande,
      numeroEmetteur,
      idTransaction,
      heureTransaction,
    });
  } else {
    const local = createDemandeAbonnement({
      account: acc,
      planDemande,
      numeroEmetteur,
      idTransaction,
      heureTransaction,
    });
    demandeId = local.id;
  }

  try {
    const config = await fetchConfigPaiement().catch(() => null);
    const adminEmail = config?.email_admin?.trim() || undefined;

    await notifyAdminDemandeAbonnement({
      proNom: acc.nom,
      proEmail: acc.email,
      planDemande,
      montant: PLANS_INFO[planDemande]?.prix,
      numeroEmetteur,
      idTransaction,
      heureTransaction,
      demandeId,
      adminEmail,
    });
  } catch (err) {
    console.warn('[abonnement] Notification admin échouée (demande enregistrée):', err?.message || err);
  }

  if (acc.email) {
    try {
      await sendUserDemandeRecueEmail({
        to: acc.email,
        plan: planLabel(planDemande),
        montant: PLANS_INFO[planDemande]?.prix,
      });
    } catch (err) {
      console.warn('[abonnement] Email confirmation user échoué:', err?.message || err);
    }
  }

  pushAdminNotification({
    type: 'warning',
    title: 'Nouvelle demande d\'abonnement',
    message: `${acc.nom || acc.email} — ${planLabel(planDemande)} (${new Intl.NumberFormat('fr-GN').format(PLANS_INFO[planDemande]?.prix || 0)} GNF)`,
    link: 'abonnements',
  });

  return { ok: true, demandeId };
}

export async function activerDemande(demandeId, demandeMeta = null) {
  const uuid = normalizeDemandeUuid(demandeId);
  const legacyId = demandeMeta?.legacy_pro_id ?? null;

  if (useSupabase) {
    try {
      let result;
      if (uuid) {
        result = await validerDemandeSupabase(uuid);
      } else if (legacyId != null) {
        result = await resolveDemandeLegacySupabase(legacyId, 'valider');
      } else {
        return activerAbonnementLocal(demandeId);
      }

      if (result?.ok === false) {
        return { ok: false, error: result.error || 'Activation refusée' };
      }

      syncProAccountFromActivation(result);
      const { invalidateProfessionalsCache } = await import('./professionalsStore.js');
      await invalidateProfessionalsCache().catch(() => {});

      await notifyUserAbonnementActive({
        proId: result?.legacy_pro_id ?? legacyId,
        proEmail: result?.pro_email ?? demandeMeta?.pro_email,
        plan: result?.plan ?? demandeMeta?.plan_demande,
        planFin: result?.plan_fin,
      });
      purgeLocalDemandesEnAttente();
      return { ok: true, result };
    } catch (err) {
      const msg = err?.message || 'Erreur activation Supabase';
      if (legacyId != null && (msg.includes('introuvable') || msg.includes('invalide'))) {
        try {
          await activerAbonnementManuel(legacyId, fromPlanDemande(demandeMeta?.plan_demande || 'pro'));
          purgeLocalDemandesEnAttente();
          return { ok: true };
        } catch (fallbackErr) {
          return { ok: false, error: fallbackErr?.message || msg };
        }
      }
      if (msg.includes('déjà traitée')) {
        purgeLocalDemandesEnAttente();
      }
      return { ok: false, error: msg, stale: msg.includes('déjà traitée') };
    }
  }

  const result = activerAbonnementLocal(demandeId);
  if (result.ok) {
    await notifyUserAbonnementActive({
      proId: result.account?.id || result.demande?.legacy_pro_id,
      proEmail: result.account?.email || result.demande?.pro_email,
      plan: result.demande?.plan_demande,
      planFin: result.planFin,
      skipInbox: true,
    });
  }
  return result;
}

export async function refuserDemande(demandeId, motif, demandeMeta = null) {
  const uuid = normalizeDemandeUuid(demandeId);
  const legacyId = demandeMeta?.legacy_pro_id ?? null;

  if (useSupabase) {
    try {
      let result;
      if (uuid) {
        result = await refuserDemandeSupabase(uuid, motif);
      } else if (legacyId != null) {
        result = await resolveDemandeLegacySupabase(legacyId, 'refuser', motif);
      } else {
        return refuserDemandeLocal(demandeId, motif);
      }

      if (result?.ok === false) {
        return { ok: false, error: result.error || 'Refus refusé' };
      }

      const email = result?.pro_email ?? demandeMeta?.pro_email;
      if (email) {
        await sendSubscriptionUserEmail({
          to: email,
          subject: 'Demande d\'abonnement — information',
          refused: true,
          motif,
        });
      }
      purgeLocalDemandesEnAttente();
      return { ok: true, result };
    } catch (err) {
      const msg = err?.message || 'Erreur refus Supabase';
      if (legacyId != null && msg.includes('Aucune demande en attente')) {
        const local = refuserDemandeLocal(demandeId, motif);
        if (local.ok) return local;
      }
      if (msg.includes('déjà traitée')) {
        purgeLocalDemandesEnAttente();
      }
      return { ok: false, error: msg, stale: msg.includes('déjà traitée') };
    }
  }
  return refuserDemandeLocal(demandeId, motif);
}

export async function desactiverAbonnement(proId) {
  if (useSupabase) {
    try {
      const result = await desactiverAbonnementSupabase(proId);
      desactiverAbonnementLocal(proId);
      return { ok: true, result };
    } catch { /* local */ }
  }
  return desactiverAbonnementLocal(proId);
}

function syncProAccountFromActivation(result) {
  if (!result?.legacy_pro_id) return;
  const appPlan = fromPlanDemande(result.plan);
  const patch = {
    plan: appPlan,
    planAbonnement: result.plan,
    planActif: true,
    planFin: result.plan_fin,
    planDebut: new Date().toISOString(),
    premium: appPlan === 'premium',
    premiumExpires: result.plan_fin,
  };
  updateProAccountById(result.legacy_pro_id, patch);
  adminSetProfessionalPlan(result.legacy_pro_id, appPlan);
  const acc = getProAccount();
  if (acc && String(acc.id) === String(result.legacy_pro_id)) {
    saveProAccount({ ...acc, ...patch });
  }
}

async function notifyUserAbonnementActive({ proId, proEmail, plan, planFin, skipInbox = false }) {
  const label = planLabel(plan);
  const finStr = planFin ? new Date(planFin).toLocaleDateString('fr-FR') : '';

  if (proId && !skipInbox) {
    notifyProInbox(proId, {
      type: 'success',
      title: 'Abonnement activé !',
      message: finStr
        ? `Votre plan ${label} est actif jusqu'au ${finStr}.`
        : `Votre plan ${label} est maintenant actif.`,
    });
  }

  if (proEmail) {
    await sendSubscriptionUserEmail({
      to: proEmail,
      subject: 'Votre abonnement G-List est activé',
      plan: label,
      planFin,
    });
  }
}

export async function notifyAdminDemandeAbonnement(payload) {
  if (!apiConfig.useRemoteApi) {
    console.info('[abonnement] Nouvelle demande admin:', payload);
    return { ok: true, simulated: true };
  }
  return apiRequest('/abonnement/notify-admin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendSubscriptionUserEmail(payload) {
  if (!apiConfig.useRemoteApi) {
    console.info('[abonnement] Email utilisateur:', payload);
    return { ok: true, simulated: true };
  }
  return apiRequest('/abonnement/notify-user', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendUserDemandeRecueEmail(payload) {
  if (!apiConfig.useRemoteApi) {
    console.info('[abonnement] Email demande reçue:', payload);
    return { ok: true, simulated: true };
  }
  return apiRequest('/abonnement/notify-user-received', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function activerAbonnementManuel(proId, planId) {
  const planDemande = toPlanDemande(planId);
  const appPlan = fromPlanDemande(planDemande);

  if (useSupabase && supabase) {
    const { data, error } = await supabase.rpc('admin_activate_plan_legacy', {
      p_legacy_id: Number(proId),
      p_plan: planDemande,
      p_days: 30,
    });
    if (error) throw error;
    if (data?.ok === false) {
      throw new Error(data.error === 'PRO_NOT_FOUND'
        ? 'Professionnel introuvable dans Supabase — synchronisez d\'abord la fiche annuaire.'
        : (data.error || 'Activation impossible'));
    }
    if (data?.ok) {
      syncProAccountFromActivation({
        legacy_pro_id: proId,
        plan: planDemande,
        plan_fin: data.plan_fin,
      });
    }
    const { invalidateProfessionalsCache } = await import('../api/professionalsStore.js');
    await invalidateProfessionalsCache().catch(() => {});
  }

  adminSetProfessionalPlan(proId, appPlan);
  notifyProInbox(proId, {
    type: 'success',
    title: 'Abonnement activé',
    message: `Votre plan ${planLabel(planDemande)} a été activé par l'équipe G-List.`,
  });

  if (useSupabase) {
    try {
      const registryPro = getAllProAccountsList().find((p) => Number(p.id) === Number(proId));
      const email = registryPro?.email?.trim().toLowerCase();
      const pending = await fetchPendingDemandesSupabase();
      for (const d of pending || []) {
        const samePro = Number(d.legacy_pro_id) === Number(proId)
          || (email && d.pro_email?.trim().toLowerCase() === email);
        if (samePro) {
          await validerDemandeSupabase(d.id).catch(() => {});
        }
      }
    } catch { /* ignore */ }
  }

  return { ok: true };
}

export async function triggerSubscriptionCron() {
  if (useSupabase) {
    try {
      return await triggerExpirationCronSupabase();
    } catch { /* local */ }
  }
  if (apiConfig.useRemoteApi) {
    return apiRequest('/cron/verify-subscriptions', { method: 'POST' });
  }
  return verifierAbonnementsLocal();
}
