import { useState, useEffect, useCallback } from 'react';
import { X, Wrench, AlertTriangle, Info, PartyPopper } from 'lucide-react';
import { getActiveBroadcastsForUser, dismissBroadcast } from '../utils/adminBroadcasts';
import { getVisitorKey } from '../utils/storage';
import { useSupabase } from '../lib/supabaseClient';
import styles from './SystemBroadcastBanner.module.css';

const TYPE_ICONS = {
  maintenance: Wrench,
  warning: AlertTriangle,
  info: Info,
  success: PartyPopper,
};

function localBroadcasts() {
  return getActiveBroadcastsForUser();
}

export default function SystemBroadcastBanner() {
  const [broadcasts, setBroadcasts] = useState(() => localBroadcasts());

  const refresh = useCallback(async () => {
    if (useSupabase) {
      try {
        const { fetchActiveBroadcasts } = await import('../api/supabaseBroadcasts.js');
        const visitorKey = getVisitorKey();
        const remote = await fetchActiveBroadcasts(visitorKey, null);
        if (Array.isArray(remote) && remote.length > 0) {
          setBroadcasts(remote);
          return;
        }
      } catch { /* fall through to localStorage */ }
    }
    setBroadcasts(localBroadcasts());
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e) => {
      if (!e.key || e.key.includes('broadcast')) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('glist-broadcasts-updated', refresh);
    const interval = setInterval(refresh, 30000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('glist-broadcasts-updated', refresh);
      clearInterval(interval);
    };
  }, [refresh]);

  const handleDismiss = useCallback((id) => {
    dismissBroadcast(id);
    if (useSupabase) {
      const visitorKey = getVisitorKey();
      import('../api/supabaseBroadcasts.js')
        .then((m) => m.dismissBroadcastRemote(visitorKey, id))
        .catch(() => {});
    }
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  }, []);

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
