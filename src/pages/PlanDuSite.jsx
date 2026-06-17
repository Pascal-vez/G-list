import { Link } from 'react-router-dom';
import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import SeoHead from '../components/SEO/SeoHead';
import { CATEGORIES, REGIONS } from '../data/constants';
import { SITE_NAV_LINKS, SITE_INFO_LINKS, DRAWER_EXTRA_ITEMS } from '../data/siteNav';

export default function PlanDuSite() {
  const pages = [
    ...SITE_NAV_LINKS,
    ...DRAWER_EXTRA_ITEMS.filter((i) => i.label !== 'Admin'),
    ...SITE_INFO_LINKS,
    { label: 'Contact', to: '/contact' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Cookies', to: '/cookies' },
    { label: 'Mentions légales', to: '/mentions-legales' },
    { label: 'Plan du site', to: '/plan-du-site' },
    { label: 'Mot de passe oublié', to: '/mot-de-passe-oublie' },
  ];

  return (
    <>
      <SeoHead
        titre="Plan du site"
        description="Plan du site G-List — toutes les pages et catégories."
        url="/plan-du-site"
      />
    <InfoPageLayout title="Plan du site" subtitle="Navigation complète" pageKey="apropos">
      <InfoSection title="Pages principales">
        <ul>
          {pages.map(({ label, to }) => (
            <li key={label}><Link to={to}>{label}</Link></li>
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
            <li key={r}><Link to={`/annuaire?region=${encodeURIComponent(r)}`}>{r}</Link></li>
          ))}
        </ul>
      </InfoSection>
    </InfoPageLayout>
    </>
  );
}
