import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SearchX } from 'lucide-react';
import Filters from '../components/FilterSidebar';
import ProCard from '../components/ProCard';
import LocationBanner from '../components/LocationBanner';
import { useProfessionalsList } from '../hooks/useProfessionalsList';
import { CATEGORIES } from '../data/constants';
import { filterProfessionals, getCategoryCounts, getRegionCounts } from '../utils/helpers';
import { sortByDistance } from '../utils/geo';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSyncAnnuaireFiltersUrl } from '../hooks/useSyncHomeFiltersUrl';
import { addSearchHistory } from '../utils/storage';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  DEFAULT_ANNUAIRE_FILTERS,
  isDefaultAnnuaireFilters,
  filtersFromSearchParams,
} from '../utils/annuaireFilters';
import SearchBar from '../components/SearchBar';
import { useTranslation } from '../i18n/I18nContext';
import styles from './Annuaire.module.css';

export default function Annuaire() {
  const { t } = useTranslation();
  usePageMeta({
    title: t('annuaire.meta.title'),
    description: t('annuaire.meta.description'),
    path: '/annuaire',
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const syncFiltersUrl = useSyncAnnuaireFiltersUrl();

  const [filters, setFilters] = useState(() => filtersFromSearchParams(searchParams));
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');

  const { location, error, loading, requestLocation, clearLocation } = useGeolocation();

  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const region = searchParams.get('region') || 'all';
    const verified = searchParams.get('verified') || 'all';
    const minRating = searchParams.get('rating') || 'all';

    if (category !== 'all') {
      const cat = CATEGORIES.find((c) => c.name === category);
      if (cat) {
        const qs = search ? `?search=${encodeURIComponent(search)}` : '';
        navigate(`/categorie/${cat.id}${qs}`, { replace: true });
        return;
      }
    }

    setSearchInput(search);
    setFilters((f) => {
      if (
        f.search === search
        && f.category === category
        && f.region === region
        && f.verified === verified
        && f.minRating === minRating
      ) return f;
      return { ...f, search, category, region, verified, minRating };
    });
  }, [searchParams, navigate]);

  const professionals = useProfessionalsList();
  const categoryCounts = useMemo(() => getCategoryCounts(professionals), [professionals.length]);
  const regionCounts = useMemo(() => getRegionCounts(professionals), [professionals.length]);

  const filtered = useMemo(() => {
    const results = filterProfessionals(professionals, filters);
    if (location) {
      return sortByDistance(results, location.lat, location.lng);
    }
    return results;
  }, [filters, location, professionals]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    const next = { ...filters, search: q };
    setFilters(next);
    if (q) addSearchHistory(q);
    syncFiltersUrl(next);
  };

  const handleFiltersChange = (next) => {
    setFilters(next);
    if (next.search !== searchInput) setSearchInput(next.search || '');
    syncFiltersUrl(next);
  };

  const handleReset = () => {
    setFilters(DEFAULT_ANNUAIRE_FILTERS);
    setSearchInput('');
    navigate('/annuaire', { replace: true });
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{t('annuaire.eyebrow')}</p>
          <h1 className={`${styles.heroTitle} hero-display`}>{t('annuaire.title')}</h1>
          <p className={styles.heroSubtitle}>
            {t('annuaire.subtitle', { count: professionals.length })}
          </p>
          <SearchBar
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSubmit={handleSearchSubmit}
            ariaLabel={t('search.ariaLabelDirectory')}
          />
        </div>
      </header>

      <section className={styles.section}>
        <LocationBanner
          location={location}
          loading={loading}
          error={error}
          onRequest={requestLocation}
          onDismiss={clearLocation}
        />

        <div className={styles.annuaireLayout}>
          <Filters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleReset}
            categoryCounts={categoryCounts}
            regionCounts={regionCounts}
          />

          <div className={styles.resultsArea}>
            <p className={styles.count}>
              {t(filtered.length === 1 ? 'annuaire.results.count' : 'annuaire.results.count_plural', { count: filtered.length })}
              {location && t('annuaire.results.sortedByProximity')}
            </p>

            {filtered.length > 0 ? (
              <div className={styles.grid}>
                {filtered.map((pro) => (
                  <ProCard key={pro.id} pro={pro} userLocation={location} />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <SearchX size={40} className={styles.emptyIcon} aria-hidden="true" />
                <p>{t('annuaire.empty.message')}</p>
                {!isDefaultAnnuaireFilters(filters) && (
                  <button type="button" className={styles.resetLink} onClick={handleReset}>
                    {t('filters.resetAll')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
