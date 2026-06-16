import { getItem, setItem, KEYS } from './storage';

const MAX_ENTRIES = 500;

export const AUDIT_ACTIONS = {
  ADMIN_LOGIN: 'admin.login',
  ADMIN_BROADCAST: 'admin.broadcast',
  ADMIN_VERIFY_PRO: 'admin.verify_pro',
  ADMIN_DISABLE_PRO: 'admin.disable_pro',
  ADMIN_SET_PLAN: 'admin.set_plan',
  ADMIN_RESET_DATA: 'admin.reset_data',
  PRO_UPGRADE: 'pro.upgrade',
  PRO_CANCEL: 'pro.cancel',
  PRO_PROFILE_SAVE: 'pro.profile_save',
  PRO_DELETE_ACCOUNT: 'pro.delete_account',
  PRO_MINISITE_PUBLISH: 'pro.minisite_publish',
  VISITOR_REGISTER: 'visitor.register',
  VISITOR_DELETE: 'visitor.delete',
  SYSTEM: 'system',
};

export function logAuditEvent({ actor = 'system', actorType = 'system', action, target = '', details = '' }) {
  const list = getItem(KEYS.AUDIT_LOG, []);
  const entry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    actor,
    actorType,
    action,
    target,
    details,
    timestamp: new Date().toISOString(),
  };
  list.unshift(entry);
  setItem(KEYS.AUDIT_LOG, list.slice(0, MAX_ENTRIES));
  return entry;
}

export function getAuditLog({ limit = 100, action, actorType, startDate, endDate } = {}) {
  let list = getItem(KEYS.AUDIT_LOG, []);
  if (action) list = list.filter((e) => e.action === action || e.action?.startsWith(action));
  if (actorType) list = list.filter((e) => e.actorType === actorType);
  if (startDate) list = list.filter((e) => e.timestamp >= startDate);
  if (endDate) list = list.filter((e) => e.timestamp <= `${endDate}T23:59:59`);
  return list.slice(0, limit);
}

export function getAuditActionLabel(action) {
  const map = {
    'admin.login': 'Connexion admin',
    'admin.broadcast': 'Notification envoyée',
    'admin.verify_pro': 'Pro vérifié',
    'admin.disable_pro': 'Pro désactivé',
    'admin.set_plan': 'Plan modifié',
    'admin.reset_data': 'Réinitialisation données',
    'pro.upgrade': 'Upgrade abonnement',
    'pro.cancel': 'Résiliation abonnement',
    'pro.profile_save': 'Profil mis à jour',
    'pro.delete_account': 'Compte pro supprimé',
    'pro.minisite_publish': 'Mini-site publié',
    'visitor.register': 'Inscription visiteur',
    'visitor.delete': 'Compte visiteur supprimé',
    system: 'Système',
  };
  return map[action] || action;
}
