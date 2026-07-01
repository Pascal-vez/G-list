/** Modèle de données et helpers pour les mini-sites portfolio Premium — Niveau 100 */

import { NEW_SECTION_DEFAULTS, THEME_PRESETS, EXTRA_FONT_PRESETS, LEVEL_CHANGELOG } from './minisiteSections';
import {
  MINISITE_ULTRA_LEVEL, LEVEL_MILESTONES as MILESTONES_77, ULTRA_SECTION_DEFAULTS, ULTRA_TEMPLATES,
  generateAIContent, createSiteSnapshot, buildJsonLd, t,
} from './minisiteLevel77';
import { MINISITE_ENTERPRISE_LEVEL, LEVEL_100_MILESTONES, LOCALE_DEFAULTS, mergeLocaleStrings } from './minisiteLevel100';
import { PLATFORM_MILESTONES } from './saasLevel100';

export const MINISITE_LEVEL = MINISITE_ENTERPRISE_LEVEL;
export const LEVEL_MILESTONES = { ...MILESTONES_77, ...LEVEL_100_MILESTONES };
export { THEME_PRESETS, EXTRA_FONT_PRESETS, LEVEL_CHANGELOG, ULTRA_TEMPLATES, generateAIContent, createSiteSnapshot, buildJsonLd, t, LOCALE_DEFAULTS, mergeLocaleStrings, PLATFORM_MILESTONES };

export const FONT_PRESETS = {
  modern: { label: 'Moderne', family: "'Inter', system-ui, sans-serif" },
  elegant: { label: 'Élégant', family: "Georgia, 'Times New Roman', serif" },
  clean: { label: 'Épuré', family: "'Segoe UI', system-ui, sans-serif" },
  ...EXTRA_FONT_PRESETS,
};

/** Classe racine stable (non hashée) — préfixe pour le CSS personnalisé */
export const MINISITE_ROOT_CLASS = 'glist-minisite';

/** Exemple à coller dans Avancé → CSS personnalisé pour vérifier que tout fonctionne */
export const MINISITE_CUSTOM_CSS_SAMPLE = `/* ── Test G-List : CSS personnalisé mini-site ── */

/* Hero : titre plus grand */
.glist-minisite .ms-hero h1 {
  font-size: clamp(2rem, 6vw, 3.5rem);
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
  letter-spacing: -0.03em;
}

/* Hero : effet au survol des boutons */
.glist-minisite .ms-hero a {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.glist-minisite .ms-hero a:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

/* Section par ID (remplacez about par l'id de votre section) */
.glist-minisite #about {
  border-top: 4px solid var(--ms-primary);
}

/* Toutes les sections « services » */
.glist-minisite [data-ms-section="services"] {
  background: color-mix(in srgb, var(--ms-primary) 10%, var(--ms-bg));
}

/* Pied de page */
.glist-minisite .glist-ms-footer {
  border-top: 2px solid var(--ms-primary);
}
`;

