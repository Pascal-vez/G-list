import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../lib/supabaseClient';
import { fetchReviewsByLegacy } from '../api/supabaseReviews';
import { getProReviews } from '../utils/storage';

export function useProReviews(proId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(Boolean(proId));

  const reload = useCallback(async () => {
    if (!proId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (useSupabase) {
        setReviews(await fetchReviewsByLegacy(proId));
      } else {
        setReviews(getProReviews(proId));
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [proId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { reviews, loading, reload, setReviews };
}
