import { normalizeMinisite, slugify } from './minisite';
import {
  mergeSubscriptionPlans,
  getPlanMonthlyPriceFromPlans,
  getPlanPriceFromPlans,
  getAnnualSavingsFromPlans,
  ANNUAL_PAID_MONTHS,
  normalizeBillingCycle,
  BILLING_CYCLE_MONTHLY,
  BILLING_CYCLE_ANNUAL,
} from './planConfig';

export {
  ANNUAL_PAID_MONTHS,
  BILLING_CYCLE_MONTHLY,
  BILLING_CYCLE_ANNUAL,
  normalizeBillingCycle,
  formatBillingCycleLabel,
} from './planConfig';

const KEYS = {
  BANNER_DISMISSED: 'glist_banner_dismissed',
  PROTOTYPE_ACK: 'glist_prototype_acknowledged',
  USER_TYPE: 'glist_user_type',
  PRO_ACCOUNT: 'glist_pro_account',
  PRO_ACCOUNTS: 'glist_pro_accounts',
  PRO_REVIEWS: 'glist_pro_reviews',
  FEEDBACK_VOTED: 'glist_feedback_voted',
  FEEDBACK_THUMBS_UP: 'glist_feedback_thumbs_up',
  FEEDBACK_THUMBS_DOWN: 'glist_feedback_thumbs_down',
  SUGGESTIONS: 'glist_suggestions',
  ENGAGEMENT_ANSWERED: 'glist_engagement_answered',
  ENGAGEMENT_FOUND: 'glist_engagement_found',
  ENGAGEMENT_SEARCHING: 'glist_engagement_searching',
  ENGAGEMENT_TESTING: 'glist_engagement_testing',
  WAITLIST: 'glist_waitlist',
  PROFILE_REVIEWS: 'glist_profile_reviews',
  VISITOR_ACCOUNT: 'glist_visitor_account',
  VISITOR_ACCOUNTS: 'glist_visitor_accounts',
  FAVORITES: 'glist_favorites',
  VIEW_HISTORY: 'glist_view_history',
  SEARCH_HISTORY: 'glist_search_history',
  PRO_STATS: 'glist_pro_stats',
  REVIEW_RESPONSES: 'glist_review_responses',
  QUOTE_REQUESTS: 'glist_quote_requests',
  CRM_PROSPECTS: 'glist_crm_prospects',
  MINISITE: 'glist_minisite',
  MINISITE_ANALYTICS: 'glist_minisite_analytics',
  MINISITE_FORMS: 'glist_minisite_forms',
  PRO_SERVICES: 'glist_pro_services',
  PRO_PHOTOS: 'glist_pro_photos',
  VISITOR_SETTINGS: 'glist_visitor_settings',
  ADMIN_OVERRIDES: 'glist_admin_overrides',
  PRO_PLAN: 'glist_pro_plan',
  DARK_MODE: 'glist_dark_mode',
  COOKIE_CONSENT: 'glist_cookie_consent',
  REPORTS: 'glist_reports',
  CONTACT_MESSAGES: 'glist_contact_messages',
  PASSWORD_RESET_TOKENS: 'glist_password_reset_tokens',
  EMAIL_VERIFICATION_TOKENS: 'glist_email_verification_tokens',
  SUBSCRIPTION_PLANS: 'glist_subscription_plans',
  PRO_ALERT_SETTINGS: 'glist_pro_alert_settings',
  ADMIN_BROADCASTS: 'glist_admin_broadcasts',
  BROADCAST_DISMISSED: 'glist_broadcast_dismissed',
  AUDIT_LOG: 'glist_audit_log',
  ACTIVITY_HISTORY: 'glist_activity_history',
  BILLING_HISTORY: 'glist_billing_history',
  NOTIFICATION_READ: 'glist_notification_read',
  SYSTEM_NOTIFICATIONS: 'glist_system_notifications',
  SECURITY_SESSIONS: 'glist_security_sessions',
};

export const PREMIUM_PRICE_GNF = 120000;
export const ADVANCED_PRICE_GNF = 50000;

