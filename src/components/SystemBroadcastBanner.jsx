import { useState, useEffect, useCallback } from 'react';
import { X, Wrench, AlertTriangle, Info, PartyPopper } from 'lucide-react';
import { getActiveBroadcastsForUser, dismissBroadcast } from '../utils/adminBroadcasts';
import styles from './SystemBroadcastBanner.module.css';

const TYPE_ICONS = {
  maintenance: Wrench,
  warning: AlertTriangle,
  info: Info,
  success: PartyPopper,
};

export default function SystemBroadcastBanner() {
  const [broadcasts, setBroadcasts] = useState(() => getActiveBroadcastsForUser());

  const refresh = useCallback(() => {
    setBroadcasts(getActiveBroadcastsForUser());
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e) => {
      if (!e.key || e.key.includes('broadcast')) refresh();
    };
    window.addEventListener('storage', onStorage);
    const interval = setInterval(refresh, 30000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, [refresh]);

  const handleDismiss = (id) => {
    dismissBroadcast(id);
    refresh();
  };

  if (broadcasts.length === 0) return null;

  return (
    <div className={styles.stack} role="region" aria-label="Annonces G-List">
      {broadcasts.map((b) => {
        const Icon = TYPE_ICONS[b.type] || Info;
        return (
          <div key={b.id} className={`${styles.banner} ${styles[b.type] || styles.info}`}>
            <Icon size={18} className={styles.icon} aria-hidden="true" />
            <div className={styles.body}>
              <strong>{b.title}</strong>
              <p>{b.message}</p>
            </div>
            {b.dismissible !== false && (
              <button
                type="button"
                className={styles.dismiss}
                onClick={() => handleDismiss(b.id)}
                aria-label="Fermer cette annonce"
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