export const SITE_TEMPLATES = {
  restaurant: {
    label: 'Restaurant',
    description: 'Carte, galerie et réservations',
    theme: { primaryColor: '#C9A227', accentColor: '#1A1208', backgroundColor: '#FFFCF5', fontPreset: 'elegant', borderRadius: 'medium' },
    sections: ['hero', 'about', 'menu', 'gallery', 'testimonials', 'contact'],
    sectionContent: {
      hero: {
        ctaLabel: 'Réserver une table',
        ctaAction: 'whatsapp',
        variant: 'fullscreen',
      },
      about: {
        heading: 'Notre histoire',
        body: 'Bienvenue dans notre établissement. Nous mettons un point d\'honneur à vous servir une cuisine authentique dans une ambiance chaleureuse.',
        layout: 'split',
      },
      menu: {
        heading: 'Notre carte',
        categories: [
          {
            name: 'Entrées',
            items: [
              { title: 'Salade maison', description: 'Légumes frais de saison', price: '35 000 GNF' },
              { title: 'Soupe du jour', description: 'Recette traditionnelle', price: '25 000 GNF' },
            ],
          },
          {
            name: 'Plats',
            items: [
              { title: 'Poulet yassa', description: 'Mariné aux oignons et citron', price: '65 000 GNF' },
              { title: 'Poisson braisé', description: 'Accompagné d\'attiéké', price: '75 000 GNF' },
            ],
          },
          {
            name: 'Boissons',
            items: [
              { title: 'Jus de bissap', description: 'Maison', price: '10 000 GNF' },
              { title: 'Eau minérale', description: '50 cl', price: '5 000 GNF' },
            ],
          },
        ],
      },
      gallery: { heading: 'Notre ambiance', layout: 'masonry' },
      testimonials: {
        heading: 'Ce qu\'en disent nos clients',
        items: [
          { text: 'Excellent accueil et cuisine authentique !', author: 'Aïssata D.', rating: 5 },
          { text: 'Un incontournable à Conakry.', author: 'Mamadou S.', rating: 5 },
        ],
      },
      contact: { heading: 'Réservez votre table', showHours: true },
    },
  },
  artisan: {
    label: 'Artisan & Services',
    description: 'Portfolio et devis',
    theme: { primaryColor: '#2D6A4F', accentColor: '#1B4332', backgroundColor: '#F8FAF8', fontPreset: 'modern', borderRadius: 'medium' },
    sections: ['hero', 'about', 'services', 'gallery', 'stats', 'cta', 'contact'],
    sectionContent: {
      hero: {
        ctaLabel: 'Demander un devis',
        ctaAction: 'whatsapp',
        variant: 'fullscreen',
      },
      about: {
        heading: 'Notre savoir-faire',
        body: 'Artisan passionné, nous réalisons chaque projet avec rigueur et attention aux détails. Devis gratuit sous 24 h.',
        layout: 'split',
      },
      services: {
        heading: 'Nos prestations',
        items: [
          { title: 'Consultation', description: 'Diagnostic et conseil personnalisé', price: 'Sur devis' },
          { title: 'Installation', description: 'Pose et mise en service', price: 'Sur devis' },
          { title: 'Maintenance', description: 'Entretien et dépannage', price: 'Sur devis' },
        ],
      },
      gallery: { heading: 'Nos réalisations', layout: 'grid' },
      stats: {
        heading: 'Nos chiffres',
        items: [
          { value: '10+', label: 'Années d\'expérience' },
          { value: '500+', label: 'Projets réalisés' },
          { value: '98%', label: 'Clients satisfaits' },
        ],
      },
      cta: {
        heading: 'Un projet en tête ?',
        subtext: 'Contactez-nous pour un devis gratuit et sans engagement.',
        buttonLabel: 'Demander un devis',
        buttonAction: 'whatsapp',
      },
      contact: { heading: 'Parlons de votre projet' },
    },
  },
  corporate: {
    label: 'Entreprise',
    description: 'Présentation pro et équipe',
    theme: { primaryColor: '#1E3A5F', accentColor: '#0D1B2A', backgroundColor: '#FFFFFF', fontPreset: 'clean', borderRadius: 'small' },
    sections: ['hero', 'about', 'stats', 'services', 'team', 'faq', 'contact'],
    sectionContent: {
      hero: {
        ctaLabel: 'Nous contacter',
        ctaAction: 'whatsapp',
        variant: 'split',
      },
      about: {
        heading: 'Qui sommes-nous',
        body: 'Entreprise guinéenne engagée dans l\'excellence et l\'innovation. Nous accompagnons nos clients avec des solutions sur mesure.',
        layout: 'stack',
      },
      stats: {
        heading: 'En chiffres',
        items: [
          { value: '15+', label: 'Années d\'activité' },
          { value: '200+', label: 'Collaborateurs' },
          { value: '50+', label: 'Partenaires' },
          { value: '24/7', label: 'Support client' },
        ],
      },
      services: {
        heading: 'Nos domaines d\'expertise',
        items: [
          { title: 'Conseil', description: 'Accompagnement stratégique', price: '' },
          { title: 'Formation', description: 'Montée en compétences', price: '' },
          { title: 'Support', description: 'Assistance technique dédiée', price: '' },
        ],
      },
      team: {
        heading: 'Notre équipe',
        members: [
          { name: 'Directeur général', role: 'Direction', photo: null, bio: 'Vision et stratégie' },
          { name: 'Responsable commercial', role: 'Commercial', photo: null, bio: 'Relation clients' },
          { name: 'Chef de projet', role: 'Opérations', photo: null, bio: 'Exécution et qualité' },
        ],
      },
      faq: {
        heading: 'Questions fréquentes',
        items: [
          { question: 'Quels sont vos délais de réponse ?', answer: 'Nous répondons sous 24 heures ouvrées à toute demande.' },
          { question: 'Intervenez-vous dans toute la Guinée ?', answer: 'Oui, nous couvrons Conakry et les principales villes du pays.' },
          { question: 'Comment obtenir un devis ?', answer: 'Contactez-nous par WhatsApp ou téléphone pour une estimation gratuite.' },
        ],
      },
      contact: { heading: 'Contactez-nous', showForm: false },
    },
  },
  minimal: {
    label: 'Minimaliste',
    description: 'Épuré et direct',
    theme: { primaryColor: '#111111', accentColor: '#111111', backgroundColor: '#FFFFFF', fontPreset: 'modern', borderRadius: 'small' },
    sections: ['hero', 'text', 'gallery', 'cta', 'contact'],
    sectionContent: {
      hero: {
        ctaLabel: 'Me contacter',
        ctaAction: 'whatsapp',
        variant: 'fullscreen',
      },
      text: {
        heading: 'Ce que je propose',
        body: 'Une approche simple et efficace. Qualité, réactivité et transparence au cœur de chaque mission.',
        align: 'center',
      },
      gallery: { heading: 'Portfolio', layout: 'grid' },
      cta: {
        heading: 'Prêt à commencer ?',
        subtext: 'Une question ? Écrivez-moi.',
        buttonLabel: 'Envoyer un message',
        buttonAction: 'whatsapp',
      },
      contact: { heading: 'Contact', showHours: false },
    },
  },
  salon: {
    label: 'Salon & Beauté',
    description: 'Prestations et réservation',
    theme: { primaryColor: '#BE185D', accentColor: '#1A1A1A', backgroundColor: '#FFF5F7', fontPreset: 'elegant', borderRadius: 'large' },
    sections: ['hero', 'banner', 'services', 'gallery', 'booking', 'testimonials', 'contact'],
    sectionContent: {
      hero: { ctaLabel: 'Prendre rendez-vous', ctaAction: 'whatsapp', variant: 'fullscreen' },
      banner: { text: '✨ Nouvelle collection — Réservez votre créneau', linkLabel: 'Réserver', linkAction: 'whatsapp' },
      services: {
        heading: 'Nos prestations',
        items: [
          { title: 'Coupe & brushing', description: 'Soin complet', price: '80 000 GNF' },
          { title: 'Manucure', description: 'French ou couleur', price: '45 000 GNF' },
          { title: 'Soin visage', description: '45 minutes', price: '120 000 GNF' },
        ],
      },
      gallery: { heading: 'Nos réalisations', layout: 'masonry' },
      booking: { heading: 'Réserver en ligne', slots: ['Mar–Sam 9h–19h'], ctaLabel: 'Choisir un créneau' },
      testimonials: {
        heading: 'Avis clients',
        items: [{ text: 'Accueil chaleureux et résultat parfait !', author: 'Fatou K.', rating: 5 }],
      },
      contact: { heading: 'Nous trouver', showHours: true },
    },
  },
  boutique: {
    label: 'Boutique',
    description: 'Produits et catalogue',
    theme: { primaryColor: '#7C3AED', accentColor: '#1A1A1A', backgroundColor: '#FAFAFF', fontPreset: 'display', borderRadius: 'medium' },
    sections: ['hero', 'banner', 'services', 'pricing', 'gallery', 'partners', 'newsletter', 'contact'],
    sectionContent: {
      hero: { ctaLabel: 'Voir le catalogue', ctaAction: 'whatsapp', variant: 'split' },
      banner: { text: '🛍️ Livraison gratuite à Conakry dès 500 000 GNF', linkLabel: 'Commander', linkAction: 'whatsapp' },
      services: {
        heading: 'Nos produits phares',
        items: [
          { title: 'Collection été', description: 'Nouveautés', price: 'Sur catalogue' },
          { title: 'Accessoires', description: 'Sélection premium', price: 'Dès 25 000 GNF' },
        ],
      },
      pricing: NEW_SECTION_DEFAULTS.pricing,
      gallery: { heading: 'Notre univers', layout: 'grid' },
      partners: { heading: 'Marques partenaires', logos: [{ name: 'Marque A', logo: null }, { name: 'Marque B', logo: null }] },
      newsletter: NEW_SECTION_DEFAULTS.newsletter,
      contact: { heading: 'Contact & commandes' },
    },
  },
  coach: {
    label: 'Coach & Formation',
    description: 'Programmes et blog',
    theme: { primaryColor: '#0D9488', accentColor: '#134E4A', backgroundColor: '#F0FDFA', fontPreset: 'modern', borderRadius: 'medium' },
    sections: ['hero', 'about', 'services', 'pricing', 'blog', 'testimonials', 'form', 'contact'],
    sectionContent: {
      hero: { ctaLabel: 'Réserver un appel', ctaAction: 'whatsapp', variant: 'fullscreen' },
      about: { heading: 'Ma mission', body: 'J\'accompagne entrepreneurs et professionnels vers leurs objectifs avec des méthodes concrètes et personnalisées.' },
      services: {
        heading: 'Programmes',
        items: [
          { title: 'Coaching individuel', description: '4 séances / mois', price: 'Sur devis' },
          { title: 'Formation équipe', description: 'Atelier sur mesure', price: 'Sur devis' },
        ],
      },
      pricing: {
        heading: 'Formules',
        plans: [
          { name: 'Découverte', price: '150 000 GNF', period: '/séance', features: ['1h de coaching', 'Plan d\'action'], highlighted: false },
          { name: 'Accompagnement', price: '500 000 GNF', period: '/mois', features: ['4 séances', 'Suivi WhatsApp', 'Ressources'], highlighted: true },
        ],
      },
      blog: NEW_SECTION_DEFAULTS.blog,
      form: NEW_SECTION_DEFAULTS.form,
      contact: { heading: 'Parlons de votre projet' },
    },
  },
};

