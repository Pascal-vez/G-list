import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../data/constants';
import CategoryIcon, { CATEGORY_COLORS } from './CategoryIcon';
import styles from './Categories.module.css';

export default function Categories({ categoryCounts = {}, limit, layout = 'grid' }) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const isHorizontal = layout === 'horizontal';
  const visibleCats = isHorizontal && !showAll
    ? CATEGORIES.slice(0, limit || 8)
    : CATEGORIES;

  return (
    <section className={`${styles.section} ${isHorizontal ? styles.sectionHorizontal : ''}`}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>
            {isHorizontal ? 'Parcourir par spécialité' : 'Parcourir par catégorie'}
          </h2>
          {!isHorizontal && (
            <p className={styles.subtitle}>Cliquez sur une catégorie pour voir les professionnels</p>
          )}
        </div>
        {isHorizontal && !showAll && CATEGORIES.length > (limit || 8) && (
          <button type="button" className={styles.seeAll} onClick={() => setShowAll(true)}>
            Voir toutes les spécialités
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={`${styles.grid} ${isHorizontal ? styles.gridHorizontal : ''}`}>
        {visibleCats.map((cat) => {
          const count = categoryCounts[cat.name] ?? 0;
          const colors = CATEGORY_COLORS[cat.id] || CATEGORY_COLORS.autre;
          return (
            <button
              key={cat.id}
              type="button"
              className={`${styles.card} ${isHorizontal ? styles.cardHorizontal : ''}`}
              onClick={() => navigate(`/categorie/${cat.id}`)}
            >
              <span
                className={styles.iconWrap}
                style={{ background: colors.bg }}
              >
                <CategoryIcon
                  id={cat.id}
                  size={isHorizontal ? 20 : 24}
                  className={styles.icon}
                  style={{ color: colors.color }}
                />
              </span>
              <span className={styles.textCol}>
                <span className={styles.name}>{cat.name}</span>
                <span className={styles.count}>{count} pro{count !== 1 ? 's' : ''}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
