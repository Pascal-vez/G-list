import { logAuditEvent, AUDIT_ACTIONS } from './auditLog';
import { logActivity } from './activityHistory';
import { recordBillingEvent } from './billingHistory';
import { pushSystemNotification } from './notificationInbox';
import { getItem, setItem, KEYS } from './storage';

export function onProLogin(proId) {
  logActivity('pro', proId, { type: 'LOGIN', label: 'Connexion à l\'espace pro' });
  recordSecuritySession('pro', proId);
}

export function onProRegister(proId, email) {
  logActivity('pro', proId, { type: 'LOGIN', label: 'Compte professionnel créé' });
  logAuditEvent({ actor: email, actorType: 'pro', action: AUDIT_ACTIONS.PRO_REGISTER, target: String(proId) });
  recordSecuritySession('pro', proId);
  pushSystemNotification(`pro:${proId}`, {
    type: 'success',
    title: 'Bienvenue sur G-List !',
    message: 'Votre espace pro est prêt. Complétez votre profil pour être plus visible dans l\'annuaire.',
  });
}

import { BILLING_CYCLE_MONTHLY } from './planConfig';

export function onProUpgrade(proId, plan, billingCycle = BILLING_CYCLE_MONTHLY) {
  logActivity('pro', proId, { type: 'PLAN_UPGRADE', label: `Abonnement ${plan} activé`, meta: { plan, billingCycle } });
  recordBillingEvent(proId, { plan, billingCycle, status: 'paid', note: 'Simulation locale' });
  logAuditEvent({ actor: String(proId), actorType: 'pro', action: AUDIT_ACTIONS.PRO_UPGRADE, target: plan, details: billingCycle });
  pushSystemNotification(`pro:${proId}`, { type: 'success', title: 'Abonnement activé', message: `Votre offre ${plan} est maintenant active.` });
}

export function onProCancel(proId, plan) {
  logActivity('pro', proId, { type: 'PLAN_CANCEL', label: 'Abonnement résilié', meta: { plan } });
  recordBillingEvent(proId, { plan, status: 'cancelled', amount: 0, note: 'Résiliation' });
  logAuditEvent({ actor: String(proId), actorType: 'pro', action: AUDIT_ACTIONS.PRO_CANCEL, target: plan });
}

export function onProProfileSave(proId) {
  logActivity('pro', proId, { type: 'PROFILE_UPDATE', label: 'Profil mis à jour' });
}

export function onProDelete(proId, email, reason = '') {
  logActivity('pro', proId, {
    type: 'ACCOUNT_DELETE',
    label: reason ? `Compte supprimé — ${reason.slice(0, 120)}` : 'Compte supprimé',
  });
}

export function onVisitorDelete(email, reason = '') {
  logActivity('visitor', email, {
    type: 'ACCOUNT_DELETE',
    label: reason ? `Compte supprimé — ${reason.slice(0, 120)}` : 'Compte supprimé',
  });
}

export function onAdminBroadcast(title, audience) {
  logAuditEvent({ actor: 'admin', actorType: 'admin', action: AUDIT_ACTIONS.ADMIN_BROADCAST, target: audience, details: title });
}

export function onAdminAction(action, target, details = '') {
  logAuditEvent({ actor: 'admin', actorType: 'admin', action, target, details });
}

export function onVisitorRegister(email) {
  logActivity('visitor', email, { type: 'LOGIN', label: 'Compte visiteur créé' });
  logAuditEvent({ actor: email, actorType: 'visitor', action: AUDIT_ACTIONS.VISITOR_REGISTER });
  recordSecuritySession('visitor', email);
}

export function onVisitorLogin(email) {
  logActivity('visitor', email, { type: 'LOGIN', label: 'Connexion visiteur' });
  recordSecuritySession('visitor', email);
}

export function onMinisitePublish(proId) {
  logActivity('pro', proId, { type: 'MINISITE_PUBLISH', label: 'Mini-site publié' });
  logAuditEvent({ actor: String(proId), actorType: 'pro', action: AUDIT_ACTIONS.PRO_MINISITE_PUBLISH });
}

export function recordSecuritySession(userType, userId) {
  const all = getItem(KEYS.SECURITY_SESSIONS, {});
  const key = `${userType}:${userId}`;
  const session = {
    id: `sess_${Date.now()}`,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : 'unknown',
    timestamp: new Date().toISOString(),
    current: true,
  };
  const prev = (all[key] || []).map((s) => ({ ...s, current: false }));
  all[key] = [session, ...prev].slice(0, 10);
  setItem(KEYS.SECURITY_SESSIONS, all);
}

export function getSecuritySessions(userType, userId) {
  const all = getItem(KEYS.SECURITY_SESSIONS, {});
  return all[`${userType}:${userId}`] || [];
}

export function exportProGdprData(proId, account) {
  return {
    exportedAt: new Date().toISOString(),
    account,
    billing: getItem(KEYS.BILLING_HISTORY, {})[proId] || [],
    activity: getItem(KEYS.ACTIVITY_HISTORY, {})[`pro:${proId}`] || [],
    sessions: getSecuritySessions('pro', proId),
  };
}

export function exportVisitorGdprData(email, account) {
  return {
    exportedAt: new Date().toISOString(),
    account,
    activity: getItem(KEYS.ACTIVITY_HISTORY, {})[`visitor:${email}`] || [],
    sessions: getSecuritySessions('visitor', email),
  };
}
