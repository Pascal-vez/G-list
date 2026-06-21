import { getItem, setItem, KEYS } from './storage';
import { getActiveBroadcastsForUser } from './adminBroadcasts';
import { getUserBroadcastContext } from './adminBroadcasts';

export function getInboxMessages(context = getUserBroadcastContext()) {
  const userKey = context.userKey || 'anonymous';
  const readIds = new Set(getItem(KEYS.NOTIFICATION_READ, {})[userKey] || []);
  const system = getItem(KEYS.SYSTEM_NOTIFICATIONS, {})[userKey] || [];
  const broadcasts = getActiveBroadcastsForUser(context).map((b) => ({
    id: b.id,
    source: 'admin',
    type: b.type,
    title: b.title,
    message: b.message,
    timestamp: b.createdAt,
    read: readIds.has(b.id),
    dismissible: b.dismissible !== false,
  }));
  const personal = system.map((n) => ({
    ...n,
    source: 'system',
    read: readIds.has(n.id),
  }));
  return [...broadcasts, ...personal]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function getUnreadCount(context = getUserBroadcastContext()) {
  return getInboxMessages(context).filter((m) => !m.read).length;
}

export function markInboxRead(messageId, context = getUserBroadcastContext()) {
  const userKey = context.userKey || 'anonymous';
  const all = getItem(KEYS.NOTIFICATION_READ, {});
  const ids = new Set(all[userKey] || []);
  ids.add(messageId);
  all[userKey] = [...ids];
  setItem(KEYS.NOTIFICATION_READ, all);
}

export function markAllInboxRead(context = getUserBroadcastContext()) {
  const userKey = context.userKey || 'anonymous';
  const ids = getInboxMessages(context).map((m) => m.id);
  const all = getItem(KEYS.NOTIFICATION_READ, {});
  all[userKey] = [...new Set([...(all[userKey] || []), ...ids])];
  setItem(KEYS.NOTIFICATION_READ, all);
}

export function pushSystemNotification(userKey, { type = 'info', title, message }) {
  const all = getItem(KEYS.SYSTEM_NOTIFICATIONS, {});
  const entry = {
    id: `sys_${Date.now()}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    dismissible: true,
  };
  all[userKey] = [entry, ...(all[userKey] || [])].slice(0, 50);
  setItem(KEYS.SYSTEM_NOTIFICATIONS, all);
  return entry;
}

/** Notification in-app pour un compte pro (clé `pro:{id}`) */
export function notifyProInbox(proId, payload) {
  if (!proId) return null;
  return pushSystemNotification(`pro:${proId}`, payload);
}
