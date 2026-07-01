import { useEffect } from 'react';
import { initPlatformAnalytics } from '../utils/platformAnalytics';

/** Active GA4 plateforme après consentement cookies (performance). */
export default function PlatformAnalytics() {
  useEffect(() => {
    initPlatformAnalytics();

    const onConsent = () => initPlatformAnalytics();
    window.addEventListener('glist-cookie-consent', onConsent);
    return () => window.removeEventListener('glist-cookie-consent', onConsent);
  }, []);

  return null;
}
