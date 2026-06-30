import { normalizeMinisite, slugify, syncSitePages } from './minisite';
import { useSupabase } from '../lib/supabaseClient';
import { saveMinisiteRemote, formatMinisiteSaveError, purgeProfessionalCloudOnAccountDelete } from '../api/supabaseMinisite';
import { validateDeletionReason, recordAccountDeletionFeedback } from './accountDeletionFeedback';
import { upsertProfessionalProfileToSupabase, fetchProProfileByEmailFromSupabase } from '../api/supabaseProfessionals';
import { invalidateProfessionalsCache } from '../api/professionalsStore';
import { apiConfig } from '../api/config';
import { apiRequest } from '../api/client';

const MINISITE_PREVIEW_PREFIX = 'glist_minisite_preview_';
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
import { isAbonnementActif, toPlanDemande } from './plans';

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
  DELETED_ACCOUNTS: 'glist_deleted_pro_accounts',
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
  MINISITE_PUBLISHED: 'glist_minisite_published',
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

function getDeletedAccountsRegistry() {
  return getItem(KEYS.DELETED_ACCOUNTS, {});
}

function markAccountDeleted(email, proId) {
  const deleted = getDeletedAccountsRegistry();
  deleted[normalizeEmail(email)] = { proId, deletedAt: new Date().toISOString() };
  setItem(KEYS.DELETED_ACCOUNTS, deleted);
}

function clearAccountDeletedTombstone(email) {
  const deleted = getDeletedAccountsRegistry();
  delete deleted[normalizeEmail(email)];
  setItem(KEYS.DELETED_ACCOUNTS, deleted);
}

/** Retire du registre les comptes marqués supprimés (fantômes). */
function sanitizeDeletedRegistryEntries() {
  const deleted = getDeletedAccountsRegistry();
  const registry = getAllProAccountsRegistry();
  let dirty = false;
  for (const email of Object.keys(deleted)) {
    if (registry[email]) {
      delete registry[email];
      dirty = true;
    }
  }
  if (dirty) saveAllProAccountsRegistry(registry);
}

function purgeLocalAbonnementForPro(proId, email) {
  const list = getItem('glist_demandes_abonnement', []);
  if (!list.length) return;
  const normalized = email ? normalizeEmail(email) : '';
  const next = list.filter(
    (d) => String(d.legacy_pro_id) !== String(proId)
      && (!normalized || normalizeEmail(d.pro_email || '') !== normalized),
  );
  if (next.length !== list.length) setItem('glist_demandes_abonnement', next);
}

function purgeLocalProDataById(proId, email = null) {
  if (proId == null) return;
  removeProIdFromStore(KEYS.PRO_REVIEWS, proId);
  localStorage.removeItem(KEYS.PROFILE_REVIEWS);
  removeProIdFromStore(KEYS.PRO_STATS, proId);
  removeProIdFromStore(KEYS.QUOTE_REQUESTS, proId);
  removeProIdFromStore(KEYS.CRM_PROSPECTS, proId);
  removeProIdFromStore(KEYS.MINISITE, proId);
  removeProIdFromStore(KEYS.MINISITE_PUBLISHED, proId);
  removeProIdFromStore(KEYS.MINISITE_ANALYTICS, proId);
  removeProIdFromStore(KEYS.MINISITE_FORMS, proId);
  removeProIdFromStore(KEYS.PRO_SERVICES, proId);
  removeProIdFromStore(KEYS.PRO_PHOTOS, proId);
  removeProIdFromStore(KEYS.ADMIN_OVERRIDES, proId);
  removeProIdFromStore(KEYS.PRO_PLAN, proId);
  removeProIdFromStore(KEYS.PRO_ALERT_SETTINGS, proId);
  removeProIdFromStore(KEYS.BILLING_HISTORY, proId);
  removeReviewResponsesForPro(proId);
  purgeLocalAbonnementForPro(proId, email);
  clearMinisitePreview(proId);
}

export function isAccountDeleted(email) {
  return Boolean(getDeletedAccountsRegistry()[normalizeEmail(email)]);
}

/** Finalise une suppression locale incomplète (annuaire / session fantôme). */
export function tombstoneDeletedProAccount(email, proId) {
  const normalized = normalizeEmail(email);
  markAccountDeleted(normalized, proId);
  const registry = getAllProAccountsRegistry();
  if (registry[normalized]) {
    delete registry[normalized];
    saveAllProAccountsRegistry(registry);
  }
  if (proId != null) purgeLocalProDataById(proId, normalized);
  const session = getProAccount();
  if (
    (session?.email && normalizeEmail(session.email) === normalized)
    || String(session?.id) === String(proId)
  ) {
    logoutProAccount();
  }
  notifyAccountsChanged();
}

