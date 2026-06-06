import { useEffect, useState } from 'react';
import { X, CheckCircle, Search, Eye } from 'lucide-react';
import { hasEngagementAnswered, recordEngagement } from '../utils/storage';
import styles from './EngagementModal.module.css';

export default function EngagementModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasEngagementAnswered()) return;

    const timer = setTimeout(() => {
      if (!hasEngagementAnswered()) {
        setVisible(true);
      }
    }, 240000);

    return () => clearTimeout(timer);
  }, []);

  const handleAnswer = (answer) => {
    recordEngagement(answer);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={() => setVisible(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={() => setVisible(false)} aria-label="Fermer">
          <X size={20} />
        </button>
        <h2 className={styles.title}>
          Vous cherchez un professionnel spécifique en Guinée ?
        </h2>
        <div className={styles.buttons}>
          <button className={styles.btn} onClick={() => handleAnswer('found')}>
            <CheckCircle size={18} />
            J'ai trouvé ce que je cherche
          </button>
          <button className={styles.btn} onClick={() => handleAnswer('searching')}>
            <Search size={18} />
            Je cherche encore
          </button>
          <button className={styles.btn} onClick={() => handleAnswer('testing')}>
            <Eye size={18} />
            Je teste juste la plateforme
          </button>
        </div>
      </div>
    </div>
  );
}
