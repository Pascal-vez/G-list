import { MapPin, Loader2, X } from 'lucide-react';
import styles from './LocationBanner.module.css';

export default function LocationBanner({ location, loading, error, onRequest, onDismiss }) {
  if (location) {
    return (
      <div className={styles.active}>
        <MapPin size={16} />
        <span>Triés par proximité de votre position</span>
        <button onClick={onDismiss} className={styles.dismiss} aria-label="Désactiver">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.banner}>
      <MapPin size={18} className={styles.icon} />
      <div className={styles.text}>
        <p className={styles.title}>Trouvez les pros les plus proches</p>
        <p className={styles.sub}>{error || 'Activez votre position pour trier par distance'}</p>
      </div>
      <button onClick={onRequest} className={styles.btn} disabled={loading}>
        {loading ? <Loader2 size={16} className={styles.spin} /> : 'Activer'}
      </button>
    </div>
  );
}
