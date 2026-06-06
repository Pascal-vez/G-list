import { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import CategoryHero from '../components/CategoryHero';
import Filters from '../components/Filters';
import ProCard from '../components/ProCard';
import LocationBanner from '../components/LocationBanner';
import professionals from '../data/professionals';
import {
  getCategoryById,
  CATEGORY_DESCRIPTIONS,
} from '../data/constants';
import {
  filterProfessionals,
  getCategoryCounts,
  getRegionCounts,
  getVerifiedCount,
} from '../utils/helpers';
import { sortByDistance } from '../utils/geo';
import { useGeolocation } from '../hooks/useGeolocation';
import styles from './CategoryPage.module.css';

const DEFAULT_FILTERS = {
  search: '',
  region: 'all',
  verified: 'all',
  minRating: 'all',
};

export default function CategoryPage() {
  const { id } = useParams();
  const category = getCategoryById(id);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { location, error, loading, requestLocation, clearLocation } = useGeolocation();

  const categoryCounts = useMemo(() => getCategoryCounts(professionals), []);
  const regionCounts = useMemo(() => getRegionCounts(professionals), []);
  const verifiedCount = useMemo(() => getVerifiedCount(professionals), []);

  const categoryName = category?.name ?? '';

  const filtered = useMemo(() => {
    if (!categoryName) return [];
    const results = filterProfessionals(professionals, {
      ...filters,
      category: categoryName,
    });
    if (location) {
      return sortByDistance(results, location.lat, location.lng);
    }
    return results;
  }, [filters, location, categoryName]);

  if (!category) {
    return <Navigate to="/" replace />;
  }

  const description = CATEGORY_DESCRIPTIONS[category.id] || CATEGORY_DESCRIPTIONS.autre;
  const totalInCategory = categoryCounts[category.name] ?? 0;

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    filters.region !== 'all' ||
    filters.verified !== 'all' ||
    filters.minRating !== 'all' ||
    filters.search;

  return (
    <>
      <CategoryHero
        category={category}
        description={description}
        count={totalInCategory}
      />

      <section className={styles.section}>
        <LocationBanner
          location={location}
          loading={loading}
          error={error}
          onRequest={requestLocation}
          onDismiss={clearLocation}
        />

        <Filters
          filters={{ ...filters, category: category.name }}
          onChange={(next) => setFilters({ ...next, category: category.name })}
          onReset={handleReset}
          categoryCounts={categoryCounts}
          regionCounts={regionCounts}
          verifiedCount={verifiedCount}
          hideCategory
        />

        <p className={styles.count}>
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
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
            <p>Aucun professionnel trouvé pour ces critères. Essayez d&apos;élargir votre recherche ou de changer de région.</p>
            {hasActiveFilters && (
              <button type="button" className={styles.resetLink} onClick={handleReset}>
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </section>
    </>
  );
}
