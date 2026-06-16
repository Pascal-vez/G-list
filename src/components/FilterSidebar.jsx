import { useState } from 'react';
import { Search, RotateCcw, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { REGIONS, CATEGORIES } from '../data/constants';
import styles from './FilterSidebar.module.css';

const TAG_OPTIONS = [
  { id: 'verified', label: 'Vérifié' },
  { id: 'top', label: 'Top G-List' },
  { id: 'available', label: 'Disponible maintenant' },
  { id: 'new', label: 'Nouveau' },
  { id: 'rated', label: 'Bien noté' },
];

const PLAN_OPTIONS = [
  { id: 'free', label: 'Free' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'premium', label: 'Premium' },
];

function toggleInArray(arr, val) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function FilterPanelContent({
  panel,
  filters,
  categoryCounts,
  regionCounts,
  onToggleCategory,
  onToggleRegion,
  onToggleTag,
  onTogglePlan,
}) {
  if (panel === 'categories') {
    return (
      <>
        {CATEGORIES.map((c) => {
          const active = (filters.categories || []).includes(c.name);
          return (
            <button
              key={c.id}
              type="button"
              className={`${styles.chip} ${active ? styles.chipActive : ''}`}
              onClick={() => onToggleCategory(c.name)}
            >
              {c.name}
              <span className={styles.chipCount}>{categoryCounts[c.name] ?? 0}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (panel === 'regions') {
    return REGIONS.map((r) => {
      const active = (filters.regions || []).includes(r);
      return (
        <button
          key={r}
          type="button"
          className={`${styles.chip} ${active ? styles.chipActive : ''}`}
          onClick={() => onToggleRegion(r)}
        >
          {r}
          <span className={styles.chipCount}>{regionCounts[r] ?? 0}</span>
        </button>
      );
    });
  }

  if (panel === 'tags') {
    return TAG_OPTIONS.map((t) => (
      <button
        key={t.id}
        type="button"
        className={`${styles.tagBtn} ${(filters.tags || []).includes(t.id) ? styles.tagActive : ''}`}
        onClick={() => onToggleTag(t.id)}
      >
        {t.label}
      </button>
    ));
  }

  if (panel === 'plan') {
    return PLAN_OPTIONS.map((p) => (
      <button
        key={p.id}
        type="button"
        className={`${styles.tagBtn} ${(filters.plans || []).includes(p.id) ? styles.tagActive : ''}`}
        onClick={() => onTogglePlan(p.id)}
      >
        {p.label}
      </button>
    ));
  }

  return null;
}

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  categoryCounts = {},
  regionCounts = {},
  hideCategory = false,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  const update = (patch) => onChange({ ...filters, ...patch });

  const toggleCategory = (name) => update({ categories: toggleInArray(filters.categories || [], name) });
  const toggleRegion = (name) => update({ regions: toggleInArray(filters.regions || [], name) });
  const toggleTag = (id) => update({ tags: toggleInArray(filters.tags || [], id) });
  const togglePlan = (id) => update({ plans: toggleInArray(filters.plans || [], id) });

  const groups = [
    { id: 'categories', label: 'Catégories', count: filters.categories?.length || 0, hidden: hideCategory },
    { id: 'regions', label: 'Villes', count: filters.regions?.length || 0 },
    { id: 'tags', label: 'Tags', count: filters.tags?.length || 0 },
    { id: 'plan', label: 'Plan', count: filters.plans?.length || 0 },
  ].filter((g) => !g.hidden);

  const hasActive =
    filters.search ||
    (filters.categories?.length > 0) ||
    (filters.regions?.length > 0) ||
    (filters.tags?.length > 0) ||
    (filters.plans?.length > 0) ||
    (filters.minRatingSlider > 0) ||
    filters.region !== 'all' ||
    filters.verified !== 'all';

  const togglePanel = (id) => {
    setActivePanel((prev) => (prev === id ? null : id));
  };

  const panelProps = {
    filters,
    categoryCounts,
    regionCounts,
    onToggleCategory: toggleCategory,
    onToggleRegion: toggleRegion,
    onToggleTag: toggleTag,
    onTogglePlan: togglePlan,
  };

  const filterContent = (
    <div className={styles.filterInner}>
      <div className={styles.topRow}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="search"
            placeholder="Rechercher..."
            value={filters.search || ''}
            onChange={(e) => update({ search: e.target.value })}
            className={styles.searchInput}
            aria-label="Recherche texte libre"
          />
        </div>

        <div className={styles.ratingWrap}>
          <span className={styles.ratingLabel}>Note min.</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minRatingSlider || 0}
            onChange={(e) => update({ minRatingSlider: Number(e.target.value) })}
            className={styles.slider}
            aria-label="Note minimum"
          />
          <span className={styles.sliderVal}>{filters.minRatingSlider || 0} ★</span>
        </div>

        {hasActive && (
          <button type="button" className={styles.resetBtn} onClick={onReset}>
            <RotateCcw size={14} />
            Réinitialiser
          </button>
        )}
      </div>

      <div className={styles.groupsRow}>
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`${styles.groupTab} ${activePanel === g.id ? styles.groupTabActive : ''}`}
            onClick={() => togglePanel(g.id)}
            aria-expanded={activePanel === g.id}
          >
            <span className={styles.groupLabel}>{g.label}</span>
            {g.count > 0 && <span className={styles.tabBadge}>{g.count}</span>}
            <ChevronDown
              size={14}
              className={`${styles.tabChevron} ${activePanel === g.id ? styles.tabChevronOpen : ''}`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      {activePanel && (
        <div className={styles.expandPanel} role="region" aria-label={`Filtres ${activePanel}`}>
          <div className={styles.expandScroll}>
            <FilterPanelContent panel={activePanel} {...panelProps} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        type="button"
        className={styles.mobileToggle}
        onClick={() => setDrawerOpen(true)}
      >
        <SlidersHorizontal size={18} />
        Filtres
        {hasActive && <span className={styles.badge}>!</span>}
      </button>

      <div className={styles.filterBar}>
        {filterContent}
      </div>

      {drawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h2>Filtres</h2>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
}
