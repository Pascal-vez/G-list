import { CATEGORIES, REGIONS, CATEGORY_DESCRIPTIONS, SITE_CONTACT_EMAIL } from './constants';
import { FAQ_ITEMS } from './glistFaq';
import { DEFAULT_SUBSCRIPTION_PLANS, ANNUAL_PAID_MONTHS } from '../utils/planConfig';

/** Liens rapides affichés à l'ouverture du bot */
export const BOT_QUICK_PROMPTS = [
  { label: 'Trouver un pro', query: 'Comment trouver un professionnel ?' },
  { label: 'S\'inscrire pro', query: 'Comment créer mon espace professionnel ?' },
  { label: 'Tarifs & plans', query: 'Quels sont les plans Free Advanced Premium ?' },
  { label: 'Profils vérifiés', query: 'Voir les profils vérifiés' },
  { label: 'Contact', query: 'Comment vous contacter ?' },
];

export const BOT_SITE_PAGES = [
  { label: 'Accueil', path: '/', keywords: ['accueil', 'home', 'debut', 'page principale'] },
  { label: 'Annuaire', path: '/annuaire', keywords: ['annuaire', 'liste', 'catalogue', 'tous les pros'] },
  { label: 'Espace pro', path: '/espace-pro', keywords: ['espace pro', 'dashboard pro', 'mon espace', 'connexion pro', 'inscription pro'] },
  { label: 'Espace visiteur', path: '/dashboard/visiteur', keywords: ['espace visiteur', 'compte visiteur', 'mes favoris', 'mon compte'] },
  { label: 'FAQ', path: '/faq', keywords: ['faq', 'questions', 'aide', 'aide moi'] },
  { label: 'Contact', path: '/contact', keywords: ['contact', 'nous contacter', 'support', 'assistance', 'email'] },
  { label: 'À propos', path: '/a-propos', keywords: ['a propos', 'apropos', 'qui etes vous', 'mission'] },
  { label: 'Confidentialité', path: '/confidentialite', keywords: ['confidentialite', 'donnees personnelles', 'rgpd', 'vie privee'] },
  { label: 'Conditions', path: '/conditions', keywords: ['conditions', 'cgu', 'utilisation'] },
  { label: 'Cookies', path: '/cookies', keywords: ['cookies', 'traceurs'] },
  { label: 'Mentions légales', path: '/mentions-legales', keywords: ['mentions legales', 'legal'] },
  { label: 'Plan du site', path: '/plan-du-site', keywords: ['plan du site', 'sitemap', 'navigation'] },
  { label: 'Mot de passe oublié', path: '/mot-de-passe-oublie', keywords: ['mot de passe oublie', 'reinitialiser mot de passe', 'password'] },
];

export const BOT_PRO_TABS = [
  { label: 'Tableau de bord', path: '/espace-pro?tab=overview', tab: 'overview', keywords: ['tableau de bord', 'overview', 'accueil pro'] },
  { label: 'Mon profil', path: '/espace-pro?tab=profile', tab: 'profile', keywords: ['mon profil', 'editer profil', 'modifier profil'] },
  { label: 'Services', path: '/espace-pro?tab=services', tab: 'services', keywords: ['services', 'prestations', 'tarifs'] },
  { label: 'Photos', path: '/espace-pro?tab=photos', tab: 'photos', keywords: ['photos', 'galerie', 'images'] },
  { label: 'Avis clients', path: '/espace-pro?tab=reviews', tab: 'reviews', keywords: ['avis', 'reviews', 'commentaires clients'] },
  { label: 'Upgrade / Offres', path: '/espace-pro?tab=upgrade', tab: 'upgrade', keywords: ['upgrade', 'abonnement', 'plan', 'premium', 'advanced', 'tarif pro', 'prix'] },
  { label: 'Statistiques', path: '/espace-pro?tab=analytics', tab: 'analytics', keywords: ['statistiques', 'analytics', 'stats', 'vues'] },
  { label: 'Concurrence', path: '/espace-pro?tab=concurrence', tab: 'concurrence', keywords: ['concurrence', 'concurrents', 'benchmark'] },
  { label: 'Centre d\'alertes', path: '/espace-pro?tab=alerts', tab: 'alerts', keywords: ['alertes', 'notifications pro', 'centre alertes'] },
  { label: 'CRM', path: '/espace-pro?tab=crm', tab: 'crm', keywords: ['crm', 'prospects', 'clients', 'pipeline'] },
  { label: 'Mini-site', path: '/espace-pro?tab=minisite', tab: 'minisite', keywords: ['mini site', 'minisite', 'site web', 'portfolio'] },
  { label: 'Rapports', path: '/espace-pro?tab=reports', tab: 'reports', keywords: ['rapports', 'report', 'export pdf'] },
  { label: 'Facturation', path: '/espace-pro?tab=billing', tab: 'billing', keywords: ['facturation', 'paiement', 'facture', 'abonnement actif'] },
  { label: 'Paramètres', path: '/espace-pro?tab=settings', tab: 'settings', keywords: ['parametres', 'settings', 'compte', 'securite'] },
];

