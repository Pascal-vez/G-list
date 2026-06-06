import { getOpenStatus } from '../utils/horaires';
import styles from './OpenStatusBadge.module.css';

export default function OpenStatusBadge({ horaires, className = '' }) {
  const status = getOpenStatus(horaires);

  if (status.isOpen === null) return null;

  return (
    <span
      className={`${styles.badge} ${status.isOpen ? styles.open : styles.closed} ${className}`}
      title={status.hint}
    >
      <span className={styles.dot} aria-hidden="true" />
      {status.isOpen ? 'Ouvert' : 'Fermé'}
      {status.hint && <span className={styles.hint}> · {status.hint}</span>}
    </span>
  );
}
