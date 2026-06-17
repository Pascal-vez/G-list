import { generateAllProfessionals } from '../data/generateProfessionals.js';
import { REGIONS, CATEGORIES } from '../data/constants.js';

const BASE_URL = process.env.VITE_SITE_URL || 'https://glist.gn';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, { priority, lastmod, changefreq } = {}) {
  let xml = '<url>';
  xml += `<loc>${escapeXml(loc)}</loc>`;
  if (lastmod) xml += `<lastmod>${escapeXml(lastmod)}</lastmod>`;
  if (changefreq) xml += `<changefreq>${changefreq}</changefreq>`;
  if (priority != null) xml += `<priority>${priority}</priority>`;
  xml += '</url>';
  return xml;
}

/**
 * Génère le sitemap XML.
 * @param {{ fiches?: Array<{ id: string|number, updated_at?: string }> }} options
 */
export function genererSitemap({ fiches } = {}) {
  const pagesStatiques = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/annuaire', priority: 0.9, changefreq: 'daily' },
    { url: '/a-propos', priority: 0.6, changefreq: 'monthly' },
    { url: '/contact', priority: 0.7, changefreq: 'monthly' },
    { url: '/faq', priority: 0.7, changefreq: 'monthly' },
    { url: '/plan-du-site', priority: 0.5, changefreq: 'monthly' },
  ];

  const liste = fiches ?? generateAllProfessionals();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

  pagesStatiques.forEach((p) => {
    xml += urlEntry(`${BASE_URL}${p.url}`, p);
  });

  REGIONS.forEach((region) => {
    const encoded = encodeURIComponent(region);
    xml += urlEntry(`${BASE_URL}/region/${encoded}`, { priority: 0.7, changefreq: 'weekly' });
    xml += urlEntry(`${BASE_URL}/annuaire?region=${encoded}`, { priority: 0.65, changefreq: 'weekly' });
  });

  CATEGORIES.forEach((cat) => {
    xml += urlEntry(`${BASE_URL}/categorie/${cat.id}`, { priority: 0.75, changefreq: 'weekly' });
    xml += urlEntry(`${BASE_URL}/secteur/${cat.id}`, { priority: 0.7, changefreq: 'weekly' });
  });

  liste.forEach((f) => {
    const lastmod = f.updated_at || f.updatedAt || f.createdAt;
    const lastmodIso = lastmod ? new Date(lastmod).toISOString().split('T')[0] : undefined;
    xml += urlEntry(`${BASE_URL}/profil/${f.id}`, {
      priority: 0.6,
      changefreq: 'weekly',
      lastmod: lastmodIso,
    });
  });

  xml += '</urlset>';
  return xml;
}

export { BASE_URL as SITEMAP_BASE_URL };
