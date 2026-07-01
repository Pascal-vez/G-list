import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data/constants';
import { useProfessionalsList } from '../hooks/useProfessionalsList';
import { useTranslation } from '../i18n/I18nContext';
import { categoryLabel, formatLocaleNumber } from '../i18n/helpers';
import SearchBar from './SearchBar';
import HeroConnection from './hero/HeroConnection';
import styles from './Hero.module.css';

const QUICK_CATEGORIES = ['sante', 'juridique', 'restaurants', 'plomberie', 'coiffure', 'btp'];

export default function Hero() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const professionals = useProfessionalsList();
  const proCount = professionals.length;
  const [isMobileSearch, setIsMobileSearch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobileSearch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/annuaire?search=${encodeURIComponent(q)}`);
  };

  const handleQuickCategory = (catId) => {
    navigate(`/categorie/${catId}`);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.auroraBackground} aria-hidden="true">
        <div className={`${styles.auroraShape} ${styles.shape1}`} />
        <div className={`${styles.auroraShape} ${styles.shape2}`} />
        <div className={`${styles.auroraShape} ${styles.shape3}`} />
        <HeroConnection />
      </div>
      <div className={styles.inner}>
        <h1 className={`${styles.title} hero-display`}>
          <span className={styles.titleLine1}>{t('hero.title.line1')}</span>
          <span className={styles.titleLine2}>
            {t('hero.title.line2Prefix')}{' '}
            <span className={styles.titleAccent}>{t('hero.title.accent')}</span>
          </span>
          <span className={styles.titleLine3}>{t('hero.title.line3')}</span>
        </h1>
        <p className={styles.subtitle}>
          {t('hero.subtitle', { count: formatLocaleNumber(proCount, locale) })}
        </p>

        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSubmit={handleSubmit}
          placeholder={isMobileSearch ? t('search.placeholderMobile') : undefined}
          ariaLabel={t('search.ariaLabelPro')}
          className={styles.searchWrap}
        />

        <div className={styles.quickLinks}>
          {QUICK_CATEGORIES.map((id) => {
            const cat = CATEGORIES.find((c) => c.id === id);
            if (!cat) return null;
            return (
              <button
                key={id}
                type="button"
                className={styles.quickPill}
                onClick={() => handleQuickCategory(id)}
              >
                {categoryLabel(t, cat).split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
