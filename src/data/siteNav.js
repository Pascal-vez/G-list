export const SITE_NAV_LINKS = [
  { label: 'Accueil', to: '/' },
  { label: 'Annuaire', to: '/#professionals' },
  { label: 'Catégories', to: '/#categories' },
  { label: 'Régions', to: '/#regions' },
  { label: 'Nouveaux inscrits', to: '/#professionals' },
  { label: 'Profils vérifiés', to: '/?verified=verified#professionals' },
];

export const SITE_NAV_MAIN_LINKS = SITE_NAV_LINKS.slice(0, 4);
export const SITE_NAV_MORE_LINKS = SITE_NAV_LINKS.slice(4);

export const DRAWER_NAV_ITEMS = [
  { label: 'Accueil', to: '/', iconKey: 'home', accent: 'rgba(245, 197, 24, 0.18)', iconColor: '#F5C518' },
  { label: 'Annuaire', to: '/#professionals', iconKey: 'book', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
  { label: 'Catégories', to: '/#categories', iconKey: 'grid', accent: 'rgba(255, 152, 76, 0.18)', iconColor: '#FF984C' },
  { label: 'Régions', to: '/#regions', iconKey: 'map', accent: 'rgba(76, 175, 80, 0.18)', iconColor: '#4CAF50' },
  { label: 'Nouveaux inscrits', to: '/#professionals', iconKey: 'userPlus', accent: 'rgba(171, 71, 188, 0.18)', iconColor: '#AB47BC' },
  { label: 'Profils vérifiés', to: '/?verified=verified#professionals', iconKey: 'verified', accent: 'rgba(24, 119, 242, 0.18)', iconColor: '#1877F2' },
];

export const DRAWER_EXTRA_ITEMS = [
  { label: 'Espace pro', to: '/espace-pro', iconKey: 'briefcase', accent: 'rgba(245, 197, 24, 0.18)', iconColor: '#F5C518' },
  { label: 'Liste d\'attente', to: '/rejoindre', iconKey: 'clipboard', accent: 'rgba(37, 211, 102, 0.18)', iconColor: '#25D366' },
  { label: 'Admin', to: '/admin-glist-2026', iconKey: 'shield', accent: 'rgba(255, 255, 255, 0.1)', iconColor: 'rgba(255, 255, 255, 0.55)' },
];

export const SITE_INFO_LINKS = [
  { label: 'À propos', to: '/a-propos', iconKey: 'info', accent: 'rgba(245, 197, 24, 0.18)', iconColor: '#F5C518' },
  { label: 'Confidentialité', to: '/confidentialite', iconKey: 'privacy', accent: 'rgba(92, 158, 255, 0.18)', iconColor: '#5C9EFF' },
  { label: 'Conditions', to: '/conditions', iconKey: 'terms', accent: 'rgba(255, 255, 255, 0.1)', iconColor: 'rgba(255, 255, 255, 0.55)' },
];
