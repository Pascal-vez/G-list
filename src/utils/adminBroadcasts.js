import {
  getItem, setItem, getUserType, getProAccount, getVisitorAccount,
  getProPlanLevel, getAdminPlanForPro, getAllProAccountsList, getAllVisitorAccounts,
  KEYS,
} from './storage';
import { pushSystemNotification } from './notificationInbox';
import { useSupabase } from '../lib/supabaseClient';

const BROADCASTS_KEY = KEYS.ADMIN_BROADCASTS;
const DISMISSED_KEY = KEYS.BROADCAST_DISMISSED;

export const BROADCAST_TYPES = [
  { id: 'maintenance', label: 'Maintenance', description: 'Interruption de service planifiée' },
  { id: 'warning', label: 'Avertissement', description: 'Alerte importante à ne pas manquer' },
  { id: 'info', label: 'Information', description: 'Annonce générale ou nouveauté' },
  { id: 'success', label: 'Bonne nouvelle', description: 'Confirmation ou mise à jour positive' },
];

export const BROADCAST_AUDIENCES = [
  { id: 'all', label: 'Tout le monde', description: 'Visiteurs, professionnels et visiteurs non connectés' },
  { id: 'anonymous', label: 'Visiteurs non connectés', description: 'Uniquement les personnes sans compte' },
  { id: 'visitors', label: 'Comptes visiteurs', description: 'Utilisateurs connectés en tant que visiteur' },
  { id: 'pros', label: 'Tous les professionnels', description: 'Tous les comptes pro, quel que soit l\'offre' },
  { id: 'pros_free', label: 'Pros — offre gratuite', description: 'Professionnels sans abonnement payant' },
  { id: 'pros_advanced', label: 'Pros — offre Avancée', description: 'Abonnement Avancé actif' },
  { id: 'pros_premium', label: 'Pros — offre Premium', description: 'Abonnement Premium actif' },
];

function getDismissedIds() {
  return getItem(DISMISSED_KEY, []);
}

export function getAdminBroadcasts() {
  return getItem(BROADCASTS_KEY, []);
}

export function getUserBroadcastContext() {
  const userType = getUserType();
  if (userType === 'pro') {
    const account = getProAccount();
    const plan = account
      ? (getAdminPlanForPro(account.id) || getProPlanLevel(account))
      : 'free';
    return { role: 'pro', plan, userKey: account ? `pro:${account.id}` : 'pro:anon' };
  }
  if (userType === 'visiteur') {
    const account = getVisitorAccount();
    return { role: 'visiteur', plan: null, userKey: account ? `visitor:${account.email}` : 'visitor:anon' };
  }
  return { role: 'anonymous', plan: null, userKey: 'anonymous' };
}

function resolveProPlan(pro) {
  return getAdminPlanForPro(pro.id) || getProPlanLevel(pro);
}

export function matchesBroadcastAudience(broadcast, context = getUserBroadcastContext()) {
  const { audience } = broadcast;
  if (audience === 'all') return true;
  if (audience === 'anonymous') return context.role === 'anonymous';
  if (audience === 'visitors') return context.role === 'visiteur';
  if (audience === 'pros') return context.role === 'pro';
  if (audience === 'pros_free') return context.role === 'pro' && context.plan === 'free';
  if (audience === 'pros_advanced') return context.role === 'pro' && context.plan === 'advanced';
  if (audience === 'pros_premium') return context.role === 'pro' && context.plan === 'premium';
  return false;
}

function isBroadcastActive(broadcast) {
  if (!broadcast.active) return false;
  if (broadcast.expiresAt && new Date(broadcast.expiresAt) < new Date()) return false;
  return true;
}

