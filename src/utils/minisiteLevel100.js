/** Extensions Enterprise — Niveau 100 */

export const MINISITE_ENTERPRISE_LEVEL = 100;

export const LEVEL_100_MILESTONES = {
  78: 'Éditeur multi-pages avancé · Duplication sections',
  82: 'A/B titre hero · Variantes CTA',
  86: 'Automatisations · Snapshots planifiés',
  90: 'Centre notifications visiteur · Webhooks stub',
  95: 'Domaine personnalisé (config) · SSL',
  100: 'Enterprise — Tracking live · Multi-langue · RGPD · Audit',
};

export const LOCALE_DEFAULTS = {
  fr: {
    contact_us: 'Nous contacter',
    learn_more: 'En savoir plus',
    book_now: 'Réserver',
    send_message: 'Envoyer',
    subscribe: 'S\'inscrire',
    all_rights: 'Tous droits réservés',
    powered_by: 'Site créé avec G-List',
  },
  en: {
    contact_us: 'Contact us',
    learn_more: 'Learn more',
    book_now: 'Book now',
    send_message: 'Send',
    subscribe: 'Subscribe',
    all_rights: 'All rights reserved',
    powered_by: 'Site built with G-List',
  },
};

export function mergeLocaleStrings(site) {
  const active = site.locale?.active || 'fr';
  const custom = site.locale?.strings || {};
  return {
    ...LOCALE_DEFAULTS,
    fr: { ...LOCALE_DEFAULTS.fr, ...(custom.fr || {}) },
    en: { ...LOCALE_DEFAULTS.en, ...(custom.en || {}) },
    active,
  };
}
