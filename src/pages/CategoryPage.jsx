import { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import CategoryHero from '../components/CategoryHero';
import FilterSidebar from '../components/FilterSidebar';
import ProCard from '../components/ProCard';
import LocationBanner from '../components/LocationBanner';
import { getAllProfessionals } from '../api/professionals';
import { getCategoryById, CATEGORY_DESCRIPTIONS } from '../data/constants';
import { filterProfessionals, getCategoryCounts, getRegionCounts } from '../utils/helpers';
import { sortByDistance } from '../utils/geo';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePageMeta } from '../hooks/usePageMeta';
import styles from './CategoryPage.module.css';

const DEFAULT_FILTERS = {
  search: '',
  region: 'all',
  verified: 'all',
  minRating: 'all',
  categories: [],
  regions: [],
  tags: [],
  plans: [],
  minRatingSlider: 0,
};

export default function CategoryPage() {
  const { id } = useParams();
  const category = getCategoryById(id);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { location, error, loading, requestLocation, clearLocation } = useGeolocation();

  const professionals = getAllProfessionals();
  const categoryCounts = useMemo(() => getCategoryCounts(professionals), [professionals.length]);
  const regionCounts = useMemo(() => getRegionCounts(professionals), [professionals.length]);
  const categoryName = category?.name ?? '';
  const description = category
    ? (CATEGORY_DESCRIPTIONS[category.id] || CATEGORY_DESCRIPTIONS.autre)
    : '';

  usePageMeta({
    title: category?.name,
    description: description || 'Professionnels par catégorie en Guinée',
    path: category ? `/categorie/${category.id}` : undefined,
  });

  const filtered = useMemo(() => {
    if (!categoryName) return [];
    const results = filterProfessionals(professionals, { ...filters, category: categoryName });
    if (location) return sortByDistance(results, location.lat, location.lng);
    return results;
  }, [filters, location, categoryName]);

  if (!category) return <Navigate to="/" replace />;

  const totalInCategory = categoryCounts[category.name] ?? 0;

  const hasActiveFilters =
    filters.region !== 'all' || filters.verified !== 'all' || filters.minRating !== 'all' ||
    filters.search || filters.regions?.length || filters.tags?.length || filters.plans?.length || filters.minRatingSlider;

  return (
    <>
      <CategoryHero category={category} description={description} count={totalInCategory} />
      <section className={styles.section}>
        <LocationBanner location={location} loading={loading} error={error} onRequest={requestLocation} onDismiss={clearLocation} />
        <div className={styles.annuaireLayout}>
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            categoryCounts={categoryCounts}
            regionCounts={regionCounts}
            hideCategory
          />
          <div className={styles.resultsArea}>
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
                <p>Aucun professionnel trouvé pour ces critères.</p>
                {hasActiveFilters && (
                  <button type="button" className={styles.resetLink} onClick={() => setFilters(DEFAULT_FILTERS)}>
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