export const SECTION_TYPES = {
  hero: { label: 'Bannière', navLabel: 'Accueil', description: 'Couverture, titre et bouton d\'action' },
  about: { label: 'À propos', navLabel: 'À propos', description: 'Votre histoire et votre image' },
  services: { label: 'Services', navLabel: 'Services', description: 'Prestations et tarifs' },
  menu: { label: 'Carte / Menu', navLabel: 'Menu', description: 'Plats, boissons et formules' },
  gallery: { label: 'Galerie', navLabel: 'Galerie', description: 'Photos en grille ou mosaïque' },
  testimonials: { label: 'Témoignages', navLabel: 'Avis', description: 'Recommandations clients' },
  stats: { label: 'Chiffres clés', navLabel: 'Chiffres', description: 'Statistiques et réalisations' },
  team: { label: 'Équipe', navLabel: 'Équipe', description: 'Membres et rôles' },
  faq: { label: 'FAQ', navLabel: 'FAQ', description: 'Questions fréquentes' },
  video: { label: 'Vidéo', navLabel: 'Vidéo', description: 'YouTube ou fichier vidéo' },
  contact: { label: 'Contact', navLabel: 'Contact', description: 'Coordonnées et horaires' },
  text: { label: 'Texte libre', navLabel: 'Infos', description: 'Bloc de contenu personnalisé' },
  files: { label: 'Fichiers', navLabel: 'Documents', description: 'PDF, brochures, catalogues' },
  cta: { label: 'Appel à l\'action', navLabel: null, description: 'Bandeau de conversion' },
  pricing: { label: 'Tarifs', navLabel: 'Tarifs', description: 'Grilles tarifaires et formules' },
  map: { label: 'Carte / Localisation', navLabel: 'Localisation', description: 'Adresse et carte Google Maps' },
  form: { label: 'Formulaire', navLabel: 'Formulaire', description: 'Formulaire de contact personnalisable' },
  blog: { label: 'Blog / Actus', navLabel: 'Blog', description: 'Articles et actualités' },
  partners: { label: 'Partenaires', navLabel: 'Partenaires', description: 'Logos et marques partenaires' },
  banner: { label: 'Bannière promo', navLabel: null, description: 'Bandeau d\'annonce en haut de page' },
  booking: { label: 'Réservations', navLabel: 'RDV', description: 'Créneaux et prise de rendez-vous' },
  newsletter: { label: 'Newsletter', navLabel: 'Newsletter', description: 'Inscription email' },
  shop: { label: 'Boutique', navLabel: 'Boutique', description: 'Produits et panier en ligne' },
  timeline: { label: 'Timeline', navLabel: 'Histoire', description: 'Frise chronologique' },
  portfolio: { label: 'Portfolio', navLabel: 'Portfolio', description: 'Projets filtrables' },
  compare: { label: 'Avant / Après', navLabel: 'Avant/Après', description: 'Comparateur d\'images' },
  events: { label: 'Événements', navLabel: 'Événements', description: 'Agenda et dates' },
  countdown: { label: 'Compte à rebours', navLabel: null, description: 'Lancement ou événement' },
  social: { label: 'Réseaux sociaux', navLabel: 'Réseaux', description: 'Liens sociaux stylés' },
  certifications: { label: 'Certifications', navLabel: 'Labels', description: 'Badges et certifications' },
  quote: { label: 'Citations', navLabel: null, description: 'Citations rotatives' },
  audio: { label: 'Audio / Podcast', navLabel: 'Audio', description: 'Pistes audio' },
};

