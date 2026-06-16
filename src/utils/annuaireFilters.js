export const DEFAULT_ANNUAIRE_FILTERS = {
  search: '',
  region: 'all',
  category: 'all',
  verified: 'all',
  minRating: 'all',
  categories: [],
  regions: [],
  tags: [],
  plans: [],
  minRatingSlider: 0,
};

export function isDefaultAnnuaireFilters(f) {
  return (
    !f.search &&
    f.region === 'all' &&
    f.category === 'all' &&
    f.verified === 'all' &&
    f.minRating === 'all' &&
    !(f.categories?.length) &&
    !(f.regions?.length) &&
    !(f.tags?.length) &&
    !(f.plans?.length) &&
    !f.minRatingSlider
  );
}

export function filtersFromSearchParams(searchParams) {
  return {
    ...DEFAULT_ANNUAIRE_FILTERS,
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    region: searchParams.get('region') || 'all',
    verified: searchParams.get('verified') || 'all',
    minRating: searchParams.get('rating') || 'all',
  };
}