export function getItem(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function stripPassword(entry) {
  const rest = { ...entry };
  delete rest.password;
  return rest;
}

export function isPrototypeAcknowledged() {
  return localStorage.getItem(KEYS.PROTOTYPE_ACK) === 'true';
}

export function acknowledgePrototype() {
  localStorage.setItem(KEYS.PROTOTYPE_ACK, 'true');
}

export function isBannerDismissed() {
  return isPrototypeAcknowledged();
}

export function dismissBanner() {
  acknowledgePrototype();
}

export function setUserType(type) {
  localStorage.setItem(KEYS.USER_TYPE, type);
}

export function getUserType() {
  return localStorage.getItem(KEYS.USER_TYPE);
}

export function getProAccount() {
  migrateLegacyAccount();
  return getItem(KEYS.PRO_ACCOUNT, null);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getAllProAccountsRegistry() {
  return getItem(KEYS.PRO_ACCOUNTS, {});
}

function saveAllProAccountsRegistry(registry) {
  setItem(KEYS.PRO_ACCOUNTS, registry);
}

function migrateLegacyAccount() {
  const session = getItem(KEYS.PRO_ACCOUNT, null);
  if (!session?.email) return;
  const registry = getAllProAccountsRegistry();
  const email = normalizeEmail(session.email);
  if (!registry[email]) {
    registry[email] = {
      ...session,
      password: session.password || 'glist2026',
    };
    saveAllProAccountsRegistry(registry);
  }
}

export function saveProAccount(account) {
  setItem(KEYS.PRO_ACCOUNT, account);
  if (account?.email) {
    const registry = getAllProAccountsRegistry();
    const email = normalizeEmail(account.email);
    if (registry[email]) {
      registry[email] = { ...registry[email], ...account, password: registry[email].password };
      saveAllProAccountsRegistry(registry);
    }
  }
}

export function loginProAccount(email, password) {
  migrateLegacyAccount();
  const registry = getAllProAccountsRegistry();
  const acc = registry[normalizeEmail(email)];
  if (!acc || acc.password !== password) return null;
  const { password: _pw, ...session } = acc;
  saveProAccount(session);
  setUserType('pro');
  import('./platformEvents.js').then((m) => m.onProLogin(session.id)).catch(() => {});
  return session;
}

export function recoverProPassword(email) {
  migrateLegacyAccount();
  const registry = getAllProAccountsRegistry();
  const acc = registry[normalizeEmail(email)];
  return acc?.password || null;
}

export function logoutProAccount() {
  localStorage.removeItem(KEYS.PRO_ACCOUNT);
  localStorage.removeItem(KEYS.USER_TYPE);
}

function removeProIdFromStore(key, proId) {
  const all = getItem(key, {});
  const id = String(proId);
  if (all[id] !== undefined || all[proId] !== undefined) {
    delete all[id];
    delete all[proId];
    setItem(key, all);
  }
}

function removeReviewResponsesForPro(proId) {
  const all = getItem(KEYS.REVIEW_RESPONSES, {});
  const prefix = `${proId}-`;
  const next = Object.fromEntries(Object.entries(all).filter(([k]) => !k.startsWith(prefix)));
  setItem(KEYS.REVIEW_RESPONSES, next);
}

/** Supprime définitivement un compte pro et toutes ses données locales. */
export function deleteProAccount(email, password) {
  migrateLegacyAccount();
  const registry = getAllProAccountsRegistry();
  const normalized = normalizeEmail(email);
  const acc = registry[normalized];

  if (!acc) return { ok: false, error: 'NOT_FOUND' };
  if (acc.password !== password) return { ok: false, error: 'PASSWORD_INVALID' };

  const proId = acc.id;
  delete registry[normalized];
  saveAllProAccountsRegistry(registry);

  removeProIdFromStore(KEYS.PRO_REVIEWS, proId);
  localStorage.removeItem(KEYS.PROFILE_REVIEWS);
  removeProIdFromStore(KEYS.PRO_STATS, proId);
  removeProIdFromStore(KEYS.QUOTE_REQUESTS, proId);
  removeProIdFromStore(KEYS.CRM_PROSPECTS, proId);
  removeProIdFromStore(KEYS.MINISITE, proId);
  removeProIdFromStore(KEYS.PRO_SERVICES, proId);
  removeProIdFromStore(KEYS.PRO_PHOTOS, proId);
  removeProIdFromStore(KEYS.ADMIN_OVERRIDES, proId);
  removeProIdFromStore(KEYS.PRO_PLAN, proId);
  removeReviewResponsesForPro(proId);

  const session = getProAccount();
  if (session?.email && normalizeEmail(session.email) === normalized) {
    logoutProAccount();
  }

  import('./platformEvents.js').then((m) => m.onProDelete(proId, email)).catch(() => {});
  return { ok: true };
}

export function isEmailRegistered(email) {
  migrateLegacyAccount();
  return !!getAllProAccountsRegistry()[normalizeEmail(email)];
}

const DEFAULT_SOCIAL = { facebook: '', instagram: '', tiktok: '', linkedin: '', portfolio: '', website: '' };

const DEMO_REVIEWS = [
  { id: 1, prenom: 'Mariam', note: 5, commentaire: 'Service impeccable, très professionnel. Je recommande !', date: '2026-04-10' },
  { id: 2, prenom: 'Ousmane', note: 4, commentaire: 'Bon travail, ponctuel et à l\'écoute du client.', date: '2026-03-22' },
  { id: 3, prenom: 'Aminata', note: 5, commentaire: 'Excellent rapport qualité-prix. Très satisfaite.', date: '2026-02-15' },
];

export function createProAccount(data) {
  const email = normalizeEmail(data.email || '');
  if (!email) throw new Error('EMAIL_REQUIRED');
  if (!data.password) throw new Error('PASSWORD_REQUIRED');
  if (data.password.length < 6) throw new Error('PASSWORD_TOO_SHORT');

  const registry = getAllProAccountsRegistry();
  if (registry[email]) throw new Error('EMAIL_EXISTS');

  const id = Date.now();
  const account = {
    id,
    nom: data.nom,
    profession: data.profession,
    categorie: data.categorie || '',
    region: data.region,
    quartier: data.quartier || 'Centre',
    telephone: data.telephone,
    whatsapp: data.whatsapp || data.telephone,
    email,
    description: data.description || '',
    slogan: '',
    horaires: 'Lun-Sam 8h-18h',
    specialites: [],
    services: [],
    social: { ...DEFAULT_SOCIAL },
    profileViews: Math.floor(Math.random() * 40) + 12,
    premium: false,
    plan: 'free',
    premiumSince: null,
    premiumExpires: null,
    verifie: false,
    createdAt: new Date().toISOString(),
  };

  registry[email] = { ...account, password: data.password };
  saveAllProAccountsRegistry(registry);

  saveProAccount(account);
  setProReviews(id, DEMO_REVIEWS);
  setUserType('pro');
  return account;
}

let reviewsMerged = false;

/** Fusionne l'ancien store `glist_profile_reviews` dans `glist_pro_reviews` (une fois). */
function migrateProfileReviews() {
  if (reviewsMerged) return;
  reviewsMerged = true;

  const legacy = getItem(KEYS.PROFILE_REVIEWS, {});
  if (!Object.keys(legacy).length) {
    localStorage.removeItem(KEYS.PROFILE_REVIEWS);
    return;
  }

  const unified = getItem(KEYS.PRO_REVIEWS, {});

  for (const [proId, legacyReviews] of Object.entries(legacy)) {
    const key = String(proId);
    const existing = unified[key] || [];
    const existingIds = new Set(existing.map((r) => r.id).filter(Boolean));
    const isDuplicate = (review) =>
      existing.some(
        (r) =>
          r.prenom === review.prenom
          && r.commentaire === review.commentaire
          && r.note === review.note
          && (r.date === review.date || r.timestamp === review.timestamp),
      );

    const incoming = legacyReviews.filter(
      (r) => !(r.id && existingIds.has(r.id)) && !isDuplicate(r),
    );
    unified[key] = [...incoming, ...existing];
  }

  setItem(KEYS.PRO_REVIEWS, unified);
  localStorage.removeItem(KEYS.PROFILE_REVIEWS);
}

function reviewStoreKey(proId) {
  return String(proId);
}

export function getProReviews(proId) {
  migrateProfileReviews();
  const all = getItem(KEYS.PRO_REVIEWS, {});
  const key = reviewStoreKey(proId);
  return all[key] || [];
}

export function setProReviews(proId, reviews) {
  migrateProfileReviews();
  const all = getItem(KEYS.PRO_REVIEWS, {});
  all[reviewStoreKey(proId)] = reviews;
  setItem(KEYS.PRO_REVIEWS, all);
}

export function addProReview(proId, review) {
  migrateProfileReviews();
  const key = reviewStoreKey(proId);
  const all = getItem(KEYS.PRO_REVIEWS, {});
  const entry = {
    ...review,
    id: review.id || Date.now(),
    date: review.date || new Date().toISOString().split('T')[0],
    timestamp: review.timestamp || new Date().toISOString(),
  };
  if (!all[key]) all[key] = [];
  all[key].unshift(entry);
  setItem(KEYS.PRO_REVIEWS, all);
  return entry;
}

export function incrementProProfileViews() {
  const account = getProAccount();
  if (!account) return;
  const updated = { ...account, profileViews: (account.profileViews || 0) + 1 };
  saveProAccount(updated);
  return updated;
}

export function getProAverageRating(proId) {
  const reviews = getProReviews(proId);
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.note, 0) / reviews.length;
}

export function subscribePremium() {
  const account = getProAccount();
  if (!account) return null;
  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + 1);
  const updated = {
    ...account,
    premium: true,
    premiumSince: now.toISOString(),
    premiumExpires: expires.toISOString(),
    premiumCancelledAt: null,
  };
  saveProAccount(updated);
  return updated;
}

