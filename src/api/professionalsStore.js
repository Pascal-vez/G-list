import { useSupabase } from '../lib/supabaseClient';
import {
  fetchAnnuaireFromSupabase,
  fetchAnnuaireProfessionalById,
} from './supabaseProfessionals';

let cache = [];
let hiddenCache = [];
let loadingPromise = null;
let loaded = false;

const listeners = new Set();

function notify() {
  listeners.forEach((fn) => {
    try { fn(cache); } catch { /* ignore */ }
  });
}

export function subscribeProfessionalsCache(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProfessionalsCache() {
  return cache;
}

export function getProfessionalsHiddenCache() {
  return hiddenCache;
}

export function isProfessionalsCacheLoaded() {
  return loaded;
}

/** Recharge l'annuaire depuis Supabase (source de vérité en production). */
export async function refreshProfessionalsCache({ includeHidden = false } = {}) {
  if (!useSupabase) {
    loaded = true;
    return cache;
  }

  if (loadingPromise && !includeHidden) {
    return loadingPromise;
  }

  const run = async () => {
    const [publicList, hiddenList] = await Promise.all([
      fetchAnnuaireFromSupabase({ includeHidden: false }),
      includeHidden ? fetchAnnuaireFromSupabase({ includeHidden: true }) : Promise.resolve(hiddenCache),
    ]);
    cache = publicList;
    if (includeHidden) hiddenCache = hiddenList;
    loaded = true;
    notify();
    return cache;
  };

  if (includeHidden) {
    return run();
  }

  loadingPromise = run().finally(() => {
    loadingPromise = null;
  });
  return loadingPromise;
}

export function invalidateProfessionalsCache() {
  loaded = false;
  return refreshProfessionalsCache();
}

export async function fetchProfessionalFromCloudById(id) {
  if (!useSupabase) return null;
  const cached = cache.find((p) => String(p.id) === String(id));
  if (cached) return cached;
  const pro = await fetchAnnuaireProfessionalById(id);
  if (pro && !cache.some((p) => String(p.id) === String(pro.id))) {
    cache = [...cache, pro];
    notify();
  }
  return pro;
}

// Prefetch au chargement du module (annuaire prêt plus vite)
if (useSupabase) {
  refreshProfessionalsCache().catch(() => {});
}
