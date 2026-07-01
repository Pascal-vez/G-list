import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Wrench, AlertTriangle, Info, PartyPopper } from 'lucide-react';
import { getInboxMessages, markInboxRead, markAllInboxRead } from '../utils/notificationInbox';
import { dismissBroadcast } from '../utils/adminBroadcasts';
import { getProAccount } from '../utils/storage';
import { useSupabase } from '../lib/supabaseClient';
import styles from './NotificationInbox.module.css';

const TYPE_ICONS = { maintenance: Wrench, warning: AlertTriangle, info: Info, success: PartyPopper };

function normalizeRemote(n) {
  return {
    id: `supabase_${n.id}`,
    supabaseId: n.id,
    source: 'system',
    type: n.type || 'info',
    title: n.title,
    message: n.message,
    timestamp: n.created_at,
    read: !!n.read_at,
    dismissible: true,
  };
}

export default function NotificationInbox({ onUpdate }) {
  const [messages, setMessages] = useState(() => getInboxMessages());
  const [remoteIds, setRemoteIds] = useState(new Set());

  const loadRemote = useCallback(async () => {
    const account = getProAccount();
    if (!useSupabase || !account?.id) return;
    try {
      const { fetchProNotificationsRemote } = await import('../api/supabaseProNotifications.js');
      const result = await fetchProNotificationsRemote(account.id);
      if (!result?.notifications) return;
      const remote = result.notifications.map(normalizeRemote);
      const ids = new Set(remote.map((r) => r.supabaseId));
      setRemoteIds(ids);
      setMessages((prev) => {
        const localOnly = prev.filter((m) => !m.supabaseId);
        const merged = [...remote, ...localOnly]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return merged;
      });
    } catch { /* réseau indispo → localStorage suffit */ }
  }, []);

  useEffect(() => { loadRemote(); }, [loadRemote]);

  const refresh = useCallback(() => {
    setMessages(getInboxMessages());
    onUpdate?.();
    loadRemote();
  }, [loadRemote, onUpdate]);

  const handleRead = async (msg) => {
    if (msg.supabaseId) {
      try {
        const { markProNotificationReadRemote } = await import('../api/supabaseProNotifications.js');
        await markProNotificationReadRemote(msg.supabaseId);
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
      } catch { /* ignore */ }
    } else {
      markInboxRead(msg.id);
      refresh();
    }
  };

  const handleDismiss = async (msg) => {
    if (msg.source === 'admin') dismissBroadcast(msg.id);
    if (msg.supabaseId) {
      try {
        const { markProNotificationReadRemote } = await import('../api/supabaseProNotifications.js');
        await markProNotificationReadRemote(msg.supabaseId);
      } catch { /* ignore */ }
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    } else {
      markInboxRead(msg.id);
      refresh();
    }
  };

  const handleMarkAll = async () => {
    const account = getProAccount();
    if (useSupabase && account?.id && remoteIds.size > 0) {
      try {
        const { markAllProNotificationsReadRemote } = await import('../api/supabaseProNotifications.js');
        await markAllProNotificationsReadRemote(account.id);
      } catch { /* ignore */ }
    }
    markAllInboxRead();
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    onUpdate?.();
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className={styles.inbox}>
      <div className={styles.inboxHead}>
        <Bell size={18} />
        <div>
          <strong>Centre de notifications</strong>
          <span>{unread} non lue{unread > 1 ? 's' : ''}</span>
        </div>
        {unread > 0 && (
          <button type="button" className={styles.markAll} onClick={handleMarkAll}>
            <CheckCheck size={14} /> Tout marquer lu
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        <p className={styles.empty}>Aucune notification pour le moment.</p>
      ) : (
        <div className={styles.list}>
          {messages.map((msg) => {
            const Icon = TYPE_ICONS[msg.type] || Info;
            return (
              <article key={msg.id} className={`${styles.item} ${!msg.read ? styles.unread : ''} ${styles[msg.type] || ''}`}>
                <Icon size={16} className={styles.icon} />
                <div className={styles.body} onClick={() => handleRead(msg)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleRead(msg)}>
                  <strong>{msg.title}</strong>
                  <p>{msg.message}</p>
                  <time>{new Date(msg.timestamp).toLocaleString('fr-FR')}</time>
                </div>
                {msg.dismissible !== false && (
                  <button type="button" className={styles.dismiss} onClick={() => handleDismiss(msg)} aria-label="Masquer">×</button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