export function unsubscribePremium() {
  const account = getProAccount();
  if (!account?.premium) return null;
  const updated = {
    ...account,
    premium: false,
    premiumSince: null,
    premiumExpires: null,
    premiumCancelledAt: new Date().toISOString(),
    plan: 'free',
  };
  saveProAccount(updated);
  import('./platformEvents.js').then((m) => m.onProCancel(account.id, account.plan || 'premium')).catch(() => {});
  return updated;
}

export function isPremiumActive(account) {
  if (!account?.premium) return false;
  if (!account.premiumExpires) return true;
  return new Date(account.premiumExpires) > new Date();
}

export function hasFeedbackVoted() {
  return localStorage.getItem(KEYS.FEEDBACK_VOTED) === 'true';
}

export function recordFeedbackVote(positive) {
  const key = positive ? KEYS.FEEDBACK_THUMBS_UP : KEYS.FEEDBACK_THUMBS_DOWN;
  const current = getItem(key, 0);
  setItem(key, current + 1);
  localStorage.setItem(KEYS.FEEDBACK_VOTED, 'true');
}

export function addSuggestion(text) {
  const suggestions = getItem(KEYS.SUGGESTIONS, []);
  suggestions.push({ text, timestamp: new Date().toISOString() });
  setItem(KEYS.SUGGESTIONS, suggestions);
}

export function hasEngagementAnswered() {
  return localStorage.getItem(KEYS.ENGAGEMENT_ANSWERED) === 'true';
}

export function recordEngagement(answer) {
  const map = {
    found: KEYS.ENGAGEMENT_FOUND,
    searching: KEYS.ENGAGEMENT_SEARCHING,
    testing: KEYS.ENGAGEMENT_TESTING,
  };
  const key = map[answer];
  if (key) {
    setItem(key, getItem(key, 0) + 1);
    localStorage.setItem(KEYS.ENGAGEMENT_ANSWERED, 'true');
  }
}

