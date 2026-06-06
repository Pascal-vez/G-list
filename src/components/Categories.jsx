import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data/constants';
import CategoryIcon, { CATEGORY_COLORS } from './CategoryIcon';
import styles from './Categories.module.css';

export default function Categories({ categoryCounts = {} }) {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Parcourir par catégorie</h2>
      <p className={styles.subtitle}>Cliquez sur une catégorie pour voir les professionnels</p>
      <div className={styles.grid}>
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.name] ?? 0;
          const colors = CATEGORY_COLORS[cat.id] || CATEGORY_COLORS.autre;
          return (
            <button
              key={cat.id}
              type="button"
              className={styles.card}
              onClick={() => navigate(`/categorie/${cat.id}`)}
            >
              <span
                className={styles.iconWrap}
                style={{ background: colors.bg }}
              >
                <CategoryIcon
                  id={cat.id}
                  size={24}
                  className={styles.icon}
                  style={{ color: colors.color }}
                />
              </span>
              <span className={styles.name}>{cat.name}</span>
              <span className={styles.count}>{count} pro{count !== 1 ? 's' : ''}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
