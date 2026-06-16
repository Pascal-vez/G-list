/** Extensions Ultra Studio — Niveau 77 */

export const MINISITE_ULTRA_LEVEL = 77;

export const LEVEL_MILESTONES = {
  11: 'Analytics · Newsletter · Export JSON',
  20: 'Boutique en ligne · Panier · Paiement WhatsApp',
  30: 'Portfolio filtrable · Avant/Après · Timeline',
  40: 'Événements · Compte à rebours · Certifications',
  50: 'Multi-langue FR/EN · SEO JSON-LD',
  60: 'Historique versions · Snapshots',
  70: 'IA contenu · Intégrations tracking',
  77: 'Ultra Studio — QR · Cookies · Page protégée',
};

export const ULTRA_SECTION_DEFAULTS = {
  shop: {
    heading: 'Notre boutique',
    currency: 'GNF',
    products: [
      { name: 'Produit phare', description: 'Description courte', price: '150 000', image: null, badge: 'Nouveau' },
      { name: 'Pack découverte', description: 'Idéal pour commencer', price: '75 000', image: null, badge: '' },
    ],
    checkoutVia: 'whatsapp',
  },
  timeline: {
    heading: 'Notre parcours',
    items: [
      { year: '2020', title: 'Création', description: 'Lancement de l\'activité à Conakry.' },
      { year: '2023', title: 'Expansion', description: 'Ouverture de nouveaux services.' },
      { year: '2026', title: 'Aujourd\'hui', description: 'Référence dans notre secteur.' },
    ],
  },
  portfolio: {
    heading: 'Réalisations',
    categories: ['Tous', 'Projet A', 'Projet B'],
    activeCategory: 'Tous',
    items: [
      { title: 'Projet 1', category: 'Projet A', image: null, description: 'Description du projet' },
      { title: 'Projet 2', category: 'Projet B', image: null, description: 'Description du projet' },
    ],
  },
  compare: {
    heading: 'Avant / Après',
    beforeImage: null,
    afterImage: null,
    beforeLabel: 'Avant',
    afterLabel: 'Après',
  },
  events: {
    heading: 'Prochains événements',
    items: [
      { title: 'Journée portes ouvertes', date: '2026-06-20', time: '10h–18h', location: 'Conakry', description: 'Venez nous rencontrer.' },
    ],
  },
  countdown: {
    heading: 'Lancement imminent',
    subtext: 'Ne manquez pas notre grande ouverture',
    targetDate: '2026-12-31T18:00:00',
    ctaLabel: 'Être informé',
    ctaAction: 'whatsapp',
  },
  social: {
    heading: 'Suivez-nous',
    links: [
      { platform: 'facebook', label: 'Facebook', url: '' },
      { platform: 'instagram', label: 'Instagram', url: '' },
      { platform: 'tiktok', label: 'TikTok', url: '' },
    ],
  },
  certifications: {
    heading: 'Certifications & labels',
    items: [
      { title: 'Qualité certifiée', issuer: 'Organisme national', year: '2025', image: null },
    ],
  },
  quote: {
    heading: 'Citation',
    quotes: [
      { text: 'L\'excellence n\'est pas un acte, mais une habitude.', author: 'Aristote' },
    ],
    rotate: true,
  },
  audio: {
    heading: 'Podcast & audio',
    tracks: [
      { title: 'Épisode 1 — Présentation', url: '', duration: '12 min' },
    ],
  },
};

