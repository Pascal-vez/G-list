import { MapPin, Loader2, X } from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import styles from './LocationBanner.module.css';

export default function LocationBanner({ location, loading, error, onRequest, onDismiss }) {
  const { t } = useTranslation();
  const errorMessage = error ? t(`location.error.${error}`) : null;

  if (location) {
    return (
      <div className={styles.active}>
        <MapPin size={16} />
        <span>{t('location.active.label')}</span>
        <button onClick={onDismiss} className={styles.dismiss} aria-label={t('location.disable')}>
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.banner}>
      <MapPin size={18} className={styles.icon} />
      <div className={styles.text}>
        <p className={styles.title}>{t('location.banner.title')}</p>
        <p className={styles.sub}>{errorMessage || t('location.banner.subtitle')}</p>
      </div>
      <button onClick={onRequest} className={styles.btn} disabled={loading}>
        {loading ? <Loader2 size={16} className={styles.spin} /> : t('location.banner.activate')}
      </button>
    </div>
  );
}