/** Mots-clés métier → id catégorie */
export const PROFESSION_ALIASES = {
  plombier: 'plomberie', plomberie: 'plomberie', sanitaire: 'plomberie',
  electricien: 'electricite', électricien: 'electricite', electricite: 'electricite',
  medecin: 'sante', médecin: 'sante', docteur: 'sante', clinique: 'sante', sante: 'sante',
  pharmacie: 'pharmacies', pharmacien: 'pharmacies',
  avocat: 'juridique', notaire: 'juridique', juriste: 'juridique',
  macon: 'maconnerie', maçon: 'maconnerie', maconnerie: 'maconnerie', carreleur: 'maconnerie',
  menuisier: 'menuiserie', ebeniste: 'menuiserie', ébéniste: 'menuiserie',
  peintre: 'peinture', decorateur: 'peinture', décoration: 'peinture',
  restaurant: 'restaurants', maquis: 'restaurants', traiteur: 'restaurants',
  coiffeur: 'coiffure', coiffeuse: 'coiffure', salon: 'coiffure', beaute: 'coiffure', beauté: 'coiffure',
  photographe: 'photo', video: 'photo', vidéaste: 'photo',
  hotel: 'hotels', hôtel: 'hotels', hebergement: 'hotels',
  garage: 'garage', mecanicien: 'garage', mécanicien: 'garage', auto: 'garage',
  informaticien: 'informatique', developpeur: 'informatique', tech: 'informatique', ordinateur: 'informatique',
  professeur: 'education', ecole: 'education', école: 'education', formation: 'education',
  banque: 'banques', comptable: 'banques', finance: 'banques',
  taxi: 'transport', transporteur: 'transport', livraison: 'transport',
  agriculteur: 'agriculture', elevage: 'agriculture', élevage: 'agriculture',
  architecte: 'btp', btp: 'btp', construction: 'btp', batiment: 'btp',
  commerce: 'commerce', boutique: 'commerce', magasin: 'commerce',
};

function formatGNF(n) {
  return new Intl.NumberFormat('fr-GN').format(n);
}

const adv = DEFAULT_SUBSCRIPTION_PLANS.advanced;
const prem = DEFAULT_SUBSCRIPTION_PLANS.premium;

