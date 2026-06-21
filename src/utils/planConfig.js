/** 10 mois facturés = 12 mois d'accès (2 mois offerts) */
export const ANNUAL_PAID_MONTHS = 10;
export const ANNUAL_TOTAL_MONTHS = 12;

export const BILLING_CYCLE_MONTHLY = 'mensuel';
export const BILLING_CYCLE_ANNUAL = 'annual';

/** Compatibilité données enregistrées avec l'ancienne valeur « monthly » */
export function normalizeBillingCycle(cycle) {
  if (!cycle || cycle === 'monthly') return BILLING_CYCLE_MONTHLY;
  return cycle;
}

export function formatBillingCycleLabel(cycle) {
  const c = normalizeBillingCycle(cycle);
  if (c === BILLING_CYCLE_ANNUAL) return 'Annuel';
  return 'Mensuel';
}

export const DEFAULT_SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Pour démarrer sur G-List',
    description: 'Profil basique pour être visible dans l\'annuaire.',
    priceMonthly: 0,
    features: ['Profil basique', '3 services', '2 photos', 'Avis en lecture seule'],
    recommended: false,
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced',
    tagline: 'Développez votre activité',
    description: 'Analytics, concurrence, centre d\'alertes et outils de croissance.',
    priceMonthly: 50000,
    features: [
      'Analytics 30 jours',
      'Centre d\'alertes',
      'Services illimités',
      '6 photos',
      'Réponses aux avis',
      'Analyse concurrence',
      'Suggestions IA',
      'Historique activité',
      'Centre notifications',
    ],
    recommended: false,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    tagline: 'Visibilité & conversion max',
    description: 'CRM, mini-site, rapports et visibilité premium sur G-List.',
    priceMonthly: 120000,
    features: [
      'CRM prospects',
      'Mini-site portfolio',
      '12 photos',
      'Rapports mensuels',
      'Score réputation',
      'Classement par villes',
      'Historique activité',
      'Export RGPD',
      'Tracking GA/Pixel',
    ],
    recommended: true,
  },
};

export function mergeSubscriptionPlans(saved) {
  if (!saved) return { ...DEFAULT_SUBSCRIPTION_PLANS };
  return {
    free: { ...DEFAULT_SUBSCRIPTION_PLANS.free, ...(saved.free || {}) },
    advanced: { ...DEFAULT_SUBSCRIPTION_PLANS.advanced, ...(saved.advanced || {}) },
    premium: { ...DEFAULT_SUBSCRIPTION_PLANS.premium, ...(saved.premium || {}) },
  };
}

export function getPlanMonthlyPriceFromPlans(plans, planId) {
  return plans[planId]?.priceMonthly ?? 0;
}

export function getPlanPriceFromPlans(plans, planId, billingCycle = BILLING_CYCLE_MONTHLY) {
  const cycle = normalizeBillingCycle(billingCycle);
  const monthly = getPlanMonthlyPriceFromPlans(plans, planId);
  if (!monthly) return 0;
  return cycle === BILLING_CYCLE_ANNUAL ? monthly * ANNUAL_PAID_MONTHS : monthly;
}

export function getAnnualSavingsFromPlans(plans, planId) {
  const monthly = getPlanMonthlyPriceFromPlans(plans, planId);
  return monthly * (ANNUAL_TOTAL_MONTHS - ANNUAL_PAID_MONTHS);
}

export const UPGRADE_CONGRATS = {
  advanced: {
    title: 'Bienvenue en Advanced !',
    message: 'Vous débloquez analytics, le centre d\'alertes, les réponses aux avis et l\'analyse concurrence. Bonne croissance sur G-List !',
  },
  premium: {
    title: 'Félicitations — vous êtes Premium !',
    message: 'CRM, mini-site, rapports et visibilité maximale sont à vous. Merci de faire confiance à G-List pour développer votre activité.',
  },
};
