import { useState } from 'react';
import { Link } from 'react-router-dom';
import { hasCookieConsent, setCookieConsent } from '../utils/storage';
import { useTranslation } from '../i18n/I18nContext';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !hasCookieConsent());
  const { t } = useTranslation();

  if (!visible) return null;

  const accept = (level) => {
    setCookieConsent(level);
    window.dispatchEvent(new CustomEvent('glist-cookie-consent', { detail: level }));
    setVisible(false);
  };

  return (
    <div className={styles.banner} role="dialog" aria-label="Consentement cookies">
      <div className={styles.inner}>
        <p>
          {t('cookie.message')}
          {' '}
          <Link to="/cookies">{t('cookie.learnMore')}</Link>
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.essential} onClick={() => accept('essential')}>
            {t('cookie.essential')}
          </button>
          <button type="button" className={styles.accept} onClick={() => accept('all')}>
            {t('cookie.acceptAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
