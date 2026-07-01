import { pushAdminNotification } from './adminNotifications';
import { logAuditEvent, AUDIT_ACTIONS } from './auditLog';
import { getItem, setItem } from './storage';

const REASONS_KEY = 'glist_account_deletion_reasons';
export const MIN_DELETION_REASON_LENGTH = 10;

export function validateDeletionReason(reason) {
  const trimmed = (reason || '').trim();
  if (trimmed.length < MIN_DELETION_REASON_LENGTH) {
    return {
      ok: false,
      error: 'REASON_REQUIRED',
      message: `Indiquez la raison de votre départ (minimum ${MIN_DELETION_REASON_LENGTH} caractères).`,
    };
  }
  return { ok: true, reason: trimmed };
}

export function recordAccountDeletionFeedback({
  userType,
  email,
  displayName,
  reason,
  proId = null,
}) {
  const entry = {
    id: `del_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userType,
    email,
    displayName: displayName || email,
    reason,
    proId,
    createdAt: new Date().toISOString(),
  };

  const all = [entry, ...getItem(REASONS_KEY, [])].slice(0, 200);
  setItem(REASONS_KEY, all);

  const typeLabel = userType === 'pro' ? 'Professionnel' : 'Visiteur';
  pushAdminNotification({
    type: 'warning',
    title: `Compte ${typeLabel} supprimé`,
    message: `${displayName || email} — Motif : ${reason}`,
    link: 'audit',
  });

  logAuditEvent({
    actor: email,
    actorType: userType,
    action: userType === 'pro' ? AUDIT_ACTIONS.PRO_DELETE_ACCOUNT : AUDIT_ACTIONS.VISITOR_DELETE,
    target: proId != null ? String(proId) : email,
    details: reason,
  });

  return entry;
}

export function getAccountDeletionFeedbacks(limit = 50) {
  return getItem(REASONS_KEY, []).slice(0, limit);
}
