import { useEffect } from 'react';
import { useSupabase } from '../lib/supabaseClient';
import { getVisitorKey, setItem, KEYS } from '../utils/storage';

/**
 * Synchronise les favoris Supabase → localStorage une fois au montage.
 * Les composants qui lisent les favoris via isFavorite/getFavorites restent synchrones
 * tout en bénéficiant de la persistance cross-device.
 */
export function useFavoritesSync() {
  useEffect(() => {
    if (!useSupabase) return;
    let cancelled = false;
    (async () => {
      try {
        const { fetchFavorites } = await import('../api/supabaseFavorites.js');
        const visitorKey = getVisitorKey();
        const remote = await fetchFavorites(visitorKey);
        if (cancelled || !Array.isArray(remote)) return;
        const local = JSON.parse(localStorage.getItem(KEYS.FAVORITES) || '[]');
        const merged = [...new Set([...local, ...remote])];
        setItem(KEYS.FAVORITES, merged);
      } catch { /* réseau indisponible → localStorage suffit */ }
    })();
    return () => { cancelled = true; };
  }, []);
}