let sectionCounter = 0;

export function slugify(text) {
  return (text || 'mon-site')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'mon-site';
}

export function getMinisitePublicPath(slug) {
  return `/pro/${slug}`;
}

export function getMinisitePublicUrl(slug) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${getMinisitePublicPath(slug)}`;
  }
  return `https://glist.gn/pro/${slug}`;
}

function nextSectionId() {
  sectionCounter += 1;
  return `sec_${Date.now()}_${sectionCounter}`;
}

function ensureSectionIds(sections) {
  return (sections || []).map((s) => (s?.id ? s : { ...s, id: nextSectionId() }));
}

export function duplicateSection(section) {
  return JSON.parse(JSON.stringify({ ...section, id: nextSectionId() }));
}

export function getSectionNavLabel(section) {
  if (section.navLabel) return section.navLabel;
  if (section.heading) return section.heading;
  return SECTION_TYPES[section.type]?.navLabel || SECTION_TYPES[section.type]?.label || 'Section';
}

function defaultSectionStyle() {
  return { bgColor: '', bgImage: null, variant: 'default', padding: 'normal' };
}

export function createSection(type, overrides = {}) {
  return {
    id: nextSectionId(),
    type,
    visible: true,
    style: defaultSectionStyle(),
    ...getSectionDefaults(type),
    ...overrides,
    style: { ...defaultSectionStyle(), ...overrides.style },
  };
}

