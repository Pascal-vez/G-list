import { Link } from 'react-router-dom';
import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';
import { CATEGORIES, REGIONS } from '../data/constants';
import { SITE_NAV_LINKS, SITE_INFO_LINKS, DRAWER_EXTRA_ITEMS } from '../data/siteNav';
import { useTranslation } from '../i18n/I18nContext';

export default function PlanDuSite() {
  const { t } = useTranslation();

  usePageMeta({
    title: 'Plan du site',
    description: 'Plan du site G-List — toutes les pages et catégories.',
    path: '/plan-du-site',
  });

  const pages = [
    ...SITE_NAV_LINKS,
    ...DRAWER_EXTRA_ITEMS,
    ...SITE_INFO_LINKS,
    { labelKey: 'nav.contact', to: '/contact' },
    { labelKey: 'nav.faq', to: '/faq' },
    { labelKey: 'nav.cookies', to: '/cookies' },
    { labelKey: 'nav.legal', to: '/mentions-legales' },
    { labelKey: 'nav.sitemap', to: '/plan-du-site' },
    { labelKey: 'nav.terms', to: '/conditions' },
  ];

  return (
    <InfoPageLayout title="Plan du site" subtitle="Navigation complète" pageKey="apropos">
      <InfoSection title="Pages principales">
        <ul>
          {pages.map(({ labelKey, to }) => (
            <li key={`${labelKey}-${to}`}><Link to={to}>{t(labelKey)}</Link></li>
          ))}
        </ul>
      </InfoSection>
      <InfoSection title="Catégories">
        <ul>
          {CATEGORIES.map((c) => (
            <li key={c.id}><Link to={`/categorie/${c.id}`}>{c.name}</Link></li>
          ))}
        </ul>
      </InfoSection>
      <InfoSection title="Villes">
        <ul>
          {REGIONS.map((r) => (
            <li key={r}>
              <Link to={`/annuaire?region=${encodeURIComponent(r)}`}>{r}</Link>
            </li>
          ))}
        </ul>
      </InfoSection>
    </InfoPageLayout>
  );
}
