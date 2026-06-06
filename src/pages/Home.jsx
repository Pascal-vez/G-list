import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, SearchX } from 'lucide-react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import Filters from '../components/Filters';
import ProCard from '../components/ProCard';
import LocationBanner from '../components/LocationBanner';
import professionals from '../data/professionals';
import { CATEGORIES } from '../data/constants';
import { filterProfessionals, getCategoryCounts, getRegionCounts, getVerifiedCount } from '../utils/helpers';
import { sortByDistance } from '../utils/geo';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSyncHomeFiltersUrl } from '../hooks/useSyncHomeFiltersUrl';
import styles from './Home.module.css';

const DEFAULT_FILTERS = {
  search: '',
  region: 'all',
  category: 'all',
  verified: 'all',
  minRating: 'all',
};

function isDefaultFilters(f) {
  return (
    !f.search &&
    f.region === 'all' &&
    f.category === 'all' &&
    f.verified === 'all' &&
    f.minRating === 'all'
  );
}

function filtersFromSearchParams(searchParams) {
  return {
    ...DEFAULT_FILTERS,
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    region: searchParams.get('region') || 'all',
    verified: searchParams.get('verified') || 'all',
    minRating: searchParams.get('rating') || 'all',
  };
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const syncFiltersUrl = useSyncHomeFiltersUrl();

  const [filters, setFilters] = useState(() => filtersFromSearchParams(searchParams));

  const [hasChosenFilter, setHasChosenFilter] = useState(() => {
    const search = searchParams.get('search') || '';
    const region = searchParams.get('region') || 'all';
    const verified = searchParams.get('verified') || 'all';
    const minRating = searchParams.get('rating') || 'all';
    return !!(
      search
      || region !== 'all'
      || verified !== 'all'
      || minRating !== 'all'
      || window.location.hash === '#professionals'
    );
  });

  const [resultsVisible, setResultsVisible] = useState(true);

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

    if (search || region !== 'all' || verified !== 'all' || minRating !== 'all') {
      setHasChosenFilter(true);
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (routeLocation.hash === '#professionals') {
      setHasChosenFilter(true);
    }
  }, [routeLocation.hash]);

  const categoryCounts = useMemo(() => getCategoryCounts(professionals), []);
  const regionCounts = useMemo(() => getRegionCounts(professionals), []);
  const verifiedCount = useMemo(() => getVerifiedCount(professionals), []);

  const filtered = useMemo(() => {
    const results = filterProfessionals(professionals, filters);
    if (location) {
      return sortByDistance(results, location.lat, location.lng);
    }
    return results;
  }, [filters, location]);

  const handleSearch = (query) => {
    const next = { ...filters, search: query };
    setHasChosenFilter(true);
    setResultsVisible(true);
    setFilters(next);
    syncFiltersUrl(next, '#professionals');
  };

  const handleFiltersChange = (next) => {
    setHasChosenFilter(true);
    setResultsVisible(true);
    setFilters(next);
    syncFiltersUrl(next, window.location.hash || '#professionals');
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setHasChosenFilter(false);
    setResultsVisible(true);
    navigate({ pathname: '/', hash: '' }, { replace: true });
  };

  return (
    <>
      <div className={styles.heroShell}>
        <Hero onSearch={handleSearch} />
      </div>

      <div className={styles.homeBody}>
        <div id="categories" className={styles.categoriesWrap}>
          <Categories categoryCounts={categoryCounts} />
        </div>
        <section id="professionals" className={styles.section}>
        <h2 className={styles.title}>Professionnels disponibles</h2>

        <LocationBanner
          location={location}
          loading={loading}
          error={error}
          onRequest={requestLocation}
          onDismiss={clearLocation}
        />

        <div id="regions">
        <Filters
          filters={filters}
          onChange={handleFiltersChange}
          onReset={handleReset}
          categoryCounts={categoryCounts}
          regionCounts={regionCounts}
          verifiedCount={verifiedCount}
        />
        </div>

        {!hasChosenFilter ? (
          <div className={styles.prompt}>
            <p>Sélectionnez une catégorie ou un filtre pour afficher les professionnels.</p>
          </div>
        ) : (
          <>
            <div className={styles.resultsBar}>
              <p className={styles.count}>
                {filtered.length} professionnel{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
                {location && ' · triés par proximité'}
              </p>
              <button
                type="button"
                className={styles.toggleResults}
                onClick={() => setResultsVisible((v) => !v)}
                aria-expanded={resultsVisible}
              >
                {resultsVisible ? (
                  <>
                    <ChevronUp size={18} aria-hidden />
                    Masquer les résultats
                  </>
                ) : (
                  <>
                    <ChevronDown size={18} aria-hidden />
                    Afficher les résultats
                  </>
                )}
              </button>
            </div>

            {resultsVisible && (
              filtered.length > 0 ? (
                <div className={styles.grid}>
                  {filtered.map((pro) => (
                    <ProCard key={pro.id} pro={pro} userLocation={location} />
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  <SearchX size={40} className={styles.emptyIcon} aria-hidden="true" />
                  <p>Aucun professionnel trouvé pour ces critères. Essayez d&apos;élargir votre recherche ou de changer de région.</p>
                  {!isDefaultFilters(filters) && (
                    <button className={styles.resetLink} onClick={handleReset}>
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )
            )}
          </>
        )}
        </section>
      </div>
    </>
  );
}
