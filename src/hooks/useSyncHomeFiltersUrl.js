import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function buildFilterSearchParams(filters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category !== 'all') params.set('category', filters.category);
  if (filters.region !== 'all') params.set('region', filters.region);
  if (filters.verified !== 'all') params.set('verified', filters.verified);
  if (filters.minRating !== 'all') params.set('rating', filters.minRating);
  return params;
}

export function useSyncAnnuaireFiltersUrl(pathname = '/annuaire') {
  const navigate = useNavigate();

  return useCallback((filters) => {
    const params = buildFilterSearchParams(filters);
    const search = params.toString();

    navigate(
      {
        pathname,
        search: search ? `?${search}` : '',
      },
      { replace: true, preventScrollReset: true },
    );
  }, [navigate, pathname]);
}

/** @deprecated Utiliser useSyncAnnuaireFiltersUrl */
export const useSyncHomeFiltersUrl = useSyncAnnuaireFiltersUrl;
