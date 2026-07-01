import {
  getPlatformKPIs, getRevenueStats, getProsWithAdminState,
  findDuplicateGroups, getIAInsights, getOpportunityGaps,
} from '../utils/adminAnalytics';
import { getSubscriptionPlans, getReports } from '../utils/storage';
import { DEFAULT_SUBSCRIPTION_PLANS, ANNUAL_PAID_MONTHS } from '../utils/planConfig';

function formatGNF(n) {
  return new Intl.NumberFormat('fr-GN').format(n);
}

export const ADMIN_BOT_QUICK_PROMPTS = [
  { label: 'Stats live', query: 'Donne-moi les stats de la plateforme' },
  { label: 'Modération', query: 'Ouvrir la modération et signalements' },
  { label: 'Gérer les pros', query: 'Comment gérer les professionnels ?' },
  { label: 'Modifier les offres', query: 'Modifier les prix des plans' },
  { label: 'Revenus MRR', query: 'Quel est le MRR actuel ?' },
  { label: 'Doublons', query: 'Y a-t-il des doublons à traiter ?' },
];

/** Onglets admin — navigation directe depuis le bot */
export const ADMIN_TABS_BOT = [
  { id: 'overview', label: 'Overview', keywords: ['overview', 'apercu', 'accueil admin', 'vue ensemble', 'tableau de bord admin'] },
  { id: 'pros', label: 'Professionnels', keywords: ['professionnels', 'pros', 'fiches pro', 'liste pros', 'gerer pros'] },
  { id: 'users', label: 'Utilisateurs', keywords: ['utilisateurs', 'visiteurs', 'comptes', 'inscrits'] },
  { id: 'analytics', label: 'Analytics', keywords: ['analytics', 'analyses', 'statistiques detaillees'] },
  { id: 'map', label: 'Carte Guinée', keywords: ['carte', 'guinee', 'densite', 'regions carte'] },
  { id: 'opportunities', label: 'Opportunités', keywords: ['opportunites', 'zones blanches', 'marches'] },
  { id: 'content', label: 'Contenu', keywords: ['contenu', 'generateur contenu', 'posts'] },
  { id: 'moderation', label: 'Modération', keywords: ['moderation', 'signalements', 'signaler', 'reports pending'] },
  { id: 'notifications', label: 'Notifications', keywords: ['notifications', 'broadcast', 'diffuser', 'annonce'] },
  { id: 'audit', label: 'Journal d\'audit', keywords: ['audit', 'journal', 'historique actions', 'log admin'] },
  { id: 'ia', label: 'IA Insights', keywords: ['ia insights', 'intelligence artificielle', 'recommandations ia'] },
  { id: 'revenue', label: 'Revenus', keywords: ['revenus', 'mrr', 'arr', 'chiffre affaires'] },
  { id: 'reports', label: 'Rapports', keywords: ['rapports admin', 'export rapport', 'generer rapport'] },
  { id: 'plans', label: 'Offres', keywords: ['offres', 'plans', 'prix abonnement', 'tarifs admin', 'subscription'] },
  { id: 'legacy', label: 'Feedback', keywords: ['feedback', 'evaluations', 'suggestions utilisateurs', 'votes'] },
  { id: 'settings', label: 'Paramètres', keywords: ['parametres', 'settings', 'configuration', 'config admin', 'preferences admin'] },
];

function liveStatsAnswer(ctx) {
  const kpis = getPlatformKPIs(ctx?.dateRange);
  const rev = getRevenueStats(ctx?.dateRange);
  const plans = getSubscriptionPlans();
  return [
    `Données live (${kpis.periodDays} jours sélectionnés) :`,
    '',
    `• ${kpis.totalPros} professionnels actifs · ${kpis.verified} vérifiés`,
    `• ${kpis.premium} Premium · ${kpis.advanced} Advanced`,
    `• ${kpis.totalViews.toLocaleString('fr-FR')} vues · ${kpis.totalSearches} recherches`,
    `• ${kpis.pendingReports} signalement(s) en attente`,
    `• MRR estimé : ${formatGNF(rev.mrr)} GNF (${rev.advanced} Adv. + ${rev.premium} Prem.)`,
    '',
    `Prix actuels : Advanced ${formatGNF(plans.advanced?.priceMonthly || DEFAULT_SUBSCRIPTION_PLANS.advanced.priceMonthly)} GNF/mois · Premium ${formatGNF(plans.premium?.priceMonthly || DEFAULT_SUBSCRIPTION_PLANS.premium.priceMonthly)} GNF/mois`,
  ].join('\n');
}

