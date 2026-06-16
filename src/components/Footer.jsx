import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { CATEGORIES, REGIONS } from '../data/constants';
import { SITE_NAV_LINKS, SITE_INFO_LINKS } from '../data/siteNav';
import CategoryIcon, { CATEGORY_COLORS } from './CategoryIcon';
import Logo from './Logo';
import SiteNavLink from './SiteNavLink';
import ScrollToTopLink from './ScrollToTopLink';
import styles from './Footer.module.css';

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com/glistgn', Icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com/glistgn', Icon: Instagram },
  { label: 'WhatsApp', href: 'https://wa.me/224626419331', Icon: WhatsAppIcon },
  { label: 'YouTube', href: 'https://youtube.com/@glistgn', Icon: Youtube },
];

const LEGAL_FOOTER_LINKS = [
  { label: 'Confidentialité', to: '/confidentialite' },
  { label: 'Conditions', to: '/conditions' },
  { label: 'Admin', to: '/admin-glist-2026' },
];

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Footer() {
  const topCategories = CATEGORIES.slice(0, 8);

  return (
    <footer className={styles.footer}>
      <div className={styles.topAccent} aria-hidden="true" />

      <div className={styles.main}>
        <div className={styles.grid}>
          <div className={styles.colBrand}>
            <Link to="/" className={styles.logoLink}>
              <Logo />
            </Link>
            <p className={styles.brandSlogan}>Tous les pros de Guinée, au même endroit</p>
            <p className={styles.brandDesc}>
              G-List est l&apos;annuaire professionnel de référence en Guinée. Trouvez et
              contactez les meilleurs professionnels près de chez vous.
            </p>
            <div className={styles.socials}>
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className={styles.socialBtn}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
            <span className={styles.guineaBadge}>
              <span aria-hidden="true">🇬🇳</span>
              Fait pour la Guinée
            </span>
          </div>

          <nav className={styles.colNav} aria-label="Navigation du site">
            <h3 className={styles.sectionTitle}>Navigation</h3>
            <ul className={styles.linkList}>
              {SITE_NAV_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <SiteNavLink to={to} className={styles.navLink}>
                    <span>{label}</span>
                    <ArrowRight size={13} className={styles.linkArrow} aria-hidden="true" />
                  </SiteNavLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.colInfo} aria-label="Informations légales">
            <h3 className={styles.sectionTitle}>Informations</h3>
            <ul className={styles.linkList}>
              {SITE_INFO_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className={styles.navLink}>
                    <span>{label}</span>
                    <ArrowRight size={13} className={styles.linkArrow} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.colCategories} aria-label="Catégories">
            <h3 className={styles.sectionTitle}>Catégories</h3>
            <ul className={styles.linkList}>
              {topCategories.map((cat) => {
                const colors = CATEGORY_COLORS[cat.id] || CATEGORY_COLORS.autre;
                return (
                  <li key={cat.id}>
                    <ScrollToTopLink to={`/categorie/${cat.id}`} className={styles.categoryLink}>
                      <span
                        className={styles.categoryIcon}
                        style={{ background: colors.bg, color: colors.color }}
                      >
                        <CategoryIcon id={cat.id} size={13} strokeWidth={2} />
                      </span>
                      <span>{cat.name}</span>
                    </ScrollToTopLink>
                  </li>
                );
              })}
            </ul>
            <ScrollToTopLink to="/annuaire" className={styles.seeAllLink}>
              Voir toutes les catégories
              <ArrowRight size={14} aria-hidden="true" />
            </ScrollToTopLink>
          </nav>

          <div className={styles.colContact}>
            <h3 className={styles.sectionTitle}>Contact</h3>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}><MapPin size={15} aria-hidden="true" /></span>
                <span>Conakry, République de Guinée</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}><Phone size={15} aria-hidden="true" /></span>
                <a href="https://wa.me/224626419331" target="_blank" rel="noopener noreferrer">
                  +224 626 41 93 31
                </a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}><Mail size={15} aria-hidden="true" /></span>
                <a href="mailto:contact@g-list.gn">contact@g-list.gn</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}><Clock size={15} aria-hidden="true" /></span>
                <span>Lun – Sam · 8h – 18h</span>
              </li>
            </ul>

            <div className={styles.ctaGroup}>
              <Link to="/espace-pro" className={styles.joinLink}>
                Créer mon espace pro
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link to="/contact" className={styles.feedbackBtn}>
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.regionsBand}>
        <div className={styles.regionsInner}>
          <div className={styles.regionsHead}>
            <MapPin size={14} aria-hidden="true" />
            <span className={styles.regionsLabel}>Villes couvertes</span>
          </div>
          <div className={styles.regionsScroll}>
            <div className={styles.regionsPills}>
              {REGIONS.map((region) => (
                <SiteNavLink
                  key={region}
                  to={`/annuaire?region=${encodeURIComponent(region)}`}
                  className={styles.regionPill}
                >
                  {region}
                </SiteNavLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.copyrightBar}>
        <p className={styles.copyrightText}>
          © {new Date().getFullYear()} G-List — Annuaire professionnel Guinée
        </p>
        <nav className={styles.legalLinks} aria-label="Liens légaux">
          {LEGAL_FOOTER_LINKS.map(({ label, to }) => (
            <Link key={label} to={to}>{label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
