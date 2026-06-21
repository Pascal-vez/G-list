import { apiConfig } from './config';
import { apiRequest } from './client';
import { useSupabase } from '../lib/supabaseClient';
import {
  getConfigPaiement,
  createDemandeAbonnement,
  getDemandesEnAttente,
  activerAbonnementLocal,
  refuserDemandeLocal,
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
  desactiverAbonnementSupabase,
  fetchSubscriptionStatusSupabase,
  updateConfigPaiementSupabase,
  triggerExpirationCronSupabase,
  fromPlanDemande,
} from './supabaseAbonnement';
import { toPlanDemande, PLANS_INFO, planLabel } from '../utils/plans';
import { getProAccount, saveProAccount } from '../utils/storage';
import { notifyProInbox } from '../utils/notificationInbox';

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
      if (remote?.length) return remote;
    } catch { /* fallback */ }
  }
  return getDemandesEnAttente();
}

export async function fetchSubscriptionStatus(account) {
  if (useSupabase && account?.id) {
    try {
      const remote = await fetchSubscriptionStatusSupabase(account.id);
      if (remote) return remote;
    } catch { /* fallback */ }
  }
  return getSubscriptionStatusForAccount(account);
}

export async function submitDemandeAbonnement({ account, planId, numeroEmetteur, idTransaction, heureTransaction }) {
  const planDemande = toPlanDemande(planId);
  const acc = account || getProAccount();
  if (!acc) throw new Error('Compte pro requis');
  if (!heureTransaction) throw new Error('Heure de transaction requise');

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
    await notifyAdminDemandeAbonnement({
      proNom: acc.nom,
      proEmail: acc.email,
      planDemande,
      montant: PLANS_INFO[planDemande]?.prix,
      numeroEmetteur,
      idTransaction,
      heureTransaction,
      demandeId,
    });
  } catch (err) {
    console.warn('[abonnement] Notification admin échouée (demande enregistrée):', err?.message || err);
  }

  return { ok: true, demandeId };
}

export async function activerDemande(demandeId) {
  if (useSupabase) {
    try {
      const result = await validerDemandeSupabase(demandeId);
      if (result?.legacy_pro_id) {
        syncLocalAccountFromActivation(result);
      }
      await notifyUserAbonnementActive({
        proId: result?.legacy_pro_id,
        proEmail: result?.pro_email,
        plan: result?.plan,
        planFin: result?.plan_fin,
      });
      return { ok: true, result };
    } catch { /* local fallback */ }
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

export async function refuserDemande(demandeId, motif) {
  if (useSupabase) {
    try {
      const result = await refuserDemandeSupabase(demandeId, motif);
      if (result?.pro_email) {
        await sendSubscriptionUserEmail({
          to: result.pro_email,
          subject: 'Demande d\'abonnement — information',
          refused: true,
          motif,
        });
      }
      return { ok: true, result };
    } catch { /* local */ }
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

function syncLocalAccountFromActivation(result) {
  const acc = getProAccount();
  if (!acc || String(acc.id) !== String(result.legacy_pro_id)) return;
  const appPlan = fromPlanDemande(result.plan);
  saveProAccount({
    ...acc,
    plan: appPlan,
    planAbonnement: result.plan,
    planActif: true,
    planFin: result.plan_fin,
    planDebut: new Date().toISOString(),
    premium: appPlan === 'premium',
    premiumExpires: result.plan_fin,
  });
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
