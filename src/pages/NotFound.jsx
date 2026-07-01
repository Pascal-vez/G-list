import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useTranslation } from '../i18n/I18nContext';
import styles from './NotFound.module.css';

export default function NotFound() {
  const { t } = useTranslation();
  usePageMeta({
    title: t('notFound.title'),
    description: t('notFound.meta.description'),
    path: '/404',
    noIndex: true,
  });

  return (
    <div className={styles.page}>
      <span className={styles.code}>404</span>
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.message')}</p>
      <div className={styles.actions}>
        <Link to="/" className="btn-primary"><Home size={18} /> {t('nav.home')}</Link>
        <Link to="/annuaire" className={styles.secondary}><Search size={18} /> {t('nav.directory')}</Link>
      </div>
    </div>
  );
}
