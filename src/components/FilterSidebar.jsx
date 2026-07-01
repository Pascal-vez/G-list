import { useState } from 'react';
import { Search, RotateCcw, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../data/constants';
import { useTranslation } from '../i18n/I18nContext';
import { categoryLabel } from '../i18n/helpers';
import LocaliteInput from './LocaliteInput';
import styles from './FilterSidebar.module.css';

const TAG_OPTIONS = [
  { id: 'verified', labelKey: 'filters.tags.verified' },
  { id: 'top', labelKey: 'filters.tags.top' },
  { id: 'available', labelKey: 'filters.tags.available' },
  { id: 'new', labelKey: 'filters.tags.new' },
  { id: 'rated', labelKey: 'filters.tags.rated' },
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
  onAddRegion,
}) {
  const { t } = useTranslation();

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
              {categoryLabel(t, c)}
              <span className={styles.chipCount}>{categoryCounts[c.name] ?? 0}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (panel === 'regions') {
    const activeRegions = filters.regions || [];
    return (
      <>
        <div className={styles.localitePicker}>
          <LocaliteInput
            value=""
            onChange={(loc) => onAddRegion(loc)}
            placeholder={t('filters.regions.addPlaceholder')}
            trackUsage
          />
        </div>
        {activeRegions.length > 0 && (
          <div className={styles.activeRegions}>
            {activeRegions.map((r) => (
              <button
                key={r}
                type="button"
                className={`${styles.chip} ${styles.chipActive}`}
                onClick={() => onToggleRegion(r)}
                title={t('filters.regions.removeTitle')}
              >
                {r}
                <span className={styles.chipCount}>×</span>
              </button>
            ))}
          </div>
        )}
        <p className={styles.regionHint}>
          {t('filters.regions.hint')}
        </p>
      </>
    );
  }

  if (panel === 'tags') {
    return TAG_OPTIONS.map((tag) => (
      <button
        key={tag.id}
        type="button"
        className={`${styles.tagBtn} ${(filters.tags || []).includes(tag.id) ? styles.tagActive : ''}`}
        onClick={() => onToggleTag(tag.id)}
      >
        {t(tag.labelKey)}
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
  const { t } = useTranslation();

  const update = (patch) => onChange({ ...filters, ...patch });

  const toggleCategory = (name) => update({ categories: toggleInArray(filters.categories || [], name) });
  const toggleRegion = (name) => update({ regions: toggleInArray(filters.regions || [], name) });
  const addRegion = (name) => {
    if (!name) return;
    const list = filters.regions || [];
    if (list.includes(name)) return;
    update({ regions: [...list, name] });
  };
  const toggleTag = (id) => update({ tags: toggleInArray(filters.tags || [], id) });
  const togglePlan = (id) => update({ plans: toggleInArray(filters.plans || [], id) });

  const groups = [
    { id: 'categories', labelKey: 'filters.groups.categories', count: filters.categories?.length || 0, hidden: hideCategory },
    { id: 'regions', labelKey: 'filters.groups.regions', count: filters.regions?.length || 0 },
    { id: 'tags', labelKey: 'filters.groups.tags', count: filters.tags?.length || 0 },
    { id: 'plan', labelKey: 'filters.groups.plan', count: filters.plans?.length || 0 },
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
    onAddRegion: addRegion,
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
            placeholder={t('filters.searchPlaceholder')}
            value={filters.search || ''}
            onChange={(e) => update({ search: e.target.value })}
            className={styles.searchInput}
            aria-label={t('filters.searchAriaLabel')}
          />
        </div>

        <div className={styles.ratingWrap}>
          <span className={styles.ratingLabel}>{t('filters.minRating.label')}</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minRatingSlider || 0}
            onChange={(e) => update({ minRatingSlider: Number(e.target.value) })}
            className={styles.slider}
            aria-label={t('filters.minRating.ariaLabel')}
          />
          <span className={styles.sliderVal}>{filters.minRatingSlider || 0} ★</span>
        </div>

        {hasActive && (
          <button type="button" className={styles.resetBtn} onClick={onReset}>
            <RotateCcw size={14} />
            {t('filters.reset')}
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
            <span className={styles.groupLabel}>{t(g.labelKey)}</span>
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
        <div className={styles.expandPanel} role="region" aria-label={t('filters.panelAriaLabel', { panel: t(`filters.groups.${activePanel}`) })}>
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
        {t('filters.title')}
        {hasActive && <span className={styles.badge}>!</span>}
      </button>

      <div className={styles.filterBar}>
        {filterContent}
      </div>

      {drawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h2>{t('filters.title')}</h2>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label={t('common.close')}>
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
