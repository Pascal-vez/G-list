import { Sparkles, X } from 'lucide-react';
import styles from './WelcomeToast.module.css';

export default function WelcomeToast({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className={styles.toast} role="status">
      <Sparkles size={18} className={styles.icon} aria-hidden="true" />
      <p>{message}</p>
      <button type="button" className={styles.close} onClick={onDismiss} aria-label="Fermer">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