/**
 * Libère un email pro bloqué (compte fantôme après suppression ratée).
 */
export async function releaseProEmailForNewSignup(email) {
  const normalized = normalizeEmail(email);
  const registry = getAllProAccountsRegistry();
  const acc = registry[normalized];
  const tombstone = getDeletedAccountsRegistry()[normalized];
  const proId = acc?.id ?? tombstone?.proId;

  if (proId != null) {
    await purgeProfessionalCloudOnAccountDelete({ legacyProId: proId, email: normalized }).catch(() => {});
    purgeLocalProDataById(proId, normalized);
  }

  delete registry[normalized];
  saveAllProAccountsRegistry(registry);
  clearAccountDeletedTombstone(normalized);
  if (getProAccount()?.email && normalizeEmail(getProAccount().email) === normalized) {
    logoutProAccount();
  }
  notifyAccountsChanged();
  return { ok: true, email: normalized };
}

function migrateLegacyAccount() {
  sanitizeDeletedRegistryEntries();
  const session = getItem(KEYS.PRO_ACCOUNT, null);
  if (!session?.email) return;
  const email = normalizeEmail(session.email);
  if (isAccountDeleted(email)) {
    localStorage.removeItem(KEYS.PRO_ACCOUNT);
    return;
  }
  const registry = getAllProAccountsRegistry();
  if (!registry[email]) {
    registry[email] = { ...session };
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
  syncProfessionalToCloud(account).then(() => invalidateProfessionalsCache()).catch(() => {});
}

export async function loginProAccount(email, password) {
  migrateLegacyAccount();
  const normalized = normalizeEmail(email);
  if (isAccountDeleted(normalized)) return null;

  // Vérification distante en premier (source de vérité, fonctionne sur tous les appareils)
  const remoteResult = await verifyProPasswordRemoteDetailed(normalized, password);

  // Fallback local si le backend est inaccessible
  const registry = getAllProAccountsRegistry();
  const acc = registry[normalized];
  const localOk = !remoteResult.ok && Boolean(acc?.password) && acc.password === password;

  if (!remoteResult.ok && !localOk) return null;

  const localOverride = acc && (getAdminOverrides()[acc.id] || getAdminOverrides()[String(acc.id)]);
  if (localOverride?.disabled || localOverride?.hidden) return null;

  if (useSupabase && acc?.id) {
    const blocked = await isProBlockedInCloud(acc.id);
    if (blocked) return null;
  }

  let account = acc;

  if (remoteResult.ok && !acc) {
    // Nouvel appareil : récupérer le profil depuis Supabase
    const cloudProfile = await fetchProProfileByEmailFromSupabase(normalized);
    const base = cloudProfile || {
      // Profil pas encore lié dans Supabase (email absent de professionals.email)
      // Session minimale : l'utilisateur pourra compléter son profil
      id: Date.now(),
      nom: normalized.split('@')[0],
      prenom: '',
      profession: '',
      categorie: '',
      region: '',
      quartier: '',
      telephone: '',
      whatsapp: '',
      description: '',
      slogan: '',
      plan: 'free',
      premium: false,
      horaires: 'Lun-Sam 8h-18h',
      specialites: [],
      services: [],
      social: {},
      verifie: false,
      profileViews: 0,
      whatsappClicks: 0,
    };
    account = { ...base, email: normalized, password };
    const reg = getAllProAccountsRegistry();
    reg[normalized] = account;
    saveAllProAccountsRegistry(reg);
  } else if (remoteResult.ok && acc && acc.password !== password) {
    // Mot de passe changé à distance (reset) → mettre à jour le local
    registry[normalized].password = password;
    saveAllProAccountsRegistry(registry);
    account = registry[normalized];
  }

  if (!account) return null;

  const { password: _pw, ...session } = account;
  saveProAccount(session);
  setUserType('pro');
  import('./platformEvents.js').then((m) => m.onProLogin(session.id)).catch(() => {});
  return session;
}

async function isProBlockedInCloud(legacyProId) {
  try {
    const { supabase, useSupabase: sb } = await import('../lib/supabaseClient.js');
    if (!sb || !supabase) return false;
    const id = Number(legacyProId);
    if (!Number.isFinite(id)) return false;
    const { data } = await supabase.rpc('get_annuaire_professional', { p_legacy_id: id });
    if (data?.professional) return false;
    const { data: row } = await supabase
      .from('professionals')
      .select('id')
      .eq('legacy_local_id', id)
      .maybeSingle();
    return Boolean(row?.id);
  } catch {
    return false;
  }
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

function notifyAccountsChanged() {
  window.dispatchEvent(new CustomEvent('glist-accounts-changed'));
  if (useSupabase) {
    invalidateProfessionalsCache().catch(() => {});
  }
}

async function syncProfessionalToCloud(account) {
  if (!useSupabase || !account?.id) return;
  await upsertProfessionalProfileToSupabase(account).catch(() => {});
}

async function verifyProPasswordRemoteDetailed(email, password) {
  if (!apiConfig.useRemoteApi) return { ok: false };
  try {
    const res = await apiRequest('/auth/verify-password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { ok: res?.ok === true, userType: res?.userType };
  } catch {
    return { ok: false };
  }
}

async function verifyProPasswordRemote(email, password) {
  if (!apiConfig.useRemoteApi) return false;
  try {
    const res = await apiRequest('/auth/verify-password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res?.ok === true;
  } catch {
    return false;
  }
}

export function updateProPasswordInRegistry(email, password) {
  migrateLegacyAccount();
  const registry = getAllProAccountsRegistry();
  const normalized = normalizeEmail(email);
  if (!registry[normalized]) return false;
  registry[normalized].password = password;
  saveAllProAccountsRegistry(registry);
  return true;
}

async function deleteRemoteUser(email, password, retries = 2) {
  if (!apiConfig.useRemoteApi) return { ok: true, deleted: false };
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await apiRequest('/auth/delete-account', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return { ok: true, deleted: res?.deleted === true || res?.ok === true };
    } catch {
      if (i === retries - 1) return { ok: false };
    }
  }
  return { ok: false };
}

async function purgeCloudAndBackendOnDelete({ proId, slug, email, password }) {
  const [cloudResult, backendResult] = await Promise.all([
    proId != null || slug || email
      ? purgeProfessionalCloudOnAccountDelete({ legacyProId: proId, slug, email })
      : Promise.resolve({ ok: true, deleted: false }),
    deleteRemoteUser(email, password),
  ]);
  return { cloudResult, backendResult };
}

function getMinisiteSlugBeforeDelete(proId) {
  const id = String(proId);
  const draft = getItem(KEYS.MINISITE, {})[id] || getItem(KEYS.MINISITE, {})[proId];
  const published = getItem(KEYS.MINISITE_PUBLISHED, {})[id] || getItem(KEYS.MINISITE_PUBLISHED, {})[proId];
  return draft?.slug || published?.slug || null;
}

function clearMinisitePreview(proId) {
  try {
    sessionStorage.removeItem(`${MINISITE_PREVIEW_PREFIX}${minisiteStorageKey(proId)}`);
  } catch {
    /* ignore */
  }
}

async function purgeProfessionalFromCloud(proId, slugHint = null, emailHint = null) {
  return purgeProfessionalCloudOnAccountDelete({
    legacyProId: proId,
    slug: slugHint,
    email: emailHint,
  });
}

async function checkRemoteEmailExists(email) {
  if (!apiConfig.useRemoteApi) return false;
  try {
    const res = await apiRequest(`/auth/email-exists?email=${encodeURIComponent(email)}`);
    return res?.exists === true;
  } catch {
    return false;
  }
}

async function registerRemoteUser(email, password) {
  if (!apiConfig.useRemoteApi) return { ok: true };
  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, userType: 'pro' }),
    });
    return { ok: true };
  } catch (err) {
    if (err?.status === 409) return { ok: false, exists: true };
    return { ok: false };
  }
}