export const ULTRA_TEMPLATES = {
  agence: {
    label: 'Agence digitale',
    description: 'Portfolio, équipe et devis',
    theme: { primaryColor: '#6366F1', accentColor: '#1E1B4B', backgroundColor: '#F8F7FF', fontPreset: 'display', borderRadius: 'medium' },
    sections: ['hero', 'banner', 'portfolio', 'services', 'team', 'testimonials', 'form', 'contact'],
  },
  immobilier: {
    label: 'Immobilier',
    description: 'Biens et visites',
    theme: { primaryColor: '#B45309', accentColor: '#1C1917', backgroundColor: '#FFFBEB', fontPreset: 'elegant', borderRadius: 'small' },
    sections: ['hero', 'stats', 'portfolio', 'map', 'team', 'testimonials', 'booking', 'contact'],
  },
  ecole: {
    label: 'École & Formation',
    description: 'Programmes et inscriptions',
    theme: { primaryColor: '#2563EB', accentColor: '#1E3A8A', backgroundColor: '#EFF6FF', fontPreset: 'clean', borderRadius: 'medium' },
    sections: ['hero', 'about', 'services', 'events', 'team', 'faq', 'form', 'contact'],
  },
  ecommerce: {
    label: 'E-commerce',
    description: 'Boutique complète',
    theme: { primaryColor: '#7C3AED', accentColor: '#111', backgroundColor: '#FAFAFF', fontPreset: 'modern', borderRadius: 'medium' },
    sections: ['hero', 'banner', 'shop', 'testimonials', 'faq', 'newsletter', 'contact'],
    sectionContent: {
      shop: ULTRA_SECTION_DEFAULTS.shop,
      banner: { text: '🚚 Livraison Conakry — Paiement à la livraison disponible', linkLabel: 'Commander', linkAction: 'whatsapp' },
    },
  },
};

const AI_SNIPPETS = {
  hero: (a) => ({ title: a.nom, subtitle: a.slogan || `${a.profession} — ${a.region || 'Guinée'}` }),
  about: (a) => ({ body: a.description || `${a.nom} est un acteur reconnu en ${a.profession}. Nous servons nos clients avec passion et professionnalisme.` }),
  services: (a) => ({
    items: (a.services || []).slice(0, 6).map((s) => (
      typeof s === 'string' ? { title: s, description: '', price: 'Sur devis' } : { title: s.nom || s.title, description: s.description || '', price: s.prix || 'Sur devis' }
    )),
  }),
  testimonials: () => ({
    items: [
      { text: 'Service exceptionnel, je recommande vivement !', name: 'Client satisfait', rating: 5 },
      { text: 'Professionnel et à l\'écoute.', name: 'Mariam D.', rating: 5 },
    ],
  }),
  faq: (a) => ({
    items: [
      { question: `Où êtes-vous situés ?`, answer: `Nous sommes basés à ${a.region || 'Conakry'} et intervenons dans toute la Guinée.` },
      { question: 'Comment vous contacter ?', answer: 'Par WhatsApp, téléphone ou le formulaire de ce site.' },
      { question: 'Quels sont vos délais ?', answer: 'Nous répondons sous 24 h et adaptons nos délais à votre projet.' },
    ],
  }),
  cta: (a) => ({ heading: `Prêt à travailler avec ${a.nom} ?`, subtext: 'Contactez-nous dès maintenant.', buttonLabel: 'Nous écrire' }),
};

export function generateAIContent(sectionType, account) {
  const fn = AI_SNIPPETS[sectionType];
  return fn ? fn(account || {}) : {};
}

export function createSiteSnapshot(site, label = '') {
  return {
    id: `snap_${Date.now()}`,
    label: label || new Date().toLocaleString('fr-FR'),
    date: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(site)),
  };
}

export function buildJsonLd(site, pro) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: pro.nom,
    description: site.seo?.description || pro.description,
    url: typeof window !== 'undefined' ? `${window.location.origin}/pro/${site.slug}` : undefined,
    telephone: pro.telephone,
    address: { '@type': 'PostalAddress', addressLocality: pro.region || 'Conakry', addressCountry: 'GN' },
    image: site.seo?.ogImage || undefined,
  };
}

export function t(site, key, fallback) {
  const loc = site.locale?.active || 'fr';
  return site.locale?.strings?.[loc]?.[key] || site.locale?.strings?.fr?.[key] || fallback;
}
