import { useState } from 'react';
import { Link } from 'react-router-dom';
import { hasCookieConsent, setCookieConsent } from '../utils/storage';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !hasCookieConsent());

  if (!visible) return null;

  const accept = (level) => {
    setCookieConsent(level);
    setVisible(false);
  };

  return (
    <div className={styles.banner} role="dialog" aria-label="Consentement cookies">
      <div className={styles.inner}>
        <p>
          G-List utilise des cookies essentiels au fonctionnement du site et, avec votre accord,
          des cookies d&apos;analyse pour améliorer l&apos;expérience.
          {' '}
          <Link to="/cookies">En savoir plus</Link>
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.essential} onClick={() => accept('essential')}>
            Essentiels uniquement
          </button>
          <button type="button" className={styles.accept} onClick={() => accept('all')}>
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
