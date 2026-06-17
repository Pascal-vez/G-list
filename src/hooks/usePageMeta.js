/**
 * @deprecated Préférez le composant <SeoHead />.
 * Réexporte la config SEO pour compatibilité.
 */
export { default as SeoHead } from '../components/SEO/SeoHead';
export {
  SEO_BASE_URL as BASE_URL,
  SEO_DEFAULT_DESCRIPTION as DEFAULT_DESCRIPTION,
  ORGANIZATION_JSON_LD,
} from '../utils/seoConfig';

export const SITE_NAME = 'G-List';