function getSectionDefaults(type) {
  switch (type) {
    case 'hero':
      return {
        title: '', subtitle: '', coverImage: null, logoImage: null, videoBackground: null,
        ctaLabel: 'Nous contacter', ctaAction: 'whatsapp', variant: 'fullscreen',
      };
    case 'about':
      return { heading: 'À propos', body: '', image: null, layout: 'split' };
    case 'services':
      return { heading: 'Nos services', items: [], layout: 'grid' };
    case 'menu':
      return {
        heading: 'Notre carte',
        categories: [{ name: 'Plats', items: [{ title: '', description: '', price: '' }] }],
      };
    case 'gallery':
      return { heading: 'Galerie', images: [], layout: 'grid' };
    case 'testimonials':
      return { heading: 'Témoignages', items: [] };
    case 'stats':
      return {
        heading: 'Nos chiffres',
        items: [
          { value: '10+', label: 'Années d\'expérience' },
          { value: '500+', label: 'Clients satisfaits' },
          { value: '24/7', label: 'Disponibilité' },
        ],
      };
    case 'team':
      return {
        heading: 'Notre équipe',
        members: [{ name: '', role: '', photo: null, bio: '' }],
      };
    case 'faq':
      return {
        heading: 'Questions fréquentes',
        items: [{ question: '', answer: '' }],
      };
    case 'video':
      return { heading: 'Découvrez notre univers', videoUrl: '', posterImage: null };
    case 'contact':
      return {
        heading: 'Nous contacter',
        showPhone: true, showEmail: true, showWhatsApp: true, showAddress: true, showHours: true,
        showForm: false,
      };
    case 'text':
      return { heading: '', body: '', align: 'left' };
    case 'files':
      return { heading: 'Documents', files: [] };
    case 'cta':
      return {
        heading: 'Prêt à nous contacter ?', subtext: '', buttonLabel: 'Envoyer un message', buttonAction: 'whatsapp',
      };
    case 'pricing':
    case 'map':
    case 'form':
    case 'blog':
    case 'partners':
    case 'banner':
    case 'booking':
    case 'newsletter':
      return { ...NEW_SECTION_DEFAULTS[type] };
    case 'shop':
    case 'timeline':
    case 'portfolio':
    case 'compare':
    case 'events':
    case 'countdown':
    case 'social':
    case 'certifications':
    case 'quote':
    case 'audio':
      return { ...ULTRA_SECTION_DEFAULTS[type] };
    default:
      return {};
  }
}

