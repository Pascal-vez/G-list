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
};

export const PREMIUM_PRICE_GNF = 50000;

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

export function getProReviews(proId) {
  const all = getItem(KEYS.PRO_REVIEWS, {});
  return all[proId] || [];
}

export function setProReviews(proId, reviews) {
  const all = getItem(KEYS.PRO_REVIEWS, {});
  all[proId] = reviews;
  setItem(KEYS.PRO_REVIEWS, all);
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
  };
  saveProAccount(updated);
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

export function getProfileReviews(proId) {
  const all = getItem(KEYS.PROFILE_REVIEWS, {});
  return all[proId] || [];
}

export function addProfileReview(proId, review) {
  const all = getItem(KEYS.PROFILE_REVIEWS, {});
  if (!all[proId]) all[proId] = [];
  all[proId].unshift({ ...review, timestamp: new Date().toISOString() });
  setItem(KEYS.PROFILE_REVIEWS, all);
}

export function getTotalProfileReviews() {
  const all = getItem(KEYS.PROFILE_REVIEWS, {});
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

export function exportAllData() {
  return {
    prototypeAcknowledged: isPrototypeAcknowledged(),
    userType: getUserType(),
    proAccount: getProAccount(),
    proAccounts: getAllProAccountsRegistry(),
    feedbackVoted: hasFeedbackVoted(),
    thumbsUp: getItem(KEYS.FEEDBACK_THUMBS_UP, 0),
    thumbsDown: getItem(KEYS.FEEDBACK_THUMBS_DOWN, 0),
    suggestions: getItem(KEYS.SUGGESTIONS, []),
    engagementAnswered: hasEngagementAnswered(),
    engagementFound: getItem(KEYS.ENGAGEMENT_FOUND, 0),
    engagementSearching: getItem(KEYS.ENGAGEMENT_SEARCHING, 0),
    engagementTesting: getItem(KEYS.ENGAGEMENT_TESTING, 0),
    waitlist: getItem(KEYS.WAITLIST, []),
    profileReviews: getItem(KEYS.PROFILE_REVIEWS, {}),
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

export { KEYS };
