import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { REGIONS, CATEGORIES } from '../data/constants';
import { useProfessionalsList } from '../hooks/useProfessionalsList';
import { useTranslation } from '../i18n/I18nContext';
import { formatLocaleNumber } from '../i18n/helpers';
import styles from './FirstVisit.module.css';

export default function FirstVisit({ onExplore }) {
  const { t, locale } = useTranslation();
  const professionals = useProfessionalsList();
  const proCount = professionals.length;

  const features = useMemo(() => {
    const items = [
      t('firstVisit.feature.cities', { count: REGIONS.length }),
      t('firstVisit.feature.categories', { count: CATEGORIES.length }),
    ];
    if (proCount > 0) {
      items.push(t('firstVisit.feature.pros', { count: formatLocaleNumber(proCount, locale) }));
    } else {
      items.push(t('firstVisit.feature.verified'));
    }
    return items;
  }, [proCount, t, locale]);

  return (
    <div className={styles.screen}>
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.logo}>
          <span className={styles.logoG}>G</span>
          <span className={styles.logoList}>-List</span>
        </p>

        <span className={styles.badge}>{t('firstVisit.badge')}</span>

        <h1 className={`${styles.title} hero-display`}>{t('firstVisit.title')}</h1>
        <p className={styles.subtitle}>{t('firstVisit.subtitle')}</p>

        <p className={styles.intro}>{t('firstVisit.intro')}</p>

        <ul className={styles.features}>
          {features.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>

        <button type="button" className={styles.primaryBtn} onClick={onExplore}>
          <ArrowRight size={18} aria-hidden="true" />
          {t('firstVisit.cta')}
        </button>

        <footer className={styles.footer}>
          <p>{t('firstVisit.footer.once')}</p>
          <p>{t('firstVisit.footer.copyright', { year: new Date().getFullYear() })}</p>
        </footer>
      </div>
    </div>
  );
}
