import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CategoryIcon, { CATEGORY_COLORS } from './CategoryIcon';
import { getCategoryHero, CATEGORY_HERO_FALLBACK } from '../data/categoryHeroImages';
import { useTranslation } from '../i18n/I18nContext';
import { categoryLabel, categoryDescription } from '../i18n/helpers';
import styles from './CategoryHero.module.css';

export default function CategoryHero({ category, description, count }) {
  const { t } = useTranslation();
  const colors = CATEGORY_COLORS[category.id] || CATEGORY_COLORS.autre;
  const hero = getCategoryHero(category.id);
  const [imgSrc, setImgSrc] = useState(hero.image);
  const localizedDescription = categoryDescription(t, category.id, description);
  const localizedName = categoryLabel(t, category);

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
          {t('category.backHome')}
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
            <p className={styles.eyebrow}>{t('category.eyebrow')}</p>
            <h1 className={`${styles.title} hero-display`}>{localizedName}</h1>
            <p className={styles.description}>{localizedDescription}</p>

            <div className={styles.meta}>
              <span className={styles.count}>
                {t(count === 1 ? 'category.proCount' : 'category.proCount_plural', { count })}
              </span>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.regionHint}>{t('category.regionHint')}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
