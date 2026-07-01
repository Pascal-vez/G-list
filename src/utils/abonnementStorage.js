import { getItem, setItem, getProAccount, saveProAccount, getAllProAccountsList, updateProAccountById, KEYS } from './storage';
import { notifyProInbox } from './notificationInbox';
import {
  toPlanDemande, fromPlanDemande, toPlanActuel, getMontantPlan, PLANS_INFO, isAbonnementActif, planLabel,
} from './plans';

const ABONNEMENT_KEYS = {
  DEMANDES: 'glist_demandes_abonnement',
  CONFIG: 'glist_config_paiement',
};

const DEFAULT_CONFIG = {
  id: 1,
  numero_depot: '+224626419331',
  nom_titulaire: 'G-List Administration',
  operateur: 'Orange Money',
  email_admin: '',
};

function uid() {
  return `dem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getConfigPaiement() {
  return { ...DEFAULT_CONFIG, ...getItem(ABONNEMENT_KEYS.CONFIG, {}) };
}

export function saveConfigPaiement(partial) {
  const next = { ...getConfigPaiement(), ...partial };
  setItem(ABONNEMENT_KEYS.CONFIG, next);
  return next;
}

export function getDemandesAbonnement() {
  return getItem(ABONNEMENT_KEYS.DEMANDES, []);
}

export function purgeLocalDemandesEnAttente() {
  const next = getDemandesAbonnement().filter((d) => d.statut !== 'en_attente');
  saveDemandes(next);
}

function saveDemandes(list) {
  setItem(ABONNEMENT_KEYS.DEMANDES, list);
}

export function getDemandesEnAttente() {
  return getDemandesAbonnement().filter((d) => d.statut === 'en_attente');
}

export function getDemandesEnAttenteForPro(proId) {
  return getDemandesAbonnement().filter(
    (d) => d.statut === 'en_attente' && String(d.legacy_pro_id) === String(proId),
  );
}

export function createDemandeAbonnement({
  account,
  planDemande,
  numeroEmetteur,
  idTransaction = '',
  heureTransaction = null,
}) {
  const planActuel = toPlanActuel(account?.plan);
  const montant = getMontantPlan(planDemande);
  const demande = {
    id: uid(),
    user_id: account?.supabaseUserId || null,
    legacy_pro_id: account?.id,
    pro_nom: account?.nom,
    pro_email: account?.email,
    plan_demande: planDemande,
    plan_actuel: planActuel,
    montant,
    numero_emetteur: numeroEmetteur.trim(),
    id_transaction: idTransaction?.trim() || null,
    heure_transaction: heureTransaction || null,
    statut: 'en_attente',
    motif_refus: null,
    traite_par: null,
    traite_le: null,
    created_at: new Date().toISOString(),
  };
  const list = getDemandesAbonnement();
  list.unshift(demande);
  saveDemandes(list);
  return demande;
}

export function activerAbonnementLocal(demandeId) {
  const list = getDemandesAbonnement();
  const idx = list.findIndex((d) => d.id === demandeId);
  if (idx === -1) return { ok: false, error: 'NOT_FOUND' };
  const demande = list[idx];
  if (demande.statut !== 'en_attente') return { ok: false, error: 'ALREADY_PROCESSED' };

  const appPlan = fromPlanDemande(demande.plan_demande);
  const duree = PLANS_INFO[demande.plan_demande]?.duree_jours || 30;
  const debut = new Date();
  const fin = new Date();
  fin.setDate(fin.getDate() + duree);

  const account = updateProAccountById(demande.legacy_pro_id, {
    plan: appPlan,
    planAbonnement: demande.plan_demande,
    planActif: true,
    planDebut: debut.toISOString(),
    planFin: fin.toISOString(),
    alerteExpirationEnvoyee: false,
    premium: appPlan === 'premium',
    billingCycle: 'mensuel',
    premiumSince: debut.toISOString(),
    premiumExpires: fin.toISOString(),
  });

  list[idx] = {
    ...demande,
    statut: 'validee',
    traite_le: new Date().toISOString(),
  };
  saveDemandes(list);

  if (account?.id) {
    const finStr = fin.toLocaleDateString('fr-FR');
    notifyProInbox(account.id, {
      type: 'success',
      title: 'Abonnement activé !',
      message: `Votre plan ${planLabel(demande.plan_demande)} est actif jusqu'au ${finStr}.`,
    });
  }

  return { ok: true, account, planFin: fin.toISOString(), demande: list[idx] };
}

