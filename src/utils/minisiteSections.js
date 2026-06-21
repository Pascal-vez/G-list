/** Sections et presets ajoutés niveaux 7–11 */

export const NEW_SECTION_DEFAULTS = {
  pricing: {
    heading: 'Nos tarifs',
    plans: [
      { name: 'Essentiel', price: '50 000 GNF', period: '/mois', features: ['Fonctionnalité 1', 'Support email'], highlighted: false },
      { name: 'Pro', price: '120 000 GNF', period: '/mois', features: ['Tout Essentiel', 'Support prioritaire', 'Analytics'], highlighted: true },
    ],
  },
  map: {
    heading: 'Nous trouver',
    address: 'Conakry, Guinée',
    embedUrl: '',
    mapLink: '',
  },
  form: {
    heading: 'Envoyez-nous un message',
    successMessage: 'Merci ! Nous vous répondrons rapidement.',
    submitLabel: 'Envoyer',
    fields: [
      { id: 'name', type: 'text', label: 'Nom complet', required: true },
      { id: 'email', type: 'email', label: 'Email', required: true },
      { id: 'message', type: 'textarea', label: 'Message', required: true },
    ],
  },
  blog: {
    heading: 'Actualités',
    posts: [
      { title: 'Bienvenue sur notre site', date: new Date().toISOString().split('T')[0], excerpt: 'Découvrez nos services et notre équipe.', image: null },
    ],
  },
  partners: {
    heading: 'Ils nous font confiance',
    logos: [{ name: 'Partenaire 1', logo: null, url: '' }],
  },
  banner: {
    text: '🎉 Offre de lancement — Contactez-nous !',
    subtext: '',
    linkLabel: 'En savoir plus',
    linkAction: 'whatsapp',
    style: 'accent',
  },
  booking: {
    heading: 'Prendre rendez-vous',
    intro: 'Choisissez un créneau qui vous convient.',
    slots: ['Lun–Ven 9h–12h', 'Lun–Ven 14h–18h', 'Sam 9h–13h'],
    ctaLabel: 'Réserver via WhatsApp',
    note: 'Confirmation sous 24 h.',
  },
  newsletter: {
    heading: 'Restez informé',
    subtext: 'Recevez nos actualités et offres.',
    placeholder: 'Votre adresse email',
    buttonLabel: "S'inscrire",
  },
};

export const THEME_PRESETS = {
  gold: { label: 'Or premium', primaryColor: '#C9A227', accentColor: '#1A1208', backgroundColor: '#FFFCF5' },
  forest: { label: 'Forêt', primaryColor: '#2D6A4F', accentColor: '#1B4332', backgroundColor: '#F8FAF8' },
  navy: { label: 'Marine pro', primaryColor: '#1E3A5F', accentColor: '#0D1B2A', backgroundColor: '#FFFFFF' },
  dark: { label: 'Mode sombre', primaryColor: '#F5C518', accentColor: '#F8F6F0', backgroundColor: '#0E1208', darkMode: true },
  rose: { label: 'Élégant rose', primaryColor: '#BE185D', accentColor: '#1A1A1A', backgroundColor: '#FFF5F7' },
};

/** Fusionne le thème du site avec le mode sombre global G-List (localStorage). */
export function resolveMinisiteTheme(siteTheme = {}, appTheme = 'light') {
  const base = {
    primaryColor: '#C9A227',
    accentColor: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    fontPreset: 'modern',
    darkMode: false,
    borderRadius: 'medium',
    ...siteTheme,
  };
  const bg = String(base.backgroundColor || '').toLowerCase();
  const alreadyDark = base.darkMode || ['#0e1208', '#0f0f0f', '#141414', '#161616'].includes(bg);
  if (appTheme !== 'dark' || alreadyDark) return base;
  return {
    ...base,
    accentColor: THEME_PRESETS.dark.accentColor,
    backgroundColor: THEME_PRESETS.dark.backgroundColor,
    darkMode: true,
  };
}

export const EXTRA_FONT_PRESETS = {
  display: { label: 'Display', family: "'Poppins', 'Inter', sans-serif" },
  mono: { label: 'Technique', family: "'JetBrains Mono', 'Courier New', monospace" },
};

export const LEVEL_CHANGELOG = {
  7: 'Pages multiples · 6 presets thème · Polices display',
  8: 'Tarifs · Carte · Formulaire de contact',
  9: 'Blog · Partenaires · Bannière promo',
  10: 'Pop-up · Bannière annonce · Hero vidéo',
  11: 'Analytics · Réservations · Newsletter · Export JSON',
};
