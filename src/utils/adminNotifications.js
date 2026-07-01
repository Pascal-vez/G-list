import { getItem, setItem } from './storage';
import { useSupabase } from '../lib/supabaseClient';

const KEY = 'glist_admin_notifications';

export function getAdminNotifications() {
  return getItem(KEY, []);
}

export function getAdminUnreadCount() {
  return getAdminNotifications().filter((n) => !n.read).length;
}

export function pushAdminNotification({ type = 'info', title, message, link = null }) {
  const entry = {
    id: `adm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    title,
    message,
    link,
    read: false,
    createdAt: new Date().toISOString(),
  };
  const all = [entry, ...getAdminNotifications()].slice(0, 100);
  setItem(KEY, all);
  if (useSupabase) {
    import('../api/supabaseAdminAlerts.js')
      .then((m) => m.pushAdminAlertRemote({ type, title, message, link }))
      .catch(() => {});
  }
  return entry;
}

export function markAdminNotificationRead(id) {
  const all = getAdminNotifications().map((n) => (
    n.id === id ? { ...n, read: true } : n
  ));
  setItem(KEY, all);
}

export function markAllAdminNotificationsRead() {
  setItem(KEY, getAdminNotifications().map((n) => ({ ...n, read: true })));
}