/** Entrées de connaissance statiques */
export const BOT_KNOWLEDGE = [
  {
    id: 'greeting',
    keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'hey', 'bonne journee'],
    priority: 1,
    answer: 'Bonjour ! Je suis l\'assistant G-List. Je peux vous guider sur la plateforme, vous aider à trouver un professionnel en Guinée ou vous orienter vers la bonne page (espace pro, tarifs, FAQ…). Que cherchez-vous ?',
    links: [
      { label: 'Annuaire', path: '/annuaire' },
      { label: 'Espace pro', path: '/espace-pro' },
      { label: 'FAQ', path: '/faq' },
    ],
  },
  {
    id: 'thanks',
    keywords: ['merci', 'super', 'parfait', 'genial', 'génial', 'cool'],
    priority: 2,
    answer: 'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions sur G-List.',
    links: [{ label: 'Contact', path: '/contact' }],
  },
  {
    id: 'what-is-glist',
    keywords: ['g-list', 'glist', 'c est quoi', 'qu est ce que', 'annuaire guinee', 'guinée', 'plateforme'],
    priority: 3,
    answer: 'G-List (glist.gn) est l\'annuaire professionnel de référence en Guinée. Visiteurs et entreprises y trouvent des professionnels par métier et par ville, avec profils vérifiés, avis, contact WhatsApp et offres pro (Free, Advanced, Premium).',
    links: [
      { label: 'Découvrir G-List', path: '/a-propos' },
      { label: 'Parcourir l\'annuaire', path: '/annuaire' },
    ],
  },
  {
    id: 'search-pro',
    keywords: ['trouver', 'chercher', 'rechercher', 'comment trouver', 'ou trouver', 'où trouver', 'professionnel', 'prestataire', 'artisan'],
    priority: 4,
    answer: 'Pour trouver un professionnel : utilisez l\'annuaire avec filtres (catégorie, ville, note), la recherche par mot-clé ou parcourez les catégories depuis l\'accueil. Dites-moi un métier et une ville (ex. « plombier à Conakry ») et je vous enverrai le lien direct.',
    links: [
      { label: 'Ouvrir l\'annuaire', path: '/annuaire' },
      { label: 'Catégories', path: '/#categories' },
    ],
  },
  {
    id: 'verified',
    keywords: ['verifie', 'vérifié', 'badge', 'confiance', 'certifie', 'certifié'],
    priority: 3,
    answer: 'Les profils « Vérifié » ont été contrôlés par l\'équipe G-List. Filtrez l\'annuaire pour n\'afficher que les profils vérifiés.',
    links: [{ label: 'Profils vérifiés', path: '/annuaire?verified=verified' }],
  },
  {
    id: 'register-pro',
    keywords: ['inscrire', 'inscription', 'creer compte pro', 'créer compte', 'rejoindre', 'devenir pro', 'espace professionnel', 'enregistrer mon activite'],
    priority: 4,
    answer: 'Pour inscrire votre activité : rendez-vous sur l\'Espace pro, créez votre compte, puis complétez profil, services, photos et horaires. Votre fiche apparaîtra dans l\'annuaire.',
    links: [
      { label: 'Créer mon espace pro', path: '/espace-pro' },
      { label: 'Voir les offres', path: '/espace-pro?tab=upgrade' },
    ],
  },
  {
    id: 'visitor-account',
    keywords: ['compte visiteur', 'favoris', 'historique visiteur', 'creer compte visiteur'],
    priority: 3,
    answer: 'L\'espace visiteur permet de sauvegarder vos favoris, retrouver vos recherches et gérer votre profil.',
    links: [{ label: 'Espace visiteur', path: '/dashboard/visiteur' }],
  },
  {
    id: 'contact-team',
    keywords: ['nous contacter', 'contacter g-list', 'contacter g list', 'support', 'assistance', 'aide', 'email', 'equipe', 'équipe'],
    priority: 2,
    answer: `Pour joindre l'équipe G-List : email ${SITE_CONTACT_EMAIL}, WhatsApp +224 626 41 93 31, ou le formulaire sur la page Contact.`,
    links: [{ label: 'Contact', path: '/contact' }],
  },
  {
    id: 'contact-pro',
    keywords: ['contacter', 'whatsapp', 'telephone', 'téléphone', 'appeler', 'devis', 'demande de devis'],
    priority: 3,
    answer: 'Sur chaque fiche pro : bouton WhatsApp, numéro de téléphone et (Premium) formulaire de demande de devis. Ouvrez un profil depuis l\'annuaire pour contacter directement.',
    links: [{ label: 'Annuaire', path: '/annuaire' }],
  },
  {
    id: 'report',
    keywords: ['signaler', 'signalement', 'abus', 'fraude', 'faux profil', 'moderation'],
    priority: 3,
    answer: 'Utilisez le bouton « Signaler » sur la fiche concernée ou contactez-nous via la page Contact.',
    links: [
      { label: 'Contact', path: '/contact' },
      { label: 'FAQ signalement', path: '/faq' },
    ],
  },
  {
    id: 'plans-overview',
    keywords: ['plan', 'plans', 'tarif', 'tarifs', 'prix', 'abonnement', 'free', 'advanced', 'premium', 'offre', 'offres', 'mensuel', 'annuel'],
    priority: 5,
    answer: `G-List propose 3 offres pro :\n\n• **Free** — profil basique, 3 services, 2 photos\n• **Advanced** — ${formatGNF(adv.priceMonthly)} GNF/mois : analytics, alertes, réponses avis, concurrence\n• **Premium** — ${formatGNF(prem.priceMonthly)} GNF/mois : CRM, mini-site, rapports, réputation\n\nAnnuel : ${ANNUAL_PAID_MONTHS} mois payés pour 12 mois d'accès (2 mois offerts).`,
    links: [
      { label: 'Voir les offres', path: '/espace-pro?tab=upgrade' },
      { label: 'FAQ plans', path: '/faq' },
    ],
  },
  {
    id: 'privacy',
    keywords: ['donnees', 'données', 'supprimer compte', 'confidentialite', 'cookies', 'rgpd', 'export'],
    priority: 3,
    answer: 'Vos données sont décrites dans notre politique de confidentialité. Gérez les cookies via la bannière ou la page dédiée. Les comptes pro Premium peuvent exporter leurs données (RGPD) depuis les paramètres.',
    links: [
      { label: 'Confidentialité', path: '/confidentialite' },
      { label: 'Cookies', path: '/cookies' },
    ],
  },
  ...FAQ_ITEMS.map((item, i) => ({
    id: `faq-${i}`,
    keywords: [
      ...item.q.toLowerCase().replace(/[?'']/g, '').split(/\s+/).filter((w) => w.length > 3),
      item.q.toLowerCase(),
    ],
    priority: 2,
    answer: item.a,
    links: [{ label: 'Toute la FAQ', path: '/faq' }],
  })),
  ...BOT_PRO_TABS.map((tab) => ({
    id: `pro-tab-${tab.tab}`,
    keywords: tab.keywords,
    priority: 3,
    answer: `Accédez à « ${tab.label} » depuis votre espace professionnel.`,
    links: [{ label: tab.label, path: tab.path }],
  })),
  ...BOT_SITE_PAGES.map((page) => ({
    id: `page-${page.path}`,
    keywords: page.keywords,
    priority: 1,
    answer: `Voici le lien vers ${page.label}.`,
    links: [{ label: page.label, path: page.path }],
  })),
];

