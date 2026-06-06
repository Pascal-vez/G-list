import { AlertTriangle } from 'lucide-react';
import { acknowledgePrototype } from '../utils/storage';
import styles from './PrototypeModal.module.css';

export default function PrototypeModal({ onAccept }) {
  const handleAccept = () => {
    acknowledgePrototype();
    onAccept?.();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <AlertTriangle size={32} />
        </div>
        <h2 className={styles.title}>Prototype de test</h2>
        <p className={styles.text}>
          Les informations affichées sont fictives. G-List est en phase de validation.
          Votre avis nous aide à construire la bonne plateforme.
        </p>
        <button className={styles.btn} onClick={handleAccept}>
          J'ai compris
        </button>
      </div>
    </div>
  );
}
