import { getCookieConsent } from '../utils/storage';

const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();

let loaded = false;

/** Charge Google Analytics 4 si l'utilisateur a accepté « Tout accepter ». */
export function initPlatformAnalytics() {
  if (!GA_ID || getCookieConsent() !== 'all' || loaded) return;
  if (document.getElementById('glist-platform-ga')) return;

  loaded = true;

  const ext = document.createElement('script');
  ext.id = 'glist-platform-ga';
  ext.async = true;
  ext.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(ext);

  const inline = document.createElement('script');
  inline.id = 'glist-platform-ga-init';
  inline.textContent = [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    "gtag('js',new Date());",
    `gtag('config','${GA_ID.replace(/'/g, '')}',{ anonymize_ip: true });`,
  ].join('');
  document.head.appendChild(inline);
}

export function isPlatformAnalyticsConfigured() {
  return Boolean(GA_ID);
}
