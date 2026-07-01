/** Hiérarchie et règles métier abonnement manuel */

export const HIERARCHIE_PLANS = {
  gratuit: 0,
  free: 0,
  pro: 1,
  advanced: 1,
  premium: 2,
};

export const PLANS_INFO = {
  pro: {
    nom: 'Advanced',
    prix: 50000,
    devise: 'GNF',
    duree_jours: 30,
    appPlanId: 'advanced',
  },
  premium: {
    nom: 'Premium',
    prix: 120000,
    devise: 'GNF',
    duree_jours: 30,
    appPlanId: 'premium',
  },
};

/** Plan app (free/advanced/premium) → plan demande DB (gratuit/pro/premium) */
export function toPlanDemande(planId) {
  if (planId === 'advanced' || planId === 'pro') return 'pro';
  if (planId === 'premium') return 'premium';
  return 'gratuit';
}

/** Plan demande DB → plan app */
export function fromPlanDemande(planDemande) {
  if (planDemande === 'pro') return 'advanced';
  if (planDemande === 'premium') return 'premium';
  return 'free';
}

export function toPlanActuel(planId) {
  return toPlanDemande(planId || 'free');
}

export function planLabel(planDemandeOrApp) {
  if (planDemandeOrApp === 'gratuit' || planDemandeOrApp === 'free') return 'Gratuit';
  if (planDemandeOrApp === 'pro' || planDemandeOrApp === 'advanced') return 'Advanced';
  if (planDemandeOrApp === 'premium') return 'Premium';
  return planDemandeOrApp;
}

export function getMontantPlan(planDemande) {
  return PLANS_INFO[planDemande]?.prix ?? 0;
}

export function getPlanSuperieur(planActuel) {
  const actuel = toPlanActuel(planActuel);
  if (actuel === 'gratuit') return 'pro';
  if (actuel === 'pro') return 'premium';
  return null;
}

export function peutSouscrire(planActuel, planDemande, abonnementActif = true) {
  const actuelNorm = toPlanActuel(planActuel);
  const demandeNorm = toPlanDemande(planDemande);
  const niveauActuel = HIERARCHIE_PLANS[actuelNorm] ?? 0;
  const niveauDemande = HIERARCHIE_PLANS[demandeNorm] ?? 0;

  if (abonnementActif && actuelNorm === demandeNorm) {
    return {
      autorise: false,
      raison: `Vous êtes déjà abonné au plan ${PLANS_INFO[demandeNorm]?.nom || planLabel(demandeNorm)}.`,
    };
  }

  if (abonnementActif && niveauDemande < niveauActuel) {
    return {
      autorise: false,
      raison: `Vous êtes actuellement abonné au plan ${PLANS_INFO[actuelNorm]?.nom || planLabel(actuelNorm)}. Vous ne pouvez pas passer à un plan inférieur tant que votre abonnement actuel est actif. Il prendra fin automatiquement à la date d'expiration.`,
    };
  }

  return { autorise: true };
}

export function joursRestants(planFin) {
  if (!planFin) return null;
  const diff = new Date(planFin) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function isAbonnementActif(account) {
  if (!account) return false;
  const plan = account.plan || 'free';
  if (plan === 'free' && !account.premium) return false;
  if (account.planActif === false) return false;
  const fin = account.planFin || account.premiumExpires;
  if (fin && new Date(fin) <= new Date()) return false;
  return plan !== 'free' || Boolean(account.premium);
}

export function getEffectivePlan(account) {
  if (!account) return 'free';
  if (!isAbonnementActif(account)) return 'free';
  if (account.plan && account.plan !== 'free') return account.plan;
  if (account.premium) return 'premium';
  return 'free';
}