export function createHomePage(sections = []) {
  return { id: 'home', label: 'Accueil', slug: '', sections };
}

export function getSitePages(site) {
  if (site?.pages?.length) return site.pages;
  return [createHomePage(site?.sections || [])];
}

export function syncSitePages(site) {
  if (!site) return site;

  const pages = site.pages?.length
    ? site.pages.map((p) => ({ ...p, sections: ensureSectionIds(p.sections) }))
    : null;

  if (pages?.length) {
    const home = pages.find((p) => p.id === 'home') || pages[0];
    return { ...site, pages, sections: home?.sections || [] };
  }

  const incomingSections = ensureSectionIds(site.sections);
  const built = [createHomePage(incomingSections || [])];
  return { ...site, pages: built, sections: built[0]?.sections || [] };
}

export function getPageSections(site, pageId = 'home') {
  const pages = getSitePages(site);
  const page = pages.find((p) => p.id === pageId) || pages[0];
  return page?.sections || [];
}

export function updatePageInSite(site, pageId, patch) {
  const pages = getSitePages(site).map((p) => (p.id === pageId ? { ...p, ...patch } : p));
  return syncSitePages({ ...site, pages });
}

export function addPageToSite(site, label = 'Nouvelle page') {
  const id = `page_${Date.now()}`;
  const slug = slugify(label);
  const pages = [...getSitePages(site), { id, label, slug, sections: [createSection('text', { heading: label, body: '' })] }];
  return syncSitePages({ ...site, pages });
}

export function removePageFromSite(site, pageId) {
  if (pageId === 'home') return site;
  const pages = getSitePages(site).filter((p) => p.id !== pageId);
  return syncSitePages({ ...site, pages: pages.length ? pages : [createHomePage()] });
}

export function exportMinisiteJson(site) {
  return JSON.stringify(syncSitePages(site), null, 2);
}

export function importMinisiteJson(json, account) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return normalizeMinisite(data, account);
  } catch {
    return null;
  }
}

export function createDefaultMinisite(account) {
  const services = (account.services || []).map((s) => (
    typeof s === 'string'
      ? { title: s, description: '', price: '' }
      : { title: s.nom || s.title || '', description: s.description || '', price: s.prix || '' }
  ));

  return syncSitePages({
    level: MINISITE_LEVEL,
    slug: slugify(account.nom),
    published: false,
    templateId: 'artisan',
    theme: {
      primaryColor: '#C9A227',
      accentColor: '#1A1A1A',
      backgroundColor: '#FFFFFF',
      fontPreset: 'modern',
      borderRadius: 'medium',
    },
    settings: {
      showNav: true,
      showFloatingWhatsapp: true,
      animateSections: true,
      showAnnouncement: false,
      announcementText: '',
      showPopup: false,
      popup: { title: '', body: '', ctaLabel: 'Fermer', dismissedKey: 'ms_popup' },
      multiPage: false,
      showCookieBanner: true,
      cookieMessage: 'Ce site utilise des cookies pour améliorer votre expérience.',
    },
    advanced: { customCss: '', headCode: '' },
    locale: { active: 'fr', strings: { fr: {}, en: {} } },
    integrations: { googleAnalyticsId: '', facebookPixelId: '', hotjarId: '' },
    security: { passwordEnabled: false, password: '' },
    snapshots: [],
    pages: null,
    seo: {
      title: account.nom || '',
      description: account.description?.slice(0, 160) || account.slogan || '',
      ogImage: null,
    },
    sections: [
      createSection('hero', {
        title: account.nom || '',
        subtitle: account.slogan || account.profession || '',
      }),
      createSection('about', { heading: 'À propos', body: account.description || '' }),
      createSection('services', {
        heading: 'Nos services',
        items: services.length ? services : [{ title: '', description: '', price: '' }],
      }),
      createSection('gallery', { heading: 'Galerie' }),
      createSection('stats'),
      createSection('testimonials', { heading: 'Ils nous font confiance' }),
      createSection('contact', { heading: 'Nous contacter' }),
    ],
  });
}

