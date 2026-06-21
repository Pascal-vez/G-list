export const SITE_NAV_LINKS = [
  { label: 'Accueil', to: '/' },
  { label: 'Annuaire', to: '/annuaire' },
  { label: 'Catégories', to: '/#categories' },
  { label: 'Nouveaux inscrits', to: '/annuaire' },
  { label: 'Profils vérifiés', to: '/annuaire?verified=verified' },
];

export const SITE_NAV_MAIN_LINKS = SITE_NAV_LINKS.slice(0, 3);
export const SITE_NAV_MORE_LINKS = SITE_NAV_LINKS.slice(3);

export const DRAWER_MOBILE_ITEMS = [
  { label: 'Accueil', to: '/', iconKey: 'home' },
  { label: 'Annuaire', to: '/annuaire', iconKey: 'book' },
  { label: 'Catégories', to: '/#categories', iconKey: 'grid' },
  { label: 'Contact', to: '/contact', iconKey: 'mail' },
];

export const DRAWER_NAV_ITEMS = [
  { label: 'Accueil', to: '/', iconKey: 'home', accent: 'rgba(245, 197, 24, 0.18)', iconColor: '#F5C518' },
  { label: 'Annuaire', to: '/annuaire', iconKey: 'book', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
  { label: 'Catégories', to: '/#categories', iconKey: 'grid', accent: 'rgba(255, 152, 76, 0.18)', iconColor: '#FF984C' },
  { label: 'Nouveaux inscrits', to: '/annuaire', iconKey: 'userPlus', accent: 'rgba(171, 71, 188, 0.18)', iconColor: '#AB47BC' },
  { label: 'Profils vérifiés', to: '/annuaire?verified=verified', iconKey: 'verified', accent: 'rgba(24, 119, 242, 0.18)', iconColor: '#1877F2' },
  { label: 'FAQ', to: '/faq', iconKey: 'help', accent: 'rgba(255, 152, 76, 0.18)', iconColor: '#FF984C' },
  { label: 'Contact', to: '/contact', iconKey: 'mail', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
];

export const DRAWER_EXTRA_ITEMS = [
  { label: 'Espace visiteur', to: '/dashboard/visiteur', iconKey: 'user', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
  { label: 'Espace pro', to: '/espace-pro', iconKey: 'briefcase', accent: 'rgba(245, 197, 24, 0.18)', iconColor: '#F5C518' },
];

export const SITE_INFO_LINKS = [
  { label: 'À propos', to: '/a-propos', iconKey: 'info', accent: 'rgba(245, 197, 24, 0.18)', iconColor: '#F5C518' },
  { label: 'FAQ', to: '/faq', iconKey: 'help', accent: 'rgba(255, 152, 76, 0.18)', iconColor: '#FF984C' },
  { label: 'Contact', to: '/contact', iconKey: 'mail', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
  { label: 'Confidentialité', to: '/confidentialite', iconKey: 'privacy', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
  { label: 'Cookies', to: '/cookies', iconKey: 'cookie', accent: 'rgba(255, 152, 76, 0.18)', iconColor: '#FF984C' },
  { label: 'Conditions', to: '/conditions', iconKey: 'terms', accent: 'rgba(255, 255, 255, 0.1)', iconColor: 'rgba(255, 255, 255, 0.55)' },
  { label: 'Mentions légales', to: '/mentions-legales', iconKey: 'legal', accent: 'rgba(255, 255, 255, 0.1)', iconColor: 'rgba(255, 255, 255, 0.55)' },
  { label: 'Plan du site', to: '/plan-du-site', iconKey: 'sitemap', accent: 'rgba(76, 175, 80, 0.18)', iconColor: '#4CAF50' },
];
