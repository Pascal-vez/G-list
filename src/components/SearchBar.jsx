import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Médecin, plombier, restaurant...',
  ariaLabel = 'Rechercher',
  className = '',
  variant = 'dark',
}) {
  const barClass = [
    styles.bar,
    variant === 'light' ? styles.barLight : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.wrap} ${className}`.trim()}>
      <form className={barClass} onSubmit={onSubmit}>
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={styles.input}
          aria-label={ariaLabel}
        />
        <button type="submit" className={styles.btn}>
          <Search size={16} strokeWidth={2.5} aria-hidden="true" />
          Rechercher
        </button>
      </form>
    </div>
  );
}
