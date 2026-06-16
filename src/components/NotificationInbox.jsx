import { useState } from 'react';
import { Bell, CheckCheck, Wrench, AlertTriangle, Info, PartyPopper } from 'lucide-react';
import { getInboxMessages, markInboxRead, markAllInboxRead } from '../utils/notificationInbox';
import { dismissBroadcast } from '../utils/adminBroadcasts';
import styles from './NotificationInbox.module.css';

const TYPE_ICONS = { maintenance: Wrench, warning: AlertTriangle, info: Info, success: PartyPopper };

export default function NotificationInbox({ onUpdate }) {
  const [messages, setMessages] = useState(() => getInboxMessages());

  const refresh = () => {
    setMessages(getInboxMessages());
    onUpdate?.();
  };

  const handleRead = (id) => {
    markInboxRead(id);
    refresh();
  };

  const handleDismiss = (msg) => {
    if (msg.source === 'admin') dismissBroadcast(msg.id);
    markInboxRead(msg.id);
    refresh();
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
          <button type="button" className={styles.markAll} onClick={() => { markAllInboxRead(); refresh(); }}>
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
                <div className={styles.body} onClick={() => handleRead(msg.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleRead(msg.id)}>
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