function preserveUserSectionContent(type, existing, account) {
  if (!existing) return {};
  const preserved = {};
  switch (type) {
    case 'hero':
      if (existing.title) preserved.title = existing.title;
      if (existing.subtitle) preserved.subtitle = existing.subtitle;
      if (existing.coverImage) preserved.coverImage = existing.coverImage;
      if (existing.logoImage) preserved.logoImage = existing.logoImage;
      break;
    case 'about':
      if (existing.body) preserved.body = existing.body;
      if (existing.image) preserved.image = existing.image;
      break;
    case 'gallery':
      if (existing.images?.length) preserved.images = existing.images;
      break;
    case 'services':
      if (existing.items?.some((i) => i.title)) preserved.items = existing.items;
      break;
    case 'menu':
      if (existing.categories?.some((c) => c.items?.some((i) => i.title))) {
        preserved.categories = existing.categories;
      }
      break;
    case 'testimonials':
      if (existing.items?.length) preserved.items = existing.items;
      break;
    case 'team':
      if (existing.members?.some((m) => m.name)) preserved.members = existing.members;
      break;
    case 'faq':
      if (existing.items?.some((i) => i.question)) preserved.items = existing.items;
      break;
    case 'stats':
      if (existing.items?.length) preserved.items = existing.items;
      break;
    case 'files':
      if (existing.files?.length) preserved.files = existing.files;
      break;
    case 'video':
      if (existing.videoUrl) preserved.videoUrl = existing.videoUrl;
      if (existing.posterImage) preserved.posterImage = existing.posterImage;
      break;
    case 'text':
      if (existing.body) preserved.body = existing.body;
      break;
    default:
      break;
  }
  if (!account) return preserved;
  if (type === 'hero' && !preserved.title) {
    preserved.title = account.nom || '';
  }
  if (type === 'hero' && !preserved.subtitle) {
    preserved.subtitle = account.slogan || account.profession || '';
  }
  if (type === 'about' && !preserved.body && account.description) {
    preserved.body = account.description;
  }
  return preserved;
}

function extractMediaBackup(currentSite) {
  const homeSections = getPageSections(currentSite, 'home');
  const hero = homeSections.find((s) => s.type === 'hero');
  const gallery = homeSections.find((s) => s.type === 'gallery');
  return {
    coverImage: hero?.coverImage || null,
    logoImage: hero?.logoImage || null,
    galleryImages: gallery?.images?.length ? gallery.images : null,
  };
}

function applyMediaBackup(sections, backup) {
  if (!backup) return sections;
  return sections.map((sec) => {
    if (sec.type === 'hero') {
      return {
        ...sec,
        ...(backup.coverImage ? { coverImage: backup.coverImage } : {}),
        ...(backup.logoImage ? { logoImage: backup.logoImage } : {}),
      };
    }
    if (sec.type === 'gallery' && backup.galleryImages) {
      return { ...sec, images: backup.galleryImages };
    }
    return sec;
  });
}

function buildTemplateSections(templateId, account, currentSite = {}, { resetContent = false, freshTemplate = false } = {}) {
  const tpl = getAllSiteTemplates()[templateId];
  if (!tpl) return getPageSections(currentSite, 'home');

  const homeSections = getPageSections(currentSite, 'home');
  const accountServices = (account?.services || []).map((s) => (
    typeof s === 'string'
      ? { title: s, description: '', price: '' }
      : { title: s.nom || s.title || '', description: s.description || '', price: s.prix || s.price || '' }
  )).filter((s) => s.title);

  const useExisting = !resetContent && !freshTemplate;

  return tpl.sections.map((type) => {
    const existing = useExisting ? homeSections.find((s) => s.type === type) : null;
    const templateContent = { ...(tpl.sectionContent?.[type] || {}) };

    if (type === 'services' && accountServices.length && !existing?.items?.some((i) => i.title)) {
      templateContent.items = accountServices;
    }

    const overrides = {
      ...templateContent,
      ...preserveUserSectionContent(type, existing, account),
    };

    return createSection(type, overrides);
  });
}

export function getAllSiteTemplates() {
  return { ...SITE_TEMPLATES, ...ULTRA_TEMPLATES };
}