async function ensureRemoteUser(email, password) {
  return registerRemoteUser(email, password);
}

/** Supprime définitivement un compte pro et toutes ses données (local, backend, Supabase). */
export async function deleteProAccount(email, password, options = {}) {
  const { reason, requireReason = false, adminOverride = false } = options;

  let validatedReason = null;
  if (requireReason) {
    validatedReason = validateDeletionReason(reason);
    if (!validatedReason.ok) {
      return { ok: false, error: validatedReason.error, message: validatedReason.message };
    }
  }

  migrateLegacyAccount();
  sanitizeDeletedRegistryEntries();
  const normalized = normalizeEmail(email);
  const registry = getAllProAccountsRegistry();
  const acc = registry[normalized];

  if (!acc && isAccountDeleted(normalized)) {
    if (!adminOverride) await deleteRemoteUser(normalized, password);
    return { ok: true, alreadyDeleted: true };
  }

  if (!acc) {
    const remoteOnly = await verifyProPasswordRemote(normalized, password);
    if (!remoteOnly && !adminOverride) return { ok: false, error: 'NOT_FOUND' };
    if (adminOverride && options.legacyProId != null) {
      const cloudOnly = await purgeCloudAndBackendOnDelete({
        proId: options.legacyProId,
        slug: null,
        email: normalized.includes('@') ? normalized : null,
        password,
      });
      notifyAccountsChanged();
      return { ok: true, cloudDeleted: cloudOnly.cloudResult?.deleted === true, cloudOnly: true };
    }
  }

  if (!adminOverride) {
    const passwordOk = acc
      ? (acc.password === password || await verifyProPasswordRemote(normalized, password))
      : await verifyProPasswordRemote(normalized, password);
    if (!passwordOk) return { ok: false, error: 'PASSWORD_INVALID' };
  }

  const proId = acc?.id ?? options.legacyProId ?? getDeletedAccountsRegistry()[normalized]?.proId;
  const minisiteSlug = proId != null ? getMinisiteSlugBeforeDelete(proId) : null;
  const accountEmail = acc?.email || normalized;

  if (validatedReason?.reason) {
    recordAccountDeletionFeedback({
      userType: 'pro',
      email: accountEmail,
      displayName: acc?.nom,
      reason: validatedReason.reason,
      proId,
    });
  } else if (adminOverride && reason) {
    recordAccountDeletionFeedback({
      userType: 'pro',
      email: accountEmail,
      displayName: acc?.nom,
      reason: reason.trim(),
      proId,
    });
  }

  // ── Phase 1 : suppression locale immédiate (annuaire / session) ──
  delete registry[normalized];
  saveAllProAccountsRegistry(registry);
  markAccountDeleted(normalized, proId ?? null);

  if (proId != null) purgeLocalProDataById(proId, accountEmail);

  const session = getProAccount();
  if (
    (session?.email && normalizeEmail(session.email) === normalized)
    || (proId != null && String(session?.id) === String(proId))
  ) {
    logoutProAccount();
  }

  notifyAccountsChanged();

  // ── Phase 2 : backend + Supabase en parallèle ──
  const { cloudResult, backendResult } = await purgeCloudAndBackendOnDelete({
    proId,
    slug: minisiteSlug,
    email: accountEmail,
    password,
  });

  import('./platformEvents.js').then((m) => m.onProDelete(proId, email, validatedReason?.reason)).catch(() => {});

  return {
    ok: true,
    cloudDeleted: cloudResult?.deleted === true,
    backendDeleted: backendResult?.deleted === true || backendResult?.ok === true,
    partial: Boolean(
      useSupabase && cloudResult?.reason && !cloudResult?.deleted,
    ),
  };
}

