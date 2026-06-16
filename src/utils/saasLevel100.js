/** Plateforme G-List — Niveau 100 SaaS Premium Enterprise */

import { LEVEL_MILESTONES as MILESTONES_77 } from './minisiteLevel77';

export const SAAS_PLATFORM_LEVEL = 100;
export const MINISITE_MAX_LEVEL = 100;

export const PLATFORM_MILESTONES = {
  ...MILESTONES_77,
  80: 'Journal d\'audit · Traçabilité admin',
  85: 'Historique d\'activité · Timeline pro',
  90: 'Centre notifications · Boîte de réception',
  95: 'Facturation · Historique abonnements',
  100: 'Enterprise — RGPD · Tracking live · Multi-langue · Sessions',
};

export const SAAS_FEATURES_L100 = [
  { id: 'audit_log', label: 'Journal d\'audit', level: 80 },
  { id: 'activity_history', label: 'Historique d\'activité', level: 85 },
  { id: 'notification_inbox', label: 'Centre notifications', level: 90 },
  { id: 'billing_history', label: 'Historique facturation', level: 95 },
  { id: 'gdpr_export', label: 'Export données RGPD', level: 100 },
  { id: 'tracking_live', label: 'Tracking GA/Pixel/Hotjar', level: 100 },
  { id: 'multilang', label: 'Multi-langue FR/EN', level: 100 },
  { id: 'security_sessions', label: 'Sessions & sécurité', level: 100 },
];

export function isFeatureUnlocked(featureId, level = SAAS_PLATFORM_LEVEL) {
  const feat = SAAS_FEATURES_L100.find((f) => f.id === featureId);
  return feat ? level >= feat.level : false;
}

export function getPlatformLevelLabel(level = SAAS_PLATFORM_LEVEL) {
  if (level >= 100) return 'Enterprise';
  if (level >= 77) return 'Ultra Studio';
  if (level >= 50) return 'Pro';
  return 'Standard';
}
