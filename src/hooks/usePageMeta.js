import { useEffect } from 'react';

const SITE_NAME = 'G-List';
const DEFAULT_DESCRIPTION = 'G-List — L\'annuaire professionnel de référence en Guinée. Trouvez médecins, artisans, restaurants et services près de chez vous.';
const BASE_URL = import.meta.env.VITE_SITE_URL || 'https://g-list.gn';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(data) {
  const id = 'glist-jsonld';
  let el = document.getElementById(id);
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function usePageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = '/images/og-default.svg',
  type = 'website',
  jsonLd = null,
  noIndex = false,
} = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Annuaire professionnel Guinée`;
    const url = `${BASE_URL}${path}`;

    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', `${BASE_URL}${image}`);
    upsertMeta('property', 'og:locale', 'fr_GN');
    upsertMeta('property', 'og:site_name', SITE_NAME);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', `${BASE_URL}${image}`);

    upsertLink('canonical', url);
    upsertJsonLd(jsonLd);

    return () => upsertJsonLd(null);
  }, [title, description, path, image, type, jsonLd, noIndex]);
}

export { BASE_URL, DEFAULT_DESCRIPTION, SITE_NAME };