/** Génère les liens catégorie + région détectés dans la requête */
export function buildCategoryLinks(query) {
  const n = normalizeText(query);
  const links = [];
  let matchedCategory = null;
  let matchedRegion = null;
  let searchTerm = '';

  for (const [alias, catId] of Object.entries(PROFESSION_ALIASES)) {
    if (n.includes(normalizeText(alias))) {
      matchedCategory = CATEGORIES.find((c) => c.id === catId);
      searchTerm = alias;
      break;
    }
  }

  if (!matchedCategory) {
    matchedCategory = CATEGORIES.find((c) => {
      const name = normalizeText(c.name);
      const id = normalizeText(c.id);
      return n.includes(name) || n.includes(id) || name.split(/\s+/).some((w) => w.length > 3 && n.includes(w));
    });
  }

  matchedRegion = REGIONS.find((r) => n.includes(normalizeText(r)));

  if (matchedCategory) {
    const params = new URLSearchParams();
    if (matchedRegion) {
      params.set('region', matchedRegion);
      if (searchTerm) params.set('search', searchTerm);
      links.push({
        label: `${matchedCategory.name} · ${matchedRegion}`,
        path: `/annuaire?${params.toString()}`,
      });
    } else {
      if (searchTerm) params.set('search', searchTerm);
      const qs = params.toString();
      links.push({
        label: matchedCategory.name,
        path: `/categorie/${matchedCategory.id}${qs ? `?${qs}` : ''}`,
      });
    }
    const desc = CATEGORY_DESCRIPTIONS[matchedCategory.id];
    return {
      category: matchedCategory,
      region: matchedRegion,
      links,
      answer: desc
        ? `${desc}${matchedRegion ? ` Voici les professionnels à ${matchedRegion}.` : ''}`
        : `Parcourez la catégorie ${matchedCategory.name}${matchedRegion ? ` à ${matchedRegion}` : ''}.`,
    };
  }

  if (matchedRegion) {
    links.push({
      label: `Annuaire · ${matchedRegion}`,
      path: `/annuaire?region=${encodeURIComponent(matchedRegion)}`,
    });
    return {
      region: matchedRegion,
      links,
      answer: `Voici l'annuaire filtré pour ${matchedRegion}. Ajoutez un métier (ex. plombier, coiffeur) pour affiner.`,
    };
  }

  return null;
}

export function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/['']/g, ' ')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getCategoryQuickLinks() {
  return CATEGORIES.slice(0, 8).map((c) => ({
    label: c.name,
    path: `/categorie/${c.id}`,
  }));
}
