import { useEffect, useState } from 'react';
import { useSupabase } from '../lib/supabaseClient';
import { getProfessionalById, loadProfessionalById } from '../api/professionals';
import { subscribeProfessionalsCache } from '../api/professionalsStore';

/** Fiche pro par id legacy — charge depuis Supabase si nécessaire. */
export function useProfessionalById(id) {
  const numericId = Number(id);
  const [pro, setPro] = useState(() => getProfessionalById(numericId));
  const [loading, setLoading] = useState(useSupabase && !getProfessionalById(numericId));

  useEffect(() => {
    if (!id || !Number.isFinite(numericId)) {
      setPro(null);
      setLoading(false);
      return undefined;
    }

    if (!useSupabase) {
      setPro(getProfessionalById(numericId));
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const cached = getProfessionalById(numericId);
    if (cached) {
      setPro(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    loadProfessionalById(numericId).then((result) => {
      if (!cancelled) {
        setPro(result);
        setLoading(false);
      }
    });

    const unsub = subscribeProfessionalsCache((list) => {
      const found = list.find((p) => p.id === numericId);
      if (found) setPro(found);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [id, numericId]);

  return { pro, loading };
}
