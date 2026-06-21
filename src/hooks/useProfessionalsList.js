import { useEffect, useState } from 'react';
import { useSupabase } from '../lib/supabaseClient';
import { getAllProfessionals } from '../api/professionals';
import {
  subscribeProfessionalsCache,
  refreshProfessionalsCache,
  getProfessionalsCache,
  isProfessionalsCacheLoaded,
} from '../api/professionalsStore';

/** Liste annuaire — Supabase en production, réactive aux changements de comptes. */
export function useProfessionalsList() {
  const [professionals, setProfessionals] = useState(() => (
    useSupabase ? getProfessionalsCache() : getAllProfessionals()
  ));

  useEffect(() => {
    if (!useSupabase) {
      const onAccountsChanged = () => setProfessionals(getAllProfessionals());
      const onStorage = (e) => {
        if (!e.key || e.key.startsWith('glist_pro_')) onAccountsChanged();
      };
      window.addEventListener('glist-accounts-changed', onAccountsChanged);
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener('glist-accounts-changed', onAccountsChanged);
        window.removeEventListener('storage', onStorage);
      };
    }

    const unsub = subscribeProfessionalsCache(setProfessionals);

    if (!isProfessionalsCacheLoaded()) {
      refreshProfessionalsCache().catch(() => {});
    }

    const onRefresh = () => {
      refreshProfessionalsCache().catch(() => {});
    };
    window.addEventListener('glist-accounts-changed', onRefresh);

    return () => {
      unsub();
      window.removeEventListener('glist-accounts-changed', onRefresh);
    };
  }, []);

  return professionals;
}

export function useAnnuaireLoading() {
  const [loading, setLoading] = useState(useSupabase && !isProfessionalsCacheLoaded());

  useEffect(() => {
    if (!useSupabase) {
      setLoading(false);
      return undefined;
    }
    if (isProfessionalsCacheLoaded()) {
      setLoading(false);
      return undefined;
    }
    refreshProfessionalsCache()
      .catch(() => {})
      .finally(() => setLoading(false));
    return undefined;
  }, []);

  return loading;
}
