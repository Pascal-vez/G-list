export const SITE_NAV_LINKS = [
  { labelKey: 'nav.home', to: '/' },
  { labelKey: 'nav.directory', to: '/annuaire' },
  { labelKey: 'nav.categories', to: '/#categories' },
  { labelKey: 'nav.newPros', to: '/annuaire' },
  { labelKey: 'nav.verifiedPros', to: '/annuaire?verified=verified' },
];

export const SITE_NAV_MAIN_LINKS = SITE_NAV_LINKS.slice(0, 3);
export const SITE_NAV_MORE_LINKS = SITE_NAV_LINKS.slice(3);

export const DRAWER_MOBILE_ITEMS = [
  { labelKey: 'nav.home', to: '/', iconKey: 'home' },
  { labelKey: 'nav.directory', to: '/annuaire', iconKey: 'book' },
  { labelKey: 'nav.categories', to: '/#categories', iconKey: 'grid' },
  { labelKey: 'nav.contact', to: '/contact', iconKey: 'mail' },
];

export const DRAWER_NAV_ITEMS = [
  { labelKey: 'nav.home', to: '/', iconKey: 'home', accent: 'rgba(245, 197, 24, 0.18)', iconColor: '#F5C518' },
  { labelKey: 'nav.directory', to: '/annuaire', iconKey: 'book', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
  { labelKey: 'nav.categories', to: '/#categories', iconKey: 'grid', accent: 'rgba(255, 152, 76, 0.18)', iconColor: '#FF984C' },
  { labelKey: 'nav.newPros', to: '/annuaire', iconKey: 'userPlus', accent: 'rgba(171, 71, 188, 0.18)', iconColor: '#AB47BC' },
  { labelKey: 'nav.verifiedPros', to: '/annuaire?verified=verified', iconKey: 'verified', accent: 'rgba(24, 119, 242, 0.18)', iconColor: '#1877F2' },
  { labelKey: 'nav.faq', to: '/faq', iconKey: 'help', accent: 'rgba(255, 152, 76, 0.18)', iconColor: '#FF984C' },
  { labelKey: 'nav.contact', to: '/contact', iconKey: 'mail', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
];

export const DRAWER_EXTRA_ITEMS = [
  { labelKey: 'nav.visitorSpace', to: '/dashboard/visiteur', iconKey: 'user', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
  { labelKey: 'nav.proSpace', to: '/espace-pro', iconKey: 'briefcase', accent: 'rgba(245, 197, 24, 0.18)', iconColor: '#F5C518' },
];

export const SITE_INFO_LINKS = [
  { labelKey: 'nav.about', to: '/a-propos', iconKey: 'info', accent: 'rgba(245, 197, 24, 0.18)', iconColor: '#F5C518' },
  { labelKey: 'nav.faq', to: '/faq', iconKey: 'help', accent: 'rgba(255, 152, 76, 0.18)', iconColor: '#FF984C' },
  { labelKey: 'nav.contact', to: '/contact', iconKey: 'mail', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
  { labelKey: 'nav.privacy', to: '/confidentialite', iconKey: 'privacy', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
  { labelKey: 'nav.cookies', to: '/cookies', iconKey: 'cookie', accent: 'rgba(255, 152, 76, 0.18)', iconColor: '#FF984C' },
  { labelKey: 'nav.terms', to: '/conditions', iconKey: 'terms', accent: 'rgba(255, 255, 255, 0.1)', iconColor: 'rgba(255, 255, 255, 0.55)' },
  { labelKey: 'nav.legal', to: '/mentions-legales', iconKey: 'legal', accent: 'rgba(255, 255, 255, 0.1)', iconColor: 'rgba(255, 255, 255, 0.55)' },
  { labelKey: 'nav.sitemap', to: '/plan-du-site', iconKey: 'sitemap', accent: 'rgba(76, 175, 80, 0.18)', iconColor: '#4CAF50' },
];

export const FOOTER_LEGAL_LINKS = [
  { labelKey: 'footer.privacy', to: '/confidentialite' },
  { labelKey: 'footer.conditions', to: '/conditions' },
  { labelKey: 'footer.admin', to: '/admin-glist-2026' },
];
