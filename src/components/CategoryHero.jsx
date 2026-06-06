import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CategoryIcon, { CATEGORY_COLORS } from './CategoryIcon';
import { getCategoryHero, CATEGORY_HERO_FALLBACK } from '../data/categoryHeroImages';
import styles from './CategoryHero.module.css';

export default function CategoryHero({ category, description, count }) {
  const colors = CATEGORY_COLORS[category.id] || CATEGORY_COLORS.autre;
  const hero = getCategoryHero(category.id);
  const [imgSrc, setImgSrc] = useState(hero.image);

  return (
    <header
      className={styles.hero}
      style={{
        '--cat-color': colors.color,
        '--cat-bg': colors.bg,
      }}
    >
      <img
        src={imgSrc}
        alt=""
        className={styles.bgImage}
        style={{ objectPosition: hero.position }}
        onError={() => {
          if (imgSrc !== CATEGORY_HERO_FALLBACK) {
            setImgSrc(CATEGORY_HERO_FALLBACK);
          }
        }}
        aria-hidden="true"
      />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.accentBar} aria-hidden="true" />

      <div className={styles.inner}>
        <Link to="/" className={styles.back}>
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à l&apos;accueil
        </Link>

        <div className={styles.content}>
          <span className={styles.iconWrap}>
            <CategoryIcon
              id={category.id}
              size={32}
              strokeWidth={1.75}
              style={{ color: colors.color }}
            />
          </span>

          <div className={styles.textBlock}>
            <p className={styles.eyebrow}>Catégorie · G-List</p>
            <h1 className={styles.title}>{category.name}</h1>
            <p className={styles.description}>{description}</p>

            <div className={styles.meta}>
              <span className={styles.count}>
                {count} professionnel{count !== 1 ? 's' : ''}
              </span>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.regionHint}>Partout en Guinée</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