export function getActiveBroadcastsForUser(context = getUserBroadcastContext()) {
  const dismissed = new Set(getDismissedIds());
  return getAdminBroadcasts()
    .filter((b) => isBroadcastActive(b) && matchesBroadcastAudience(b, context) && !dismissed.has(b.id))
    .sort((a, b) => {
      const priority = { maintenance: 0, warning: 1, info: 2, success: 3 };
      const pa = priority[a.type] ?? 9;
      const pb = priority[b.type] ?? 9;
      if (pa !== pb) return pa - pb;
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

export function dismissBroadcast(broadcastId) {
  const dismissed = getDismissedIds();
  if (!dismissed.includes(broadcastId)) {
    setItem(DISMISSED_KEY, [...dismissed, broadcastId]);
  }
}

export function estimateBroadcastRecipients(audience) {
  const visitors = getAllVisitorAccounts().length;
  const pros = getAllProAccountsList();
  const prosByPlan = { free: 0, advanced: 0, premium: 0 };
  pros.forEach((p) => {
    const plan = resolveProPlan(p);
    if (prosByPlan[plan] !== undefined) prosByPlan[plan] += 1;
  });

  switch (audience) {
    case 'all': return visitors + pros.length + 1;
    case 'anonymous': return 1;
    case 'visitors': return visitors;
    case 'pros': return pros.length;
    case 'pros_free': return prosByPlan.free;
    case 'pros_advanced': return prosByPlan.advanced;
    case 'pros_premium': return prosByPlan.premium;
    default: return 0;
  }
}

export function adminCreateBroadcast({ title, message, type = 'info', audience = 'all', expiresAt = null, pinned = false, dismissible = true }) {
  const trimmedTitle = title?.trim();
  const trimmedMessage = message?.trim();
  if (!trimmedTitle || !trimmedMessage) return null;

  const isDismissible = type === 'maintenance' ? false : dismissible !== false;
  const entry = {
    id: `bc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: trimmedTitle,
    message: trimmedMessage,
    type,
    audience,
    active: true,
    pinned: Boolean(pinned),
    dismissible: isDismissible,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
    createdBy: 'admin',
  };

  const list = getAdminBroadcasts();
  list.unshift(entry);
  setItem(BROADCASTS_KEY, list);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('glist-broadcasts-updated'));
  }
  deliverBroadcastToInboxes(entry);
  if (useSupabase) {
    import('../api/supabaseBroadcasts.js').then((m) => m.createBroadcastRemote({
      title: trimmedTitle, message: trimmedMessage, type, audience,
      expiresAt: expiresAt || null, pinned: Boolean(pinned), dismissible: isDismissible,
    })).then((result) => {
      if (result?.id) {
        const updated = getAdminBroadcasts().map((b) =>
          b.id === entry.id ? { ...b, supabaseId: result.id } : b
        );
        setItem(BROADCASTS_KEY, updated);
      }
    }).catch(() => {});
  }
  import('./platformEvents.js').then((m) => m.onAdminBroadcast(trimmedTitle, audience)).catch(() => {});
  return entry;
}

/** Copie la notification admin dans la boîte de chaque utilisateur ciblé (prototype localStorage). */
function deliverBroadcastToInboxes(broadcast) {
  const context = { role: 'anonymous', plan: null, userKey: 'anonymous' };
  const targets = new Set();

  if (matchesBroadcastAudience(broadcast, context)) {
    targets.add('anonymous');
  }

  getAllVisitorAccounts().forEach((v) => {
    const ctx = { role: 'visiteur', plan: null, userKey: `visitor:${v.email}` };
    if (matchesBroadcastAudience(broadcast, ctx)) targets.add(ctx.userKey);
  });

  getAllProAccountsList().forEach((p) => {
    const plan = resolveProPlan(p);
    const ctx = { role: 'pro', plan, userKey: `pro:${p.id}` };
    if (matchesBroadcastAudience(broadcast, ctx)) targets.add(ctx.userKey);
  });

  targets.forEach((userKey) => {
    pushSystemNotification(userKey, {
      type: broadcast.type,
      title: broadcast.title,
      message: broadcast.message,
    });
  });
}

export function adminToggleBroadcast(id, active) {
  const all = getAdminBroadcasts();
  const entry = all.find((b) => b.id === id);
  const list = all.map((b) => (b.id === id ? { ...b, active } : b));
  setItem(BROADCASTS_KEY, list);
  const sid = entry?.supabaseId;
  if (useSupabase && sid) {
    import('../api/supabaseBroadcasts.js')
      .then((m) => m.updateBroadcastRemote(sid, { active }))
      .catch(() => {});
  }
  return list;
}

export function adminDeleteBroadcast(id) {
  const all = getAdminBroadcasts();
  const entry = all.find((b) => b.id === id);
  const list = all.filter((b) => b.id !== id);
  setItem(BROADCASTS_KEY, list);
  const sid = entry?.supabaseId;
  if (useSupabase && sid) {
    import('../api/supabaseBroadcasts.js')
      .then((m) => m.deleteBroadcastRemote(sid))
      .catch(() => {});
  }
  return list;
}

export function getBroadcastTypeLabel(typeId) {
  return BROADCAST_TYPES.find((t) => t.id === typeId)?.label || typeId;
}

export function getBroadcastAudienceLabel(audienceId) {
  return BROADCAST_AUDIENCES.find((a) => a.id === audienceId)?.label || audienceId;
}