function revenueAnswer(ctx) {
  const rev = getRevenueStats(ctx?.dateRange);
  const adv = getSubscriptionPlans().advanced?.priceMonthly ?? DEFAULT_SUBSCRIPTION_PLANS.advanced.priceMonthly;
  const prem = getSubscriptionPlans().premium?.priceMonthly ?? DEFAULT_SUBSCRIPTION_PLANS.premium.priceMonthly;
  return [
    'Revenus abonnements (estimation live) :',
    '',
    `• MRR : ${formatGNF(rev.mrr)} GNF`,
    `• ARR : ${formatGNF(rev.mrr * 12)} GNF`,
    `• Free : ${rev.free} · Advanced (${formatGNF(adv)}) : ${rev.advanced} · Premium (${formatGNF(prem)}) : ${rev.premium}`,
    '',
    `Annuel : ${ANNUAL_PAID_MONTHS} mois payés pour 12 mois d'accès.`,
  ].join('\n');
}

function prosManagementAnswer() {
  const pros = getProsWithAdminState().filter((p) => !p.hidden);
  const unverified = pros.filter((p) => !p.verifie && p.adminStatus === 'actif').length;
  const disabled = pros.filter((p) => p.adminStatus === 'désactivé').length;
  const duplicates = pros.filter((p) => p.adminStatus === 'doublon').length;
  return [
    `Gestion des professionnels (${pros.length} fiches visibles) :`,
    '',
    '• Recherche par nom, métier ou ville',
    '• Changer le plan (Free / Advanced / Premium) depuis le tableau',
    '• Vérifier · Signaler doublon · Désactiver',
    '• Cliquer sur un nom → fiche publique',
    '',
    `État actuel : ${unverified} non vérifié(s) · ${disabled} désactivé(s) · ${duplicates} doublon(s) signalé(s)`,
  ].join('\n');
}

function duplicatesAnswer() {
  const groups = findDuplicateGroups();
  if (!groups.length) {
    return 'Aucun groupe de doublons détecté pour le moment. Consultez l\'onglet Professionnels pour signaler manuellement.';
  }
  return `${groups.length} groupe(s) de doublons potentiels détecté(s). Vérifiez dans Professionnels ou Modération, puis fusionnez ou masquez les fiches en double.`;
}

function moderationAnswer() {
  const pending = getReports().filter((r) => r.status === 'pending').length;
  return [
    `Modération — ${pending} signalement(s) en attente.`,
    '',
    'Actions : approuver, rejeter ou marquer comme traité.',
    'Les utilisateurs signalent depuis les fiches pro publiques.',
  ].join('\n');
}

function plansAdminAnswer() {
  const plans = getSubscriptionPlans();
  return [
    'Édition des offres (onglet Offres) :',
    '',
    `• Free : ${plans.free?.name || 'Free'} — gratuit`,
    `• Advanced : ${formatGNF(plans.advanced?.priceMonthly ?? 0)} GNF/mois`,
    `• Premium : ${formatGNF(plans.premium?.priceMonthly ?? 0)} GNF/mois`,
    '',
    'Modifiez prix, descriptions et fonctionnalités listées. Les changements s\'appliquent à l\'espace pro Upgrade.',
    `Annuel : ${ANNUAL_PAID_MONTHS} mois facturés = 12 mois d'accès.`,
  ].join('\n');
}

function iaInsightsAnswer(ctx) {
  const { recommendations = [], alerts = [] } = getIAInsights(ctx?.dateRange) || {};
  const lines = [...alerts.slice(0, 2), ...recommendations.slice(0, 2)];
  if (!lines.length) return 'Consultez l\'onglet IA Insights pour les tendances et recommandations.';
  return `IA Insights :\n\n${lines.map((l) => `• ${l}`).join('\n')}\n\nDétails dans IA Insights.`;
}

