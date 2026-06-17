export const SEO_BASE_URL = import.meta.env.VITE_SITE_URL || 'https://glist.gn';

export const SEO_DEFAULT_TITLE = "G-List — L'annuaire professionnel de Guinée";

export const SEO_DEFAULT_DESCRIPTION =
  'G-List référence les professionnels, commerces et structures dans les 14 '
  + 'régions de Guinée. Trouvez et contactez directement via WhatsApp.';

export const SEO_DEFAULT_IMAGE = '/og-image-default.jpg';

export function toAbsoluteUrl(path = '') {
  if (!path) return SEO_BASE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SEO_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'G-List',
  url: SEO_BASE_URL,
  description:
    'Annuaire professionnel référençant les commerces et professionnels '
    + 'dans les 14 régions de Guinée',
  areaServed: 'GN',
};
