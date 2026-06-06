import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';
import { CATEGORIES, REGIONS } from '../data/constants';
import { SITE_NAV_LINKS, SITE_INFO_LINKS } from '../data/siteNav';
import CategoryIcon, { CATEGORY_COLORS } from './CategoryIcon';
import Logo from './Logo';
import SiteNavLink from './SiteNavLink';
import ScrollToTopLink from './ScrollToTopLink';
import styles from './Footer.module.css';

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com', Icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com', Icon: Instagram },
  { label: 'WhatsApp', href: 'https://wa.me/224626419331', Icon: WhatsAppIcon },
  { label: 'YouTube', href: 'https://youtube.com', Icon: Youtube },
];

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function openFeedbackWidget() {
  document.querySelector('button[aria-label="Feedback"]')?.click();
}

export default function Footer() {
  const topCategories = CATEGORIES.slice(0, 8);

  return (
    <footer className={styles.footer}>
      {/* Zone 1 — CTA */}
      <div className={styles.ctaBand}>
        <div className={styles.ctaText}>
          <h2 className={styles.ctaTitle}>Vous êtes professionnel en Guinée ?</h2>
          <p className={styles.ctaSubtitle}>
            Rejoignez G-List et soyez visible par des milliers de clients partout en Guinée.
          </p>
        </div>
        <Link to="/espace-pro" className={styles.ctaBtn}>
          Rejoindre G-List
        </Link>
      </div>

      {/* Zone 2 — Footer principal */}
      <div className={styles.main}>
        <div className={styles.grid}>
          {/* Colonne 1 — Brand */}
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
                  <Icon size={18} />
                </a>
              ))}
            </div>
            <span className={styles.guineaBadge}>
              <span aria-hidden="true">🇬🇳</span>
              Fait pour la Guinée
            </span>
          </div>

          {/* Colonne 2 — Navigation */}
          <nav className={styles.colNav} aria-label="Navigation du site">
            <h3 className={styles.sectionTitle}>Navigation</h3>
            <ul className={styles.linkList}>
              {SITE_NAV_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <SiteNavLink to={to} className={styles.navLink}>
                    {label}
                  </SiteNavLink>
                </li>
              ))}
            </ul>
            <h3 className={styles.sectionTitleSub}>Informations</h3>
            <ul className={styles.linkList}>
              {SITE_INFO_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className={styles.navLink}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Colonne 3 — Catégories */}
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
                        <CategoryIcon id={cat.id} size={14} strokeWidth={2} />
                      </span>
                      {cat.name}
                    </ScrollToTopLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Colonne 4 — Contact */}
          <div className={styles.colContact}>
            <h3 className={styles.sectionTitle}>Contact &amp; Infos</h3>
            <ul className={styles.contactList}>
              <li>
                <MapPin size={15} aria-hidden="true" />
                Conakry, République de Guinée
              </li>
              <li>
                <Phone size={15} aria-hidden="true" />
                WhatsApp : +224 626 41 93 31
              </li>
              <li>
                <Mail size={15} aria-hidden="true" />
                contact@g-list.gn
              </li>
              <li>
                <Clock size={15} aria-hidden="true" />
                Lun – Sam · 8h – 18h
              </li>
            </ul>

            <div className={styles.prototypeBlock}>
              <p className={styles.prototypeTitle}>Prototype</p>
              <p className={styles.prototypeText}>
                Version de démonstration à des fins de validation. Les données affichées
                sont fictives et ne constituent pas un service commercial actif.
              </p>
            </div>

            <button type="button" className={styles.feedbackBtn} onClick={openFeedbackWidget}>
              Donner mon avis
            </button>
          </div>
        </div>
      </div>

      {/* Zone 3 — Régions */}
      <div className={styles.regionsBand}>
        <span className={styles.regionsLabel}>Régions couvertes :</span>
        <div className={styles.regionsPills}>
          {REGIONS.map((region) => (
            <SiteNavLink
              key={region}
              to={`/?region=${encodeURIComponent(region)}#professionals`}
              className={styles.regionPill}
            >
              {region}
            </SiteNavLink>
          ))}
        </div>
      </div>

      {/* Zone 4 — Copyright */}
      <div className={styles.copyrightBar}>
        <p className={styles.copyrightText}>
          G-List © 2026 — Prototype de validation. Toutes les informations sont fictives.
        </p>
        <nav className={styles.legalLinks} aria-label="Liens légaux">
          <Link to="/a-propos">À propos</Link>
          <span aria-hidden="true">·</span>
          <Link to="/confidentialite">Confidentialité</Link>
          <span aria-hidden="true">·</span>
          <Link to="/conditions">Conditions</Link>
          <span aria-hidden="true">·</span>
          <Link to="/admin-glist-2026">Admin</Link>
        </nav>
      </div>
    </footer>
  );
}
