import { Link } from 'react-router-dom';
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
        <h2 className={styles.title}>Bienvenue sur G-List</h2>
        <p className={styles.text}>
          En continuant, vous acceptez nos{' '}
          <Link to="/conditions" onClick={handleAccept}>conditions d&apos;utilisation</Link>
          {' '}et notre{' '}
          <Link to="/confidentialite" onClick={handleAccept}>politique de confidentialité</Link>.
        </p>
        <button type="button" className={styles.btn} onClick={handleAccept}>
          J&apos;accepte et je continue
        </button>
      </div>
    </div>
  );
}
