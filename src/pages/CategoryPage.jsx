import { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import CategoryHero from '../components/CategoryHero';
import FilterSidebar from '../components/FilterSidebar';
import ProCard from '../components/ProCard';
import LocationBanner from '../components/LocationBanner';
import { useProfessionalsList } from '../hooks/useProfessionalsList';
import { getCategoryById, CATEGORY_DESCRIPTIONS } from '../data/constants';
import { filterProfessionals, getCategoryCounts, getRegionCounts } from '../utils/helpers';
import { sortByDistance } from '../utils/geo';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePageMeta } from '../hooks/usePageMeta';
import { useTranslation } from '../i18n/I18nContext';
import { categoryDescription, categoryLabel } from '../i18n/helpers';
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
  const { t } = useTranslation();
  const category = getCategoryById(id);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { location, error, loading, requestLocation, clearLocation } = useGeolocation();

  const professionals = useProfessionalsList();
  const categoryCounts = useMemo(() => getCategoryCounts(professionals), [professionals.length]);
  const regionCounts = useMemo(() => getRegionCounts(professionals), [professionals.length]);
  const categoryName = category?.name ?? '';
  const description = category
    ? categoryDescription(t, category.id, CATEGORY_DESCRIPTIONS[category.id] || CATEGORY_DESCRIPTIONS.autre)
    : '';

  usePageMeta({
    title: category ? categoryLabel(t, category) : undefined,
    description: description || t('category.meta.fallbackDescription'),
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
              {t(filtered.length === 1 ? 'category.results.count' : 'category.results.count_plural', { count: filtered.length })}
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
                <p>{t('category.empty.message')}</p>
                {hasActiveFilters && (
                  <button type="button" className={styles.resetLink} onClick={() => setFilters(DEFAULT_FILTERS)}>
                    {t('filters.resetAll')}
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