export function applyTemplate(templateId, account, currentSite = {}, options = {}) {
  const tpl = getAllSiteTemplates()[templateId];
  if (!tpl) return syncSitePages(currentSite);

  const { resetContent = false, freshTemplate = false } = options;
  const mediaBackup = (resetContent || freshTemplate) ? extractMediaBackup(currentSite) : null;
  let sections = buildTemplateSections(templateId, account, currentSite, { resetContent, freshTemplate });
  sections = applyMediaBackup(sections, mediaBackup);

  const pages = getSitePages(currentSite);
  const updatedPages = pages.length
    ? pages.map((p, i) => (i === 0 ? { ...p, sections } : p))
    : [createHomePage(sections)];

  return syncSitePages({
    ...currentSite,
    slug: currentSite.slug || slugify(account?.nom),
    published: currentSite.published === true,
    templateId,
    level: MINISITE_LEVEL,
    theme: {
      primaryColor: '#C9A227',
      accentColor: '#1A1A1A',
      backgroundColor: '#FFFFFF',
      fontPreset: 'modern',
      borderRadius: 'medium',
      ...currentSite.theme,
      ...tpl.theme,
    },
    settings: {
      showNav: true,
      showFloatingWhatsapp: true,
      animateSections: true,
      ...currentSite.settings,
    },
    seo: {
      title: account?.nom || '',
      description: account?.description?.slice(0, 160) || account?.slogan || '',
      ogImage: currentSite.seo?.ogImage || null,
      ...currentSite.seo,
    },
    sections,
    pages: updatedPages,
  });
}

export function normalizeMinisite(data, account) {
  if (!data) {
    if (!account) return null;
    return createDefaultMinisite(account);
  }

  const synced = syncSitePages(data);
  const sectionList = synced.sections || [];

  if (!sectionList.length) {
    if (!account) return null;
    const migrated = createDefaultMinisite(account);
    migrated.slug = synced.slug || migrated.slug;
    migrated.published = synced.published === true;
    if (synced.theme) migrated.theme = { ...migrated.theme, ...synced.theme };
    if (data.color) migrated.theme.primaryColor = data.color;
    if (data.slogan && migrated.sections[0]) migrated.sections[0].subtitle = data.slogan;
    if (data.coverPhoto && migrated.sections[0]) migrated.sections[0].coverImage = data.coverPhoto;
    return migrated;
  }

  const defaults = account ? createDefaultMinisite(account) : null;

  return syncSitePages({
    level: synced.level || MINISITE_LEVEL,
    templateId: synced.templateId || data.templateId || 'artisan',
    slug: synced.slug || data.slug || defaults?.slug || 'mon-site',
    published: synced.published === true,
    theme: {
      ...defaults?.theme,
      ...synced.theme,
      ...data.theme,
    },
    settings: {
      showNav: true,
      showFloatingWhatsapp: true,
      animateSections: true,
      showAnnouncement: false,
      announcementText: '',
      showPopup: false,
      popup: { title: '', body: '', ctaLabel: 'Fermer' },
      multiPage: false,
      ...synced.settings,
      ...data.settings,
    },
    advanced: { customCss: '', headCode: '', ...synced.advanced, ...data.advanced },
    locale: { active: 'fr', strings: { fr: {}, en: {} }, ...synced.locale, ...data.locale },
    integrations: { googleAnalyticsId: '', facebookPixelId: '', hotjarId: '', ...synced.integrations, ...data.integrations },
    security: { passwordEnabled: false, password: '', ...synced.security, ...data.security },
    snapshots: synced.snapshots || data.snapshots || [],
    seo: {
      title: account?.nom || '',
      description: account?.description?.slice(0, 160) || '',
      ogImage: null,
      ...synced.seo,
      ...data.seo,
    },
    sections: ensureSectionIds(sectionList.map((s) => ({
      ...getSectionDefaults(s.type),
      style: defaultSectionStyle(),
      ...s,
      style: { ...defaultSectionStyle(), ...s.style },
    }))),
    pages: synced.pages?.length
      ? synced.pages.map((p) => ({
        ...p,
        sections: ensureSectionIds((p.sections || []).map((s) => ({
          ...getSectionDefaults(s.type),
          style: defaultSectionStyle(),
          ...s,
          style: { ...defaultSectionStyle(), ...s.style },
        }))),
      }))
      : null,
  });
}

export function reorderSections(sections, fromIndex, toIndex) {
  const next = [...sections];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function parseVideoEmbed(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (yt) return { type: 'youtube', id: yt[1] };
  if (url.startsWith('data:video') || url.match(/\.(mp4|webm|ogg)(\?|$)/i)) return { type: 'file', src: url };
  return { type: 'link', src: url };
}