export function addWaitlistEntry(entry) {
  const list = getItem(KEYS.WAITLIST, []);
  list.push({ ...entry, timestamp: new Date().toISOString() });
  setItem(KEYS.WAITLIST, list);
}

/** @deprecated Utiliser getProReviews — alias conservé pour compatibilité */
export function getProfileReviews(proId) {
  return getProReviews(proId);
}

/** @deprecated Utiliser addProReview — alias conservé pour compatibilité */
export function addProfileReview(proId, review) {
  return addProReview(proId, review);
}

export function getTotalProfileReviews() {
  migrateProfileReviews();
  const all = getItem(KEYS.PRO_REVIEWS, {});
  return Object.values(all).reduce((sum, reviews) => sum + reviews.length, 0);
}

export function hasVisited() {
  return localStorage.getItem('visited') === '1';
}

export function markVisited() {
  localStorage.setItem('visited', '1');
  acknowledgePrototype();
}

export function getEvaluations() {
  try {
    const raw = localStorage.getItem('evaluations');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addEvaluation(entry) {
  const list = getEvaluations();
  list.push(entry);
  localStorage.setItem('evaluations', JSON.stringify(list));
}

function sanitizeProRegistry(registry) {
  return Object.fromEntries(
    Object.entries(registry).map(([email, acc]) => [email, stripPassword(acc)]),
  );
}

export function exportAllData() {
  migrateProfileReviews();
  const session = getProAccount();
  return {
    prototypeAcknowledged: isPrototypeAcknowledged(),
    userType: getUserType(),
    proAccount: session ? stripPassword(session) : null,
    proAccounts: sanitizeProRegistry(getAllProAccountsRegistry()),
    feedbackVoted: hasFeedbackVoted(),
    thumbsUp: getItem(KEYS.FEEDBACK_THUMBS_UP, 0),
    thumbsDown: getItem(KEYS.FEEDBACK_THUMBS_DOWN, 0),
    suggestions: getItem(KEYS.SUGGESTIONS, []),
    engagementAnswered: hasEngagementAnswered(),
    engagementFound: getItem(KEYS.ENGAGEMENT_FOUND, 0),
    engagementSearching: getItem(KEYS.ENGAGEMENT_SEARCHING, 0),
    engagementTesting: getItem(KEYS.ENGAGEMENT_TESTING, 0),
    waitlist: getItem(KEYS.WAITLIST, []),
    proReviews: getItem(KEYS.PRO_REVIEWS, {}),
    adminBroadcasts: getItem(KEYS.ADMIN_BROADCASTS, []),
    visited: hasVisited(),
    evaluations: getEvaluations(),
    exportedAt: new Date().toISOString(),
  };
}

export function resetAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem('visited');
  localStorage.removeItem('evaluations');
}

// ── Visitor accounts ──

export function getVisitorAccount() {
  return getItem(KEYS.VISITOR_ACCOUNT, null);
}

function getVisitorRegistry() {
  return getItem(KEYS.VISITOR_ACCOUNTS, {});
}

function saveVisitorRegistry(registry) {
  setItem(KEYS.VISITOR_ACCOUNTS, registry);
}

export function createVisitorAccount(data) {
  const email = normalizeEmail(data.email || '');
  if (!email) throw new Error('EMAIL_REQUIRED');
  if (!data.password || data.password.length < 6) throw new Error('PASSWORD_TOO_SHORT');
  const registry = getVisitorRegistry();
  if (registry[email]) throw new Error('EMAIL_EXISTS');
  const account = {
    id: Date.now(),
    prenom: data.prenom,
    nom: data.nom,
    email,
    createdAt: new Date().toISOString(),
  };
  registry[email] = { ...account, password: data.password };
  saveVisitorRegistry(registry);
  setItem(KEYS.VISITOR_ACCOUNT, account);
  setUserType('visiteur');
  import('./platformEvents.js').then((m) => m.onVisitorRegister(email)).catch(() => {});
  return account;
}

export function loginVisitorAccount(email, password) {
  const registry = getVisitorRegistry();
  const acc = registry[normalizeEmail(email)];
  if (!acc || acc.password !== password) return null;
  const { password: _pw, ...session } = acc;
  setItem(KEYS.VISITOR_ACCOUNT, session);
  setUserType('visiteur');
  import('./platformEvents.js').then((m) => m.onVisitorLogin(session.email)).catch(() => {});
  return session;
}

export function logoutVisitorAccount() {
  localStorage.removeItem(KEYS.VISITOR_ACCOUNT);
  if (getUserType() === 'visiteur') localStorage.removeItem(KEYS.USER_TYPE);
}

export function getAllVisitorAccounts() {
  return Object.values(getVisitorRegistry()).map(stripPassword);
}

// ── Favorites ──

export function getFavorites() {
  return getItem(KEYS.FAVORITES, []);
}

export function isFavorite(proId) {
  return getFavorites().includes(Number(proId));
}

export function toggleFavorite(proId) {
  const id = Number(proId);
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  setItem(KEYS.FAVORITES, next);
  const stats = getProStats(id);
  setProStats(id, { ...stats, favorites: next.filter((f) => f === id).length ? stats.favorites : Math.max(0, (stats.favorites || 0) - 1) });
  if (!favs.includes(id)) {
    const s = getProStats(id);
    setProStats(id, { ...s, favorites: (s.favorites || 0) + 1 });
  }
  return next.includes(id);
}

// ── View history ──

export function addViewHistory(entry) {
  const history = getItem(KEYS.VIEW_HISTORY, []);
  const filtered = history.filter((h) => h.id !== entry.id);
  filtered.unshift({ ...entry, viewedAt: new Date().toISOString() });
  setItem(KEYS.VIEW_HISTORY, filtered.slice(0, 50));
}

export function getViewHistory() {
  return getItem(KEYS.VIEW_HISTORY, []);
}

// ── Search history ──

export function addSearchHistory(query) {
  if (!query?.trim()) return;
  const history = getItem(KEYS.SEARCH_HISTORY, []);
  const filtered = history.filter((q) => q !== query);
  filtered.unshift(query);
  setItem(KEYS.SEARCH_HISTORY, filtered.slice(0, 20));
}

export function getSearchHistory() {
  return getItem(KEYS.SEARCH_HISTORY, []);
}

export function clearSearchHistory() {
  setItem(KEYS.SEARCH_HISTORY, []);
}

// ── Pro stats ──

export function getProStats(proId) {
  const all = getItem(KEYS.PRO_STATS, {});
  return all[proId] || {};
}

export function setProStats(proId, stats) {
  const all = getItem(KEYS.PRO_STATS, {});
  all[proId] = stats;
  setItem(KEYS.PRO_STATS, all);
}

export function incrementProView(proId) {
  const stats = getProStats(proId);
  setProStats(proId, { ...stats, views: (stats.views || 0) + 1 });
}

export function incrementWhatsAppClick(proId) {
  const stats = getProStats(proId);
  setProStats(proId, { ...stats, whatsappClicks: (stats.whatsappClicks || 0) + 1 });
}

// ── Review responses ──

export function getReviewResponse(proId, reviewId) {
  const all = getItem(KEYS.REVIEW_RESPONSES, {});
  return all[`${proId}-${reviewId}`] || null;
}

export function setReviewResponse(proId, reviewId, response) {
  const all = getItem(KEYS.REVIEW_RESPONSES, {});
  all[`${proId}-${reviewId}`] = { text: response, date: new Date().toISOString() };
  setItem(KEYS.REVIEW_RESPONSES, all);
}

// ── Quote requests ──

export function addQuoteRequest(proId, request) {
  const all = getItem(KEYS.QUOTE_REQUESTS, {});
  if (!all[proId]) all[proId] = [];
  const entry = { ...request, id: Date.now(), status: 'pending', date: new Date().toISOString() };
  all[proId].unshift(entry);
  setItem(KEYS.QUOTE_REQUESTS, all);
  addCrmProspect(proId, entry);
  return entry;
}

export function getQuoteRequests(proId) {
  const all = getItem(KEYS.QUOTE_REQUESTS, {});
  return all[proId] || [];
}

export function getVisitorQuoteRequests() {
  const all = getItem(KEYS.QUOTE_REQUESTS, {});
  const visitor = getVisitorAccount();
  if (!visitor) return [];
  const results = [];
  Object.entries(all).forEach(([proId, requests]) => {
    requests.forEach((r) => {
      if (r.visitorEmail === visitor.email) {
        results.push({ ...r, proId: Number(proId) });
      }
    });
  });
  return results.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function updateQuoteStatus(proId, requestId, status) {
  const all = getItem(KEYS.QUOTE_REQUESTS, {});
  if (!all[proId]) return;
  all[proId] = all[proId].map((r) => (r.id === requestId ? { ...r, status } : r));
  setItem(KEYS.QUOTE_REQUESTS, all);
}

// ── CRM Prospects ──

const DEFAULT_CRM = [
  { id: 1, prenom: 'Fatoumata', service: 'Consultation', date: '2026-05-28', note: 'Intéressée', column: 'nouveau' },
  { id: 2, prenom: 'Mamadou', service: 'Dépannage', date: '2026-05-25', note: 'Urgent', column: 'nouveau' },
  { id: 3, prenom: 'Aissatou', service: 'Installation', date: '2026-05-20', note: 'Budget confirmé', column: 'contacte' },
  { id: 4, prenom: 'Ibrahima', service: 'Rénovation', date: '2026-05-15', note: 'Rappeler lundi', column: 'contacte' },
  { id: 5, prenom: 'Mariama', service: 'Devis complet', date: '2026-05-10', note: 'Converti', column: 'converti' },
];

export function getCrmProspects(proId) {
  const all = getItem(KEYS.CRM_PROSPECTS, {});
  if (!all[proId]) {
    all[proId] = DEFAULT_CRM.map((p) => ({ ...p }));
    setItem(KEYS.CRM_PROSPECTS, all);
  }
  return all[proId];
}

export function addCrmProspect(proId, entry) {
  const all = getItem(KEYS.CRM_PROSPECTS, {});
  if (!all[proId]) all[proId] = [...DEFAULT_CRM];
  all[proId].unshift({
    id: Date.now(),
    prenom: entry.nom || entry.prenom || 'Visiteur',
    service: entry.service || 'Demande de devis',
    date: new Date().toISOString().split('T')[0],
    note: entry.message?.slice(0, 50) || '',
    column: 'nouveau',
  });
  setItem(KEYS.CRM_PROSPECTS, all);
}

export function moveCrmProspect(proId, prospectId, column) {
  const all = getItem(KEYS.CRM_PROSPECTS, {});
  if (!all[proId]) return;
  all[proId] = all[proId].map((p) => (p.id === prospectId ? { ...p, column } : p));
  setItem(KEYS.CRM_PROSPECTS, all);
}

// ── Mini-site ──

export function getMinisite(proId, account = null) {
  const all = getItem(KEYS.MINISITE, {});
  const raw = all[proId];
  const acc = account || getAllProAccountsList().find((a) => a.id === proId) || null;
  return normalizeMinisite(raw, acc);
}

export function saveMinisite(proId, settings, account = null) {
  const all = getItem(KEYS.MINISITE, {});
  const current = getMinisite(proId, account);
  all[proId] = { ...current, ...settings };
  setItem(KEYS.MINISITE, all);
}

export function getMinisiteSlugForPro(proId, account = null) {
  const site = getMinisite(proId, account);
  if (!site?.published || !site.slug) return null;
  return site.slug;
}

export function isSlugAvailable(slug, excludeProId = null) {
  const normalized = slugify(slug);
  const all = getItem(KEYS.MINISITE, {});
  return !Object.entries(all).some(([id, data]) => {
    if (excludeProId && id === excludeProId) return false;
    const s = normalizeMinisite(data, null);
    return s?.slug === normalized;
  });
}

export function getMinisiteAnalytics(proId) {
  const all = getItem(KEYS.MINISITE_ANALYTICS, {});
  const id = String(proId);
  return all[id] || { views: 0, uniqueViews: 0, formSubmits: 0, newsletterSignups: 0, lastView: null };
}

export function incrementMinisiteView(proId) {
  const all = getItem(KEYS.MINISITE_ANALYTICS, {});
  const id = String(proId);
  const cur = all[id] || { views: 0, uniqueViews: 0, formSubmits: 0, newsletterSignups: 0 };
  const sessionKey = `ms_view_${id}`;
  const isNewSession = !sessionStorage.getItem(sessionKey);
  if (isNewSession) sessionStorage.setItem(sessionKey, '1');
  all[id] = {
    ...cur,
    views: (cur.views || 0) + 1,
    uniqueViews: (cur.uniqueViews || 0) + (isNewSession ? 1 : 0),
    lastView: new Date().toISOString(),
  };
  setItem(KEYS.MINISITE_ANALYTICS, all);
  return all[id];
}

export function addMinisiteFormSubmission(proId, payload) {
  const all = getItem(KEYS.MINISITE_FORMS, {});
  const id = String(proId);
  if (!all[id]) all[id] = [];
  const entry = { ...payload, id: Date.now(), date: new Date().toISOString() };
  all[id].unshift(entry);
  setItem(KEYS.MINISITE_FORMS, all);

  const analytics = getItem(KEYS.MINISITE_ANALYTICS, {});
  const cur = analytics[id] || { views: 0, formSubmits: 0, newsletterSignups: 0 };
  analytics[id] = { ...cur, formSubmits: (cur.formSubmits || 0) + 1 };
  setItem(KEYS.MINISITE_ANALYTICS, analytics);
  return entry;
}

export function addMinisiteNewsletterSignup(proId, email) {
  const entry = addMinisiteFormSubmission(proId, { type: 'newsletter', email });
  const analytics = getItem(KEYS.MINISITE_ANALYTICS, {});
  const id = String(proId);
  const cur = analytics[id] || {};
  analytics[id] = { ...cur, newsletterSignups: (cur.newsletterSignups || 0) + 1 };
  setItem(KEYS.MINISITE_ANALYTICS, analytics);
  return entry;
}

export function getMinisiteFormSubmissions(proId) {
  const all = getItem(KEYS.MINISITE_FORMS, {});
  return all[String(proId)] || [];
}

// ── Pro services & photos (dashboard) ──

export function getProServices(proId) {
  const all = getItem(KEYS.PRO_SERVICES, {});
  return all[proId] || [];
}

export function saveProServices(proId, services) {
  const all = getItem(KEYS.PRO_SERVICES, {});
  all[proId] = services;
  setItem(KEYS.PRO_SERVICES, all);
}

export function getProPhotos(proId) {
  const all = getItem(KEYS.PRO_PHOTOS, {});
  return all[proId] || [];
}

export function saveProPhotos(proId, photos) {
  const all = getItem(KEYS.PRO_PHOTOS, {});
  all[proId] = photos;
  setItem(KEYS.PRO_PHOTOS, all);
}

// ── Pro plan ──

export function getProPlanLevel(account) {
  if (!account) return 'free';
  if (account.plan) return account.plan;
  if (account.premium && isPremiumActive(account)) return 'premium';
  return 'free';
}

export function upgradePlan(plan, options = {}) {
  const { billingCycle = BILLING_CYCLE_MONTHLY } = options;
  const cycle = normalizeBillingCycle(billingCycle);
  const account = getProAccount();
  if (!account) return null;
  const durationDays = cycle === BILLING_CYCLE_ANNUAL ? 365 : 30;
  const updated = {
    ...account,
    plan,
    premium: plan === 'premium',
    billingCycle: plan === 'free' ? null : cycle,
    premiumSince: plan !== 'free' ? new Date().toISOString() : null,
    premiumExpires: plan !== 'free'
      ? new Date(Date.now() + durationDays * 86400000).toISOString()
      : null,
  };
  saveProAccount(updated);
  if (plan !== 'free') {
    import('./platformEvents.js').then((m) => m.onProUpgrade(updated.id, plan, cycle)).catch(() => {});
  }
  return updated;
}

export const ALERT_EVENT_TYPES = [
  {
    id: 'new_review',
    label: 'Nouvel avis client',
    description: 'Quand un visiteur laisse un avis sur votre fiche',
    minPlan: 'advanced',
  },
  {
    id: 'unanswered_reviews',
    label: 'Avis sans réponse',
    description: 'Rappel lorsque des avis attendent votre réponse',
    minPlan: 'advanced',
  },
  {
    id: 'low_visibility',
    label: 'Visibilité faible',
    description: 'Votre profil reçoit peu de vues — action recommandée',
    minPlan: 'advanced',
  },
  {
    id: 'ranking_drop',
    label: 'Position dans le classement',
    description: 'Vous perdez des places face à vos concurrents',
    minPlan: 'advanced',
  },
  {
    id: 'high_demand_region',
    label: 'Forte demande locale',
    description: 'Pic de recherches détecté dans votre ville',
    minPlan: 'advanced',
  },
  {
    id: 'new_crm_prospect',
    label: 'Nouveau prospect CRM',
    description: 'Un lead entre dans votre pipeline (Premium)',
    minPlan: 'premium',
  },
];

const DEFAULT_ALERT_SETTINGS = Object.fromEntries(
  ALERT_EVENT_TYPES.map((e) => [e.id, true]),
);

export function getProAlertSettings(proId) {
  const all = getItem(KEYS.PRO_ALERT_SETTINGS, {});
  return { ...DEFAULT_ALERT_SETTINGS, ...(all[proId] || {}) };
}

export function saveProAlertSettings(proId, settings) {
  const all = getItem(KEYS.PRO_ALERT_SETTINGS, {});
  all[proId] = { ...getProAlertSettings(proId), ...settings };
  setItem(KEYS.PRO_ALERT_SETTINGS, all);
  return all[proId];
}

export function toggleProAlert(proId, eventId, enabled) {
  return saveProAlertSettings(proId, { [eventId]: enabled });
}

export function getSubscriptionPlans() {
  return mergeSubscriptionPlans(getItem(KEYS.SUBSCRIPTION_PLANS, null));
}

export function saveSubscriptionPlans(partial) {
  const current = getSubscriptionPlans();
  const next = {
    advanced: { ...current.advanced, ...(partial.advanced || {}) },
    premium: { ...current.premium, ...(partial.premium || {}) },
  };
  setItem(KEYS.SUBSCRIPTION_PLANS, next);
  return getSubscriptionPlans();
}

export function getPlanMonthlyPrice(planId) {
  return getPlanMonthlyPriceFromPlans(getSubscriptionPlans(), planId);
}

export function getPlanPrice(planId, billingCycle = BILLING_CYCLE_MONTHLY) {
  return getPlanPriceFromPlans(getSubscriptionPlans(), planId, billingCycle);
}

export function getAnnualSavings(planId) {
  return getAnnualSavingsFromPlans(getSubscriptionPlans(), planId);
}

// ── Visitor settings ──

export function getVisitorSettings() {
  return getItem(KEYS.VISITOR_SETTINGS, { darkMode: false, notifications: true, langue: 'fr' });
}

export function saveVisitorSettings(settings) {
  setItem(KEYS.VISITOR_SETTINGS, { ...getVisitorSettings(), ...settings });
}

export function isDarkMode() {
  return localStorage.getItem(KEYS.DARK_MODE) === 'true';
}

export function setDarkMode(enabled) {
  localStorage.setItem(KEYS.DARK_MODE, enabled ? 'true' : 'false');
  document.documentElement.classList.toggle('dark-mode', enabled);
}

// ── Admin overrides ──

export function getAdminOverrides() {
  return getItem(KEYS.ADMIN_OVERRIDES, {});
}

export function setAdminOverride(proId, overrides) {
  const all = getAdminOverrides();
  all[proId] = { ...(all[proId] || {}), ...overrides, updatedAt: new Date().toISOString() };
  setItem(KEYS.ADMIN_OVERRIDES, all);
}

export function adminVerifyProfessional(proId) {
  setAdminOverride(proId, { verifie: true, disabled: false, hidden: false });
}

export function adminDisableProfessional(proId) {
  setAdminOverride(proId, { disabled: true, verifie: false });
}

export function adminFlagDuplicate(proId) {
  setAdminOverride(proId, { flaggedDuplicate: true });
}

export function adminHideProfessional(proId) {
  setAdminOverride(proId, { hidden: true, disabled: true });
}

export function adminMergeDuplicate(keepId, removeId) {
  setAdminOverride(removeId, { hidden: true, mergedInto: keepId });
  setAdminOverride(keepId, { verifie: true, flaggedDuplicate: false });
}

function updateProAccountById(proId, patch) {
  const registry = getAllProAccountsRegistry();
  let updated = false;
  Object.entries(registry).forEach(([email, acc]) => {
    if (acc.id === proId) {
      registry[email] = { ...acc, ...patch };
      updated = true;
    }
  });
  if (updated) saveAllProAccountsRegistry(registry);

  const session = getProAccount();
  if (session?.id === proId) {
    saveProAccount({ ...session, ...patch });
  }
  return updated;
}

export function getAdminPlanOverrides() {
  return getItem(KEYS.PRO_PLAN, {});
}

export function getAdminPlanForPro(proId) {
  const entry = getAdminPlanOverrides()[proId] ?? getAdminPlanOverrides()[String(proId)];
  return entry?.plan || null;
}

export function adminSetProfessionalPlan(proId, plan) {
  const valid = ['free', 'advanced', 'premium'];
  if (!valid.includes(plan)) return false;

  const all = getAdminPlanOverrides();
  const id = Number(proId);
  if (plan === 'free') {
    delete all[id];
    delete all[String(id)];
  } else {
    all[id] = {
      plan,
      assignedAt: new Date().toISOString(),
      premiumExpires: new Date(Date.now() + 365 * 86400000).toISOString(),
    };
  }
  setItem(KEYS.PRO_PLAN, all);

  updateProAccountById(id, {
    plan,
    premium: plan === 'premium',
    billingCycle: plan === 'free' ? null : 'annual',
    premiumSince: plan !== 'free' ? new Date().toISOString() : null,
    premiumExpires: plan !== 'free' ? new Date(Date.now() + 365 * 86400000).toISOString() : null,
  });

  return true;
}

export function updateReportStatus(id, status) {
  const list = getReports().map((r) => (r.id === id ? { ...r, status } : r));
  setItem(KEYS.REPORTS, list);
  return list;
}

export function getWaitlistEntries() {
  return getItem(KEYS.WAITLIST, []);
}

export function getContactMessages() {
  return getItem(KEYS.CONTACT_MESSAGES, []);
}

export function getAllProAccountsList() {
  migrateLegacyAccount();
  return Object.values(getAllProAccountsRegistry()).map(stripPassword);
}

// ── Cookies ──

export function hasCookieConsent() {
  return Boolean(localStorage.getItem(KEYS.COOKIE_CONSENT));
}

export function getCookieConsent() {
  return localStorage.getItem(KEYS.COOKIE_CONSENT) || null;
}

export function setCookieConsent(level) {
  localStorage.setItem(KEYS.COOKIE_CONSENT, level);
}

// ── Reports ──

export function addReport(report) {
  const list = getItem(KEYS.REPORTS, []);
  const entry = { ...report, id: Date.now(), date: new Date().toISOString(), status: 'pending' };
  list.unshift(entry);
  setItem(KEYS.REPORTS, list);
  return entry;
}

export function getReports() {
  return getItem(KEYS.REPORTS, []);
}

// ── Contact ──

export function addContactMessage(msg) {
  const list = getItem(KEYS.CONTACT_MESSAGES, []);
  const entry = { ...msg, id: Date.now(), date: new Date().toISOString() };
  list.unshift(entry);
  setItem(KEYS.CONTACT_MESSAGES, list);
  return entry;
}

// ── Password reset (local stub until email backend) ──

export function createPasswordResetToken(email, userType) {
  const tokens = getItem(KEYS.PASSWORD_RESET_TOKENS, {});
  const token = `rst_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  tokens[token] = { email: email.trim().toLowerCase(), userType, expires: Date.now() + 3600000 };
  setItem(KEYS.PASSWORD_RESET_TOKENS, tokens);
  return token;
}

export function consumePasswordResetToken(token) {
  const tokens = getItem(KEYS.PASSWORD_RESET_TOKENS, {});
  const entry = tokens[token];
  if (!entry || entry.expires < Date.now()) return null;
  delete tokens[token];
  setItem(KEYS.PASSWORD_RESET_TOKENS, tokens);
  return entry;
}

export function resetPasswordByToken(token, newPassword) {
  const entry = consumePasswordResetToken(token);
  if (!entry || !newPassword || newPassword.length < 6) return false;
  const email = entry.email;
  if (entry.userType === 'pro') {
    const registry = getAllProAccountsRegistry();
    if (!registry[email]) return false;
    registry[email].password = newPassword;
    saveAllProAccountsRegistry(registry);
    return true;
  }
  const registry = getVisitorRegistry();
  if (!registry[email]) return false;
  registry[email].password = newPassword;
  saveVisitorRegistry(registry);
  return true;
}

export function requestPasswordReset(email, userType) {
  const normalized = email.trim().toLowerCase();
  if (userType === 'pro') {
    if (!getAllProAccountsRegistry()[normalized]) return null;
  } else if (!getVisitorRegistry()[normalized]) {
    return null;
  }
  return createPasswordResetToken(normalized, userType);
}

// ── Email verification stub ──

export function createEmailVerificationToken(email, userType) {
  const tokens = getItem(KEYS.EMAIL_VERIFICATION_TOKENS, {});
  const token = `ver_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  tokens[token] = { email: email.trim().toLowerCase(), userType, verified: false };
  setItem(KEYS.EMAIL_VERIFICATION_TOKENS, tokens);
  return token;
}

export function verifyEmailToken(token) {
  const tokens = getItem(KEYS.EMAIL_VERIFICATION_TOKENS, {});
  const entry = tokens[token];
  if (!entry) return false;
  entry.verified = true;
  tokens[token] = entry;
  setItem(KEYS.EMAIL_VERIFICATION_TOKENS, tokens);
  return entry;
}

export { KEYS };