export function refuserDemandeLocal(demandeId, motif = '') {
  const list = getDemandesAbonnement();
  const idx = list.findIndex((d) => d.id === demandeId);
  if (idx === -1) return { ok: false, error: 'NOT_FOUND' };
  const demande = list[idx];
  if (demande.statut !== 'en_attente') return { ok: false, error: 'ALREADY_PROCESSED' };

  list[idx] = {
    ...demande,
    statut: 'refusee',
    motif_refus: motif.trim() || null,
    traite_le: new Date().toISOString(),
  };
  saveDemandes(list);

  if (demande.legacy_pro_id) {
    notifyProInbox(demande.legacy_pro_id, {
      type: 'warning',
      title: 'Demande d\'abonnement refusée',
      message: motif.trim() || 'Votre demande n\'a pas pu être validée. Contactez le support.',
    });
  }

  return { ok: true, demande: list[idx] };
}

export function desactiverAbonnementLocal(proId) {
  const account = updateProAccountById(proId, {
    plan: 'free',
    planAbonnement: 'gratuit',
    planActif: false,
    planFin: new Date().toISOString(),
    premium: false,
    premiumExpires: new Date().toISOString(),
  });

  if (account?.id) {
    notifyProInbox(account.id, {
      type: 'info',
      title: 'Abonnement désactivé',
      message: 'Votre abonnement a été désactivé. Vous êtes sur le plan gratuit.',
    });
  }

  return { ok: true, account };
}

export function getSubscriptionStatusForAccount(account) {
  if (!account) {
    return { plan: 'gratuit', plan_actif: false, demandes_en_attente: 0 };
  }
  return {
    plan: toPlanActuel(account.plan),
    plan_actif: isAbonnementActif(account),
    plan_debut: account.planDebut || account.premiumSince,
    plan_fin: account.planFin || account.premiumExpires,
    demandes_en_attente: getDemandesEnAttenteForPro(account.id).length,
  };
}

/** Cron local (dev) — alertes J-10 et expirations */
export function verifierAbonnementsLocal() {
  let alertes = 0;
  let expirations = 0;
  const accounts = getAllProAccountsList();

  accounts.forEach((acc) => {
    if (!isAbonnementActif(acc)) return;
    const fin = new Date(acc.planFin || acc.premiumExpires);
    const jours = Math.ceil((fin - new Date()) / 86400000);

    if (jours <= 10 && jours > 0 && !acc.alerteExpirationEnvoyee) {
      notifyProInbox(acc.id, {
        type: 'warning',
        title: `Votre plan expire dans ${jours} jours`,
        message: 'Renouvelez votre abonnement ou passez à un plan supérieur depuis votre espace pro.',
      });
      updateProAccountById(acc.id, { alerteExpirationEnvoyee: true });
      alertes += 1;
    }

    if (fin <= new Date()) {
      updateProAccountById(acc.id, {
        plan: 'free',
        planAbonnement: 'gratuit',
        planActif: false,
        alerteExpirationEnvoyee: false,
        premium: false,
      });
      notifyProInbox(acc.id, {
        type: 'info',
        title: 'Abonnement expiré',
        message: 'Votre abonnement a expiré. Vous êtes sur le plan gratuit.',
      });
      expirations += 1;
    }
  });

  return { alertes_j10: alertes, expirations };
}

export { ABONNEMENT_KEYS };