export function isEmailRegistered(email) {
  migrateLegacyAccount();
  const normalized = normalizeEmail(email);
  if (isAccountDeleted(normalized)) return false;
  return !!getAllProAccountsRegistry()[normalized];
}

const DEFAULT_SOCIAL = { facebook: '', instagram: '', tiktok: '', linkedin: '', portfolio: '', website: '' };

export function createProAccount(data) {
  return createProAccountAsync(data);
}

/** Crée un compte pro — Supabase est la source de vérité, le local vient ensuite. */
export async function createProAccountAsync(data) {
  migrateLegacyAccount();
  sanitizeDeletedRegistryEntries();

  const email = normalizeEmail(data.email || '');
  if (!email) throw new Error('EMAIL_REQUIRED');
  if (!data.password) throw new Error('PASSWORD_REQUIRED');
  if (data.password.length < 6) throw new Error('PASSWORD_TOO_SHORT');

  // ── Vérification Supabase EN PREMIER (source de vérité, tous appareils) ──
  if (apiConfig.useRemoteApi) {
    const remoteExists = await checkRemoteEmailExists(email);
    if (remoteExists) {
      const pwOk = await verifyProPasswordRemote(email, data.password);
      if (pwOk) throw new Error('EMAIL_EXISTS_LOGIN_INSTEAD');
      throw new Error('EMAIL_EXISTS');
    }
  } else {
    // Mode hors-ligne : vérification locale uniquement
    const reg = getAllProAccountsRegistry();
    const existing = reg[email];
    if (existing && !isAccountDeleted(email)) {
      const pwOk = existing.password === data.password;
      if (pwOk) throw new Error('EMAIL_EXISTS_LOGIN_INSTEAD');
      throw new Error('EMAIL_EXISTS');
    }
  }

  // ── Nettoyage des tombstones ──
  if (isAccountDeleted(email)) {
    const tombstone = getDeletedAccountsRegistry()[email];
    if (tombstone?.proId != null) {
      await purgeProfessionalCloudOnAccountDelete({
        legacyProId: tombstone.proId,
        email,
      }).catch(() => {});
      purgeLocalProDataById(tombstone.proId, email);
    }
    clearAccountDeletedTombstone(email);
  }

  // ── Inscription dans Supabase EN PREMIER — si ça échoue, on n'inscrit pas ──
  if (apiConfig.useRemoteApi) {
    const registered = await registerRemoteUser(email, data.password);
    if (!registered.ok) {
      if (registered.exists) throw new Error('EMAIL_EXISTS');
      throw new Error('Erreur lors de la création du compte. Veuillez réessayer.');
    }
  }

  // ── Création locale seulement après confirmation Supabase ──
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
    profileViews: 0,
    premium: false,
    plan: 'free',
    premiumSince: null,
    premiumExpires: null,
    verifie: false,
    createdAt: new Date().toISOString(),
  };

  const registry = getAllProAccountsRegistry();
  registry[email] = { ...account, password: data.password };
  saveAllProAccountsRegistry(registry);

  saveProAccount(account);
  setUserType('pro');
  import('./platformEvents.js').then((m) => m.onProRegister(id, email)).catch(() => {});

  await syncProfessionalToCloud(account);

  notifyAccountsChanged();
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
    plan: 'premium',
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
  if (!account) return false;
  if (isAbonnementActif(account)) {
    const plan = account.plan || (account.premium ? 'premium' : 'free');
    return plan === 'premium';
  }
  if (!account.premium) return false;
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

