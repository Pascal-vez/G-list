import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Search, SearchX } from 'lucide-react';
import Filters from '../components/FilterSidebar';
import ProCard from '../components/ProCard';
import LocationBanner from '../components/LocationBanner';
import { getAllProfessionals } from '../api/professionals';
import { CATEGORIES } from '../data/constants';
import { filterProfessionals, getCategoryCounts, getRegionCounts } from '../utils/helpers';
import { sortByDistance } from '../utils/geo';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSyncAnnuaireFiltersUrl } from '../hooks/useSyncHomeFiltersUrl';
import { addSearchHistory } from '../utils/storage';
import SeoHead from '../components/SEO/SeoHead';
import {
  DEFAULT_ANNUAIRE_FILTERS,
  isDefaultAnnuaireFilters,
  filtersFromSearchParams,
} from '../utils/annuaireFilters';
import SearchBar from '../components/SearchBar';
import styles from './Annuaire.module.css';

export default function Annuaire() {
  const { nomRegion } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const syncFiltersUrl = useSyncAnnuaireFiltersUrl();

  const [filters, setFilters] = useState(() => filtersFromSearchParams(searchParams));
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');

  const { location, error, loading, requestLocation, clearLocation } = useGeolocation();

  const regionFromRoute = nomRegion ? decodeURIComponent(nomRegion) : null;
  const activeRegion = regionFromRoute
    || (filters.region !== 'all' ? filters.region : null);

  useEffect(() => {
    if (!regionFromRoute) return;
    setFilters((f) => ({ ...f, region: regionFromRoute }));
  }, [regionFromRoute]);

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

  const professionals = getAllProfessionals();
  const categoryCounts = useMemo(() => getCategoryCounts(professionals), [professionals.length]);
  const regionCounts = useMemo(() => getRegionCounts(professionals), [professionals.length]);

  const filtered = useMemo(() => {
    const results = filterProfessionals(professionals, filters);
    if (location) {
      return sortByDistance(results, location.lat, location.lng);
    }
    return results;
  }, [filters, location]);

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
      {activeRegion ? (
        <SeoHead
          titre={`Professionnels à ${activeRegion}`}
          description={`Découvrez tous les professionnels et commerces référencés à ${activeRegion} sur G-List, l'annuaire de la Guinée.`}
          url={regionFromRoute ? `/region/${encodeURIComponent(activeRegion)}` : `/annuaire?region=${encodeURIComponent(activeRegion)}`}
        />
      ) : (
        <SeoHead
          titre="Annuaire des professionnels"
          description="Parcourez les professionnels et structures référencés sur G-List par région, secteur d'activité et spécialité en Guinée."
          url="/annuaire"
        />
      )}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>G-List · Guinée</p>
          <h1 className={`${styles.heroTitle} hero-display`}>Annuaire professionnel</h1>
          <p className={styles.heroSubtitle}>
            {professionals.length} professionnels référencés — trouvez et contactez le bon expert partout en Guinée.
          </p>
          <SearchBar
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSubmit={handleSearchSubmit}
            ariaLabel="Rechercher dans l'annuaire"
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
              {filtered.length} professionnel{filtered.length !== 1 ? 's' : ''}
              {location && ' · triés par proximité'}
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
                <p>Aucun professionnel trouvé pour ces critères. Essayez d&apos;élargir votre recherche ou de changer de ville.</p>
                {!isDefaultAnnuaireFilters(filters) && (
                  <button type="button" className={styles.resetLink} onClick={handleReset}>
                    Réinitialiser les filtres
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
