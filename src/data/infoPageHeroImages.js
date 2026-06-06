/** Images hero pour les pages informations (À propos, Confidentialité, Conditions) */
export const INFO_PAGE_HERO = {
  apropos: {
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80',
    position: '65% 58%',
    accent: '#F5C518',
    accentBg: 'rgba(245, 197, 24, 0.18)',
  },
  confidentialite: {
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80',
    position: '60% 58%',
    accent: '#5C9EFF',
    accentBg: 'rgba(92, 158, 255, 0.18)',
  },
  conditions: {
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80',
    position: '70% 58%',
    accent: '#FF984C',
    accentBg: 'rgba(255, 152, 76, 0.18)',
  },
};

export const INFO_PAGE_HERO_FALLBACK =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80';

export function getInfoPageHero(pageKey) {
  return INFO_PAGE_HERO[pageKey] || INFO_PAGE_HERO.apropos;
}