function opportunitiesAnswer(ctx) {
  const gaps = getOpportunityGaps(5, ctx?.dateRange);
  if (!gaps?.length) return 'Consultez l\'onglet Opportunités pour les zones à fort potentiel.';
  const top = gaps.slice(0, 3).map((g) => `• ${g.region} — ${g.cat} (${g.searches} rech. / ${g.pros} pro(s))`).join('\n');
  return `Top opportunités :\n\n${top}\n\nDétails dans Opportunités.`;
}

export const ADMIN_BOT_KNOWLEDGE = [
  {
    id: 'admin-greeting',
    keywords: ['bonjour admin', 'salut admin', 'aide admin', 'assistant admin'],
    priority: 8,
    answer: 'Bonjour ! Je suis **G-Bot Admin**, votre copilote avec accès aux données live, aux 15 onglets du dashboard et à toute la doc G-List. Je peux ouvrir un onglet, résumer les KPIs ou guider une action (modération, plans, pros…).',
    links: [
      { label: 'Overview', adminTab: 'overview' },
      { label: 'Professionnels', adminTab: 'pros' },
      { label: 'Revenus', adminTab: 'revenue' },
    ],
  },
  {
    id: 'admin-live-stats',
    keywords: ['stats', 'statistiques', 'kpi', 'chiffres', 'donne moi', 'combien', 'plateforme', 'live', 'aujourd hui'],
    priority: 12,
    answer: liveStatsAnswer,
    links: [
      { label: 'Overview', adminTab: 'overview' },
      { label: 'Analytics', adminTab: 'analytics' },
      { label: 'Revenus', adminTab: 'revenue' },
    ],
  },
  {
    id: 'admin-revenue',
    keywords: ['mrr', 'arr', 'revenu', 'revenus', 'chiffre', 'abonnements actifs'],
    priority: 11,
    answer: revenueAnswer,
    links: [{ label: 'Revenus', adminTab: 'revenue' }, { label: 'Offres', adminTab: 'plans' }],
  },
  {
    id: 'admin-pros',
    keywords: ['professionnel', 'professionnels', 'verifier', 'desactiver', 'plan pro', 'activer plan', 'fiche pro'],
    priority: 10,
    answer: prosManagementAnswer,
    links: [{ label: 'Professionnels', adminTab: 'pros' }, { label: 'Voir le site', path: '/annuaire' }],
  },
  {
    id: 'admin-duplicates',
    keywords: ['doublon', 'doublons', 'duplicate', 'fusionner', 'merge'],
    priority: 10,
    answer: duplicatesAnswer,
    links: [{ label: 'Professionnels', adminTab: 'pros' }, { label: 'Modération', adminTab: 'moderation' }],
  },
  {
    id: 'admin-moderation',
    keywords: ['moderation', 'signalement', 'signalements', 'report', 'abuse', 'contenu inapproprie'],
    priority: 10,
    answer: moderationAnswer,
    links: [{ label: 'Modération', adminTab: 'moderation' }],
  },
  {
    id: 'admin-plans',
    keywords: ['modifier prix', 'prix plan', 'offre', 'offres', 'tarif admin', 'subscription plan', 'advanced premium prix'],
    priority: 10,
    answer: plansAdminAnswer,
    links: [{ label: 'Offres', adminTab: 'plans' }, { label: 'Upgrade public', path: '/espace-pro?tab=upgrade' }],
  },
  {
    id: 'admin-notifications',
    keywords: ['notification', 'broadcast', 'annonce', 'message masse', 'diffuser notification'],
    priority: 9,
    answer: 'Créez des notifications système (info, alerte, promo) ciblées : tous, pros uniquement ou visiteurs. Elles s\'affichent dans l\'espace correspondant.',
    links: [{ label: 'Notifications', adminTab: 'notifications' }],
  },
  {
    id: 'admin-audit',
    keywords: ['audit', 'journal audit', 'trace', 'historique admin', 'qui a fait'],
    priority: 9,
    answer: 'Le journal d\'audit enregistre les actions sensibles : upgrades pro, broadcasts admin, suppressions, etc. Filtrez par période via le sélecteur de dates.',
    links: [{ label: 'Journal d\'audit', adminTab: 'audit' }],
  },
  {
    id: 'admin-export',
    keywords: ['exporter', 'export', 'json', 'backup', 'sauvegarder donnees'],
    priority: 9,
    answer: 'Export JSON complet depuis l\'onglet Feedback (bouton « Exporter en JSON »). Contient évaluations, votes, suggestions et données agrégées.',
    links: [{ label: 'Feedback & export', adminTab: 'legacy' }],
  },
  {
    id: 'admin-reset',
    keywords: ['reinitialiser', 'reset', 'effacer donnees', 'tout supprimer'],
    priority: 8,
    answer: 'Réinitialisation des données prototype disponible dans Feedback (double confirmation). Action irréversible — exportez d\'abord si besoin.',
    links: [{ label: 'Feedback', adminTab: 'legacy' }],
  },
  {
    id: 'admin-users',
    keywords: ['utilisateur', 'visiteur', 'inscrits', 'comptes'],
    priority: 9,
    answer: 'Onglet Utilisateurs : comptes visiteurs et pros inscrits, gestion des rôles et activation d\'abonnements.',
    links: [{ label: 'Utilisateurs', adminTab: 'users' }],
  },
  {
    id: 'admin-ia',
    keywords: ['ia insight', 'recommandation', 'intelligence artificielle admin'],
    priority: 9,
    answer: iaInsightsAnswer,
    links: [{ label: 'IA Insights', adminTab: 'ia' }],
  },
  {
    id: 'admin-opportunities',
    keywords: ['opportunite', 'zone blanche', 'marche inexploite', 'gap'],
    priority: 8,
    answer: opportunitiesAnswer,
    links: [{ label: 'Opportunités', adminTab: 'opportunities' }, { label: 'Carte', adminTab: 'map' }],
  },
  {
    id: 'admin-reports',
    keywords: ['rapport admin', 'generer rapport', 'pdf admin', 'reporting'],
    priority: 8,
    answer: 'Générez des rapports PDF/HTML sur la période sélectionnée : KPIs, revenus, modération, croissance.',
    links: [{ label: 'Rapports', adminTab: 'reports' }],
  },
  {
    id: 'admin-feedback',
    keywords: ['feedback', 'evaluation', 'suggestion', 'thumbs', 'avis plateforme'],
    priority: 8,
    answer: 'Consultez votes, évaluations détaillées, engagement utilisateurs et suggestions. Export et reset disponibles.',
    links: [{ label: 'Feedback', adminTab: 'legacy' }],
  },
  {
    id: 'admin-date-range',
    keywords: ['periode', 'date', 'filtre date', '30 jours', 'calendrier'],
    priority: 7,
    answer: 'Le sélecteur « Période d\'analyse » en haut du dashboard filtre Overview, Analytics, Revenus, Feedback, etc. Utilisez les raccourcis 7J / 30J / 90J ou des dates personnalisées.',
    links: [{ label: 'Overview', adminTab: 'overview' }],
  },
  {
    id: 'admin-public-site',
    keywords: ['site public', 'voir le site', 'annuaire public', 'homepage'],
    priority: 6,
    answer: 'Liens vers le site public (s\'ouvrent dans un nouvel onglet) :',
    links: [
      { label: 'Accueil', path: '/', external: true },
      { label: 'Annuaire', path: '/annuaire', external: true },
      { label: 'FAQ', path: '/faq', external: true },
    ],
  },
  ...ADMIN_TABS_BOT.map((tab) => ({
    id: `admin-tab-${tab.id}`,
    keywords: tab.keywords,
    priority: 7,
    answer: `J'ouvre l'onglet **${tab.label}** pour vous.`,
    links: [{ label: tab.label, adminTab: tab.id }],
  })),
];

export function detectAdminTab(query) {
  const n = query.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  for (const tab of ADMIN_TABS_BOT) {
    if (tab.keywords.some((kw) => n.includes(kw.normalize('NFD').replace(/\p{Diacritic}/gu, '')))) {
      return tab;
    }
  }
  if (n.includes('ouvrir') || n.includes('aller') || n.includes('afficher')) {
    for (const tab of ADMIN_TABS_BOT) {
      if (n.includes(tab.label.toLowerCase()) || n.includes(tab.id)) return tab;
    }
  }
  return null;
}
