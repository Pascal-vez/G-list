import { Search } from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import styles from './SearchBar.module.css';

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  ariaLabel,
  className = '',
}) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('search.placeholder');
  const resolvedAriaLabel = ariaLabel ?? t('search.ariaLabel');
  return (
    <div className={`${styles.wrap} ${className}`.trim()}>
      <form className={styles.bar} onSubmit={onSubmit}>
        <input
          type="search"
          placeholder={resolvedPlaceholder}
          value={value}
          onChange={onChange}
          className={styles.input}
          aria-label={resolvedAriaLabel}
        />
        <button type="submit" className={styles.btn}>
          <Search size={16} strokeWidth={2.5} aria-hidden="true" />
          <span className={styles.btnText}>{t('search.submit')}</span>
        </button>
      </form>
    </div>
  );
}