export function addWaitlistEntry() {
  /* liste d'attente supprimée — inscription directe via /espace-pro */
}

export function getWaitlistEntries() {
  return [];
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

/** Supprime définitivement un compte visiteur (motif obligatoire si requireReason). */
export async function deleteVisitorAccount(email, password, options = {}) {
  const { reason, requireReason = false } = options;

  let validatedReason = null;
  if (requireReason) {
    validatedReason = validateDeletionReason(reason);
    if (!validatedReason.ok) {
      return { ok: false, error: validatedReason.error, message: validatedReason.message };
    }
  }

  const normalized = normalizeEmail(email || '');
  const registry = getVisitorRegistry();
  const acc = registry[normalized];
  if (!acc) return { ok: false, error: 'NOT_FOUND' };
  if (acc.password !== password) return { ok: false, error: 'PASSWORD_INVALID' };

  const displayName = `${acc.prenom || ''} ${acc.nom || ''}`.trim() || normalized;

  if (validatedReason?.reason) {
    recordAccountDeletionFeedback({
      userType: 'visitor',
      email: normalized,
      displayName,
      reason: validatedReason.reason,
    });
  }

  delete registry[normalized];
  saveVisitorRegistry(registry);
  logoutVisitorAccount();

  import('./platformEvents.js').then((m) => m.onVisitorDelete(normalized, validatedReason?.reason)).catch(() => {});

  return { ok: true };
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
  if (useSupabase) {
    import('../api/supabaseReviews.js').then((m) => m.recordProfileEvent(proId, 'profile_view')).catch(() => {});
    return;
  }
  const stats = getProStats(proId);
  setProStats(proId, { ...stats, views: (stats.views || 0) + 1 });
}

export function incrementWhatsAppClick(proId) {
  if (useSupabase) {
    import('../api/supabaseReviews.js').then((m) => m.recordProfileEvent(proId, 'whatsapp_click')).catch(() => {});
    return;
  }
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

function minisiteStorageKey(proId) {
  return String(proId);
}

function isPublishedFlag(value) {
  return value === true || value === 'true';
}

export function findMinisiteRecord(proId) {
  const all = getItem(KEYS.MINISITE, {});
  const key = minisiteStorageKey(proId);
  if (all[key]) return all[key];
  const numeric = Number(proId);
  if (all[numeric] != null) return all[numeric];
  if (all[proId] != null) return all[proId];
  return null;
}

function getRawMinisiteRecord(proId) {
  return findMinisiteRecord(proId);
}

function saveMinisitePublishedIndex(proId, published, slug) {
  const all = getItem(KEYS.MINISITE_PUBLISHED, {});
  const key = minisiteStorageKey(proId);
  const normalizedSlug = slugify(slug || '');
  if (isPublishedFlag(published) && normalizedSlug) {
    all[key] = { published: true, slug: normalizedSlug, updatedAt: new Date().toISOString() };
  } else {
    delete all[key];
    delete all[Number(proId)];
    delete all[proId];
  }
  setItem(KEYS.MINISITE_PUBLISHED, all);
}

function getMinisitePublishedIndex(proId) {
  const all = getItem(KEYS.MINISITE_PUBLISHED, {});
  const key = minisiteStorageKey(proId);
  return all[key] ?? all[Number(proId)] ?? all[proId] ?? null;
}

/** Reconstruit l'index public à partir des mini-sites déjà sauvegardés (migration). */
export function rebuildMinisitePublishedIndex() {
  const sites = getItem(KEYS.MINISITE, {});
  Object.entries(sites).forEach(([id, data]) => {
    if (isPublishedFlag(data?.published) && data?.slug) {
      saveMinisitePublishedIndex(id, true, data.slug);
    }
  });
}

/** Vrai uniquement si le pro a explicitement publié son mini-site. */
export function isMinisitePublished(proId) {
  const indexed = getMinisitePublishedIndex(proId);
  if (indexed?.published === true) return true;
  const raw = findMinisiteRecord(proId);
  return isPublishedFlag(raw?.published);
}

export function cacheMinisitePreview(proId, site) {
  try {
    sessionStorage.setItem(
      `${MINISITE_PREVIEW_PREFIX}${minisiteStorageKey(proId)}`,
      JSON.stringify(syncSitePages(site)),
    );
  } catch {
    /* quota — aperçu retombera sur localStorage */
  }
}

export function getCachedMinisitePreview(proId) {
  try {
    const raw = sessionStorage.getItem(`${MINISITE_PREVIEW_PREFIX}${minisiteStorageKey(proId)}`);
    return raw ? syncSitePages(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Brouillon local — toujours écrit, même en mode Supabase (retour éditeur / aperçu). */
function saveMinisiteLocalDraft(proId, settings) {
  const all = getItem(KEYS.MINISITE, {});
  const key = minisiteStorageKey(proId);
  const payload = syncSitePages({
    ...settings,
    published: settings?.published === true,
  });
  all[key] = payload;
  delete all[Number(proId)];
  delete all[proId];
  try {
    setItem(KEYS.MINISITE, all);
  } catch {
    /* quota */
  }
  return payload;
}

/** Charge l'état le plus récent pour l'éditeur (session → local → défaut compte). */
export function loadMinisiteForEditor(proId, account = null) {
  const cached = getCachedMinisitePreview(proId);
  if (cached) return syncSitePages(cached);
  return syncSitePages(getMinisite(proId, account));
}

export function hasMinisiteLocalDraft(proId) {
  return !!getRawMinisiteRecord(proId) || !!getCachedMinisitePreview(proId);
}

export function getMinisite(proId, account = null) {
  const key = minisiteStorageKey(proId);
  const raw = getRawMinisiteRecord(proId);
  const acc = account || getAllProAccountsList().find((a) => String(a.id) === key) || null;
  const site = normalizeMinisite(raw, acc);
  return site ? syncSitePages(site) : site;
}

/** Sauvegarde locale (mode prototype sans Supabase). */
export function saveMinisite(proId, settings) {
  const payload = saveMinisiteLocalDraft(proId, settings);

  if (useSupabase) {
    return payload;
  }

  saveMinisitePublishedIndex(proId, payload.published, payload.slug);
  cacheMinisitePreview(proId, payload);
  return payload;
}

/** Sauvegarde production — Supabase obligatoire si configuré. */
export async function saveMinisiteAsync(proId, settings, account = null) {
  const payload = syncSitePages({
    ...settings,
    published: settings?.published === true,
  });

  saveMinisiteLocalDraft(proId, payload);
  cacheMinisitePreview(proId, payload);

  if (useSupabase) {
    const res = await saveMinisiteRemote(proId, payload, account);
    if (!res.ok) {
      throw new Error(formatMinisiteSaveError(res.reason));
    }
    if (payload.published) {
      saveMinisitePublishedIndex(proId, true, payload.slug);
    } else {
      saveMinisitePublishedIndex(proId, false, payload.slug);
    }
    return res.payload;
  }

  saveMinisitePublishedIndex(proId, payload.published, payload.slug);
  return payload;
}

/** Slug public si le mini-site est publié (index léger + données complètes). */
export function getMinisiteSlugForPro(proId) {
  const indexed = getMinisitePublishedIndex(proId);
  if (indexed?.published === true && indexed.slug) {
    return indexed.slug;
  }

  const raw = findMinisiteRecord(proId);
  if (raw && isPublishedFlag(raw.published)) {
    const slug = slugify(raw.slug || '');
    if (slug) {
      saveMinisitePublishedIndex(proId, true, slug);
      return slug;
    }
  }
  return null;
}

/** Trouve l'id pro à partir d'un slug publié. */
export function findProIdByPublishedMinisiteSlug(slug) {
  const normalized = slugify(slug || '');
  if (!normalized) return null;

  const index = getItem(KEYS.MINISITE_PUBLISHED, {});
  const fromIndex = Object.entries(index).find(([, meta]) => meta.slug === normalized);
  if (fromIndex) return fromIndex[0];

  const sites = getItem(KEYS.MINISITE, {});
  const fromSites = Object.entries(sites).find(([, data]) => (
    isPublishedFlag(data?.published) && slugify(data.slug || '') === normalized
  ));
  if (fromSites) {
    saveMinisitePublishedIndex(fromSites[0], true, fromSites[1].slug);
    return fromSites[0];
  }
  return null;
}

export function isSlugAvailable(slug, excludeProId = null) {
  const normalized = slugify(slug);
  const all = getItem(KEYS.MINISITE, {});
  const excludeKey = excludeProId != null ? minisiteStorageKey(excludeProId) : null;
  return !Object.entries(all).some(([id, data]) => {
    if (excludeKey && (id === excludeKey || id === String(excludeProId))) return false;
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
  const adminPlan = getAdminPlanForPro(account.id);
  if (adminPlan) return adminPlan;
  if (isAbonnementActif(account)) {
    if (account.plan && account.plan !== 'free') return account.plan;
    if (account.premium) return 'premium';
  }
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
  const theme = localStorage.getItem('glist_theme');
  if (theme) return theme === 'dark';
  return localStorage.getItem(KEYS.DARK_MODE) === 'true';
}

export function setDarkMode(enabled) {
  const theme = enabled ? 'dark' : 'light';
  localStorage.setItem(KEYS.DARK_MODE, enabled ? 'true' : 'false');
  localStorage.setItem('glist_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
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
  setAdminOverride(proId, { verifie: true, disabled: false, hidden: false, flaggedDuplicate: false });
  syncAdminOverrideToCloud(proId, { verifie: true, hidden: false, disabled: false });
  import('./notificationInbox.js').then(({ notifyProInbox }) => {
    notifyProInbox(proId, {
      type: 'success',
      title: 'Profil vérifié',
      message: 'Félicitations ! Votre profil affiche désormais le badge « Vérifié » sur G-List.',
    });
  }).catch(() => {});
}

export function adminDisableProfessional(proId) {
  setAdminOverride(proId, { disabled: true, verifie: false });
  syncAdminOverrideToCloud(proId, { disabled: true, verifie: false });
  import('./notificationInbox.js').then(({ notifyProInbox }) => {
    notifyProInbox(proId, {
      type: 'warning',
      title: 'Profil désactivé',
      message: 'Votre fiche a été temporairement désactivée par l\'administration. Contactez le support pour plus d\'informations.',
    });
  }).catch(() => {});
}

export function adminFlagDuplicate(proId) {
  setAdminOverride(proId, { flaggedDuplicate: true });
  import('./notificationInbox.js').then(({ notifyProInbox }) => {
    notifyProInbox(proId, {
      type: 'warning',
      title: 'Doublon signalé',
      message: 'Votre fiche a été signalée comme doublon. L\'équipe G-List va la traiter sous peu.',
    });
  }).catch(() => {});
}

export function adminHideProfessional(proId) {
  setAdminOverride(proId, { hidden: true, disabled: true });
  syncAdminOverrideToCloud(proId, { hidden: true, disabled: true });
  import('./notificationInbox.js').then(({ notifyProInbox }) => {
    notifyProInbox(proId, {
      type: 'warning',
      title: 'Profil masqué',
      message: 'Votre fiche n\'est plus visible dans l\'annuaire public.',
    });
  }).catch(() => {});
}

export function adminReactivateProfessional(proId) {
  setAdminOverride(proId, { hidden: false, disabled: false, flaggedDuplicate: false });
  syncAdminOverrideToCloud(proId, { hidden: false, disabled: false });
  import('./notificationInbox.js').then(({ notifyProInbox }) => {
    notifyProInbox(proId, {
      type: 'success',
      title: 'Profil réactivé',
      message: 'Votre fiche est de nouveau visible dans l\'annuaire G-List.',
    });
  }).catch(() => {});
}

export function adminNotifyProfessional(proId, { title, message }) {
  if (!title || !message) return;
  import('./notificationInbox.js').then(({ notifyProInbox }) => {
    notifyProInbox(proId, { type: 'info', title, message });
  }).catch(() => {});
}

async function syncAdminOverrideToCloud(proId, { verifie, hidden, disabled }) {
  if (!useSupabase) return;
  try {
    const { supabase } = await import('../lib/supabaseClient.js');
    if (!supabase) return;
    await supabase.rpc('admin_set_pro_override', {
      p_legacy_id: Number(proId),
      p_verifie: verifie ?? null,
      p_hidden: hidden ?? null,
      p_disabled: disabled ?? null,
    });
    const { invalidateProfessionalsCache } = await import('../api/professionalsStore.js');
    invalidateProfessionalsCache();
  } catch { /* ignore */ }
}

export function adminMergeDuplicate(keepId, removeId) {
  setAdminOverride(removeId, { hidden: true, mergedInto: keepId });
  setAdminOverride(keepId, { verifie: true, flaggedDuplicate: false });
}

export function updateProAccountById(proId, patch) {
  const registry = getAllProAccountsRegistry();
  let updatedAccount = null;
  Object.entries(registry).forEach(([email, acc]) => {
    if (String(acc.id) === String(proId)) {
      updatedAccount = { ...acc, ...patch };
      registry[email] = updatedAccount;
    }
  });
  if (updatedAccount) saveAllProAccountsRegistry(registry);

  const session = getProAccount();
  if (session && String(session.id) === String(proId)) {
    updatedAccount = { ...session, ...patch };
    saveProAccount(updatedAccount);
  }
  return updatedAccount;
}

export function getAdminPlanOverrides() {
  return getItem(KEYS.PRO_PLAN, {});
}

export function getAdminPlanForPro(proId) {
  const entry = getAdminPlanOverrides()[proId] ?? getAdminPlanOverrides()[String(proId)];
  return entry?.plan || null;
}

async function syncPlanToCloud(proId, plan) {
  if (!useSupabase) return;
  try {
    const { supabase } = await import('../lib/supabaseClient.js');
    if (!supabase) return;
    const legacyId = Number(proId);
    if (!Number.isFinite(legacyId)) return;
    const planDemande = plan === 'free' ? 'free' : toPlanDemande(plan);
    await supabase.rpc('admin_activate_plan_legacy', {
      p_legacy_id: legacyId,
      p_plan: planDemande,
      p_days: plan === 'free' ? 1 : 30,
    });
    const { invalidateProfessionalsCache } = await import('../api/professionalsStore.js');
    await invalidateProfessionalsCache();
  } catch { /* ignore */ }
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
    planAbonnement: plan === 'free' ? 'gratuit' : toPlanDemande(plan),
    planActif: plan !== 'free',
    premium: plan === 'premium',
    billingCycle: plan === 'free' ? null : 'monthly',
    premiumSince: plan !== 'free' ? new Date().toISOString() : null,
    premiumExpires: plan !== 'free' ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
    planFin: plan !== 'free' ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
  });

  syncPlanToCloud(id, plan);

  import('./notificationInbox.js').then(({ notifyProInbox }) => {
    if (plan === 'free') {
      notifyProInbox(id, { type: 'info', title: 'Plan modifié', message: 'Votre abonnement a été remis au plan gratuit.' });
    } else {
      notifyProInbox(id, { type: 'success', title: 'Abonnement activé', message: `Votre plan ${plan === 'premium' ? 'Premium' : 'Advanced'} est maintenant actif.` });
    }
  }).catch(() => {});

  return true;
}

export function updateReportStatus(id, status) {
  const list = getReports().map((r) => (r.id === id ? { ...r, status } : r));
  setItem(KEYS.REPORTS, list);
  return list;
}

export function getContactMessages() {
  return getItem(KEYS.CONTACT_MESSAGES, []);
}

export function getAllProAccountsList() {
  migrateLegacyAccount();
  const deleted = getDeletedAccountsRegistry();
  return Object.entries(getAllProAccountsRegistry())
    .filter(([email]) => !deleted[email])
    .map(([, acc]) => stripPassword(acc));
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
