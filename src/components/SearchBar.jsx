import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Médecin, plombier, restaurant...',
  ariaLabel = 'Rechercher',
  className = '',
}) {
  return (
    <div className={`${styles.wrap} ${className}`.trim()}>
      <form className={styles.bar} onSubmit={onSubmit}>
        <div className={styles.field}>
          <Search size={18} className={styles.icon} aria-hidden="true" />
          <input
            type="search"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={styles.input}
            aria-label={ariaLabel}
          />
        </div>
        <button type="submit" className={styles.btn}>
          <Search size={15} strokeWidth={2.5} aria-hidden="true" />
          Rechercher
        </button>
      </form>
    </div>
  );
}
