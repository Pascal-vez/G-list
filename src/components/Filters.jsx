import { BadgeCheck, MapPin, LayoutGrid, Star, RotateCcw } from 'lucide-react';
import { REGIONS, CATEGORIES } from '../data/constants';
import styles from './Filters.module.css';

function FilterField({ icon: Icon, accent, iconColor, children }) {
  return (
    <div className={styles.field}>
      <span
        className={styles.fieldIcon}
        style={{ background: accent, color: iconColor }}
        aria-hidden="true"
      >
        <Icon size={16} strokeWidth={2.2} />
      </span>
      {children}
    </div>
  );
}

export default function Filters({
  filters,
  onChange,
  onReset,
  categoryCounts = {},
  regionCounts = {},
  verifiedCount = 0,
  hideCategory = false,
}) {
  const verifiedOnly = filters.verified === 'verified';

  const hasActiveFilters =
    filters.region !== 'all' ||
    (!hideCategory && filters.category !== 'all') ||
    filters.verified !== 'all' ||
    filters.minRating !== 'all' ||
    filters.search;

  const toggleVerifiedOnly = () => {
    onChange({
      ...filters,
      verified: verifiedOnly ? 'all' : 'verified',
    });
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.verifiedToggle} ${verifiedOnly ? styles.verifiedToggleActive : ''}`}
        onClick={toggleVerifiedOnly}
        aria-pressed={verifiedOnly}
      >
        <BadgeCheck size={18} strokeWidth={2.2} />
        Profils vérifiés uniquement
        <span className={styles.verifiedCount}>({verifiedCount})</span>
      </button>

      <div className={styles.filters}>
        <FilterField icon={MapPin} accent="rgba(76, 175, 80, 0.12)" iconColor="#4CAF50">
          <select
            value={filters.region}
            onChange={(e) => onChange({ ...filters, region: e.target.value })}
            className={styles.select}
            aria-label="Filtrer par région"
          >
            <option value="all">Toutes les régions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r} ({regionCounts[r] ?? 0})
              </option>
            ))}
          </select>
        </FilterField>

        {!hideCategory && (
          <FilterField icon={LayoutGrid} accent="rgba(255, 152, 76, 0.12)" iconColor="#FF984C">
            <select
              value={filters.category}
              onChange={(e) => onChange({ ...filters, category: e.target.value })}
              className={styles.select}
              aria-label="Filtrer par catégorie"
            >
              <option value="all">Toutes les catégories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({categoryCounts[c.name] ?? 0})
                </option>
              ))}
            </select>
          </FilterField>
        )}

        <FilterField icon={BadgeCheck} accent="rgba(24, 119, 242, 0.12)" iconColor="#1877F2">
          <select
            value={filters.verified}
            onChange={(e) => onChange({ ...filters, verified: e.target.value })}
            className={styles.select}
            aria-label="Filtrer par statut de vérification"
          >
            <option value="all">Tous les profils</option>
            <option value="verified">Profils vérifiés ({verifiedCount})</option>
            <option value="unverified">Non vérifiés</option>
          </select>
        </FilterField>

        <FilterField icon={Star} accent="rgba(245, 197, 24, 0.15)" iconColor="#D4A800">
          <select
            value={filters.minRating}
            onChange={(e) => onChange({ ...filters, minRating: e.target.value })}
            className={styles.select}
            aria-label="Filtrer par note"
          >
            <option value="all">Toutes les notes</option>
            <option value="4">4+ étoiles</option>
            <option value="4.5">4.5+ étoiles</option>
          </select>
        </FilterField>
      </div>
      {hasActiveFilters && (
        <button type="button" className={styles.reset} onClick={onReset}>
          <RotateCcw size={14} aria-hidden="true" />
          Réinitialiser filtres
        </button>
      )}
    </div>
  );
}
