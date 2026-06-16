import { getItem, setItem, KEYS } from './storage';
import { filterByDateRange } from './dateRange';

const MAX_PER_USER = 200;

function storeKey(userType, userId) {
  return `${userType}:${userId}`;
}

export const ACTIVITY_TYPES = {
  PROFILE_VIEW: { label: 'Profil consulté', icon: 'eye' },
  PROFILE_UPDATE: { label: 'Profil mis à jour', icon: 'edit' },
  SERVICE_UPDATE: { label: 'Services modifiés', icon: 'briefcase' },
  PHOTO_UPDATE: { label: 'Photos mises à jour', icon: 'image' },
  REVIEW_RECEIVED: { label: 'Nouvel avis', icon: 'star' },
  REVIEW_RESPONSE: { label: 'Réponse à un avis', icon: 'message' },
  QUOTE_RECEIVED: { label: 'Demande de devis', icon: 'file' },
  CRM_UPDATE: { label: 'CRM mis à jour', icon: 'users' },
  MINISITE_EDIT: { label: 'Mini-site modifié', icon: 'globe' },
  MINISITE_PUBLISH: { label: 'Mini-site publié', icon: 'globe' },
  PLAN_UPGRADE: { label: 'Abonnement activé', icon: 'crown' },
  PLAN_CANCEL: { label: 'Abonnement résilié', icon: 'crown' },
  LOGIN: { label: 'Connexion', icon: 'login' },
  FAVORITE_ADD: { label: 'Favori ajouté', icon: 'heart' },
  FAVORITE_REMOVE: { label: 'Favori retiré', icon: 'heart' },
  SEARCH: { label: 'Recherche', icon: 'search' },
  VIEW_PROFILE: { label: 'Fiche consultée', icon: 'eye' },
  QUOTE_SENT: { label: 'Devis envoyé', icon: 'send' },
  SETTINGS_UPDATE: { label: 'Paramètres modifiés', icon: 'settings' },
};

export function logActivity(userType, userId, { type, label, meta = {} }) {
  if (!userId) return null;
  const all = getItem(KEYS.ACTIVITY_HISTORY, {});
  const key = storeKey(userType, userId);
  const typeInfo = ACTIVITY_TYPES[type] || {};
  const entry = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    label: label || typeInfo.label || type,
    meta,
    timestamp: new Date().toISOString(),
  };
  const list = [entry, ...(all[key] || [])].slice(0, MAX_PER_USER);
  all[key] = list;
  setItem(KEYS.ACTIVITY_HISTORY, all);
  return entry;
}

export function getActivityHistory(userType, userId, dateRange = null) {
  const all = getItem(KEYS.ACTIVITY_HISTORY, {});
  const list = all[storeKey(userType, userId)] || [];
  if (!dateRange?.startDate) return list;
  return filterByDateRange(list, dateRange.startDate, dateRange.endDate, 'timestamp');
}

export function clearActivityHistory(userType, userId) {
  const all = getItem(KEYS.ACTIVITY_HISTORY, {});
  delete all[storeKey(userType, userId)];
  setItem(KEYS.ACTIVITY_HISTORY, all);
}
