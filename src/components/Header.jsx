import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Briefcase, ChevronDown, User } from 'lucide-react';
import Logo from './Logo';
import { getUserType } from '../utils/storage';
import { SITE_NAV_MAIN_LINKS, SITE_NAV_MORE_LINKS, DRAWER_NAV_ITEMS, DRAWER_EXTRA_ITEMS, SITE_INFO_LINKS } from '../data/siteNav';
import SiteNavLink from './SiteNavLink';
import DrawerNavItem from './DrawerNavItem';
import styles from './Header.module.css';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const userType = getUserType();

  return (
    <>
      <header className={`${styles.header} ${isHome ? styles.headerHome : ''}`}>
        <Link to="/" className={styles.logoLink}>
          <Logo />
        </Link>

        <nav className={styles.desktopNav} aria-label="Navigation principale">
          {SITE_NAV_MAIN_LINKS.map(({ label, to }) => (
            <SiteNavLink key={label} to={to} className={styles.navLink}>
              {label}
            </SiteNavLink>
          ))}
          <div className={styles.navDropdown}>
            <button type="button" className={styles.navLink} aria-haspopup="true" aria-expanded="false">
              Plus <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
            </button>
            <div className={styles.navDropdownMenu}>
              {SITE_NAV_MORE_LINKS.map(({ label, to }) => (
                <SiteNavLink key={label} to={to} className={styles.navDropdownItem}>
                  {label}
                </SiteNavLink>
              ))}
              <div className={styles.navDropdownDivider} />
              {SITE_INFO_LINKS.map(({ label, to }) => (
                <Link key={label} to={to} className={styles.navDropdownItem}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className={styles.actions}>
          {userType === 'pro' ? (
            <Link to="/espace-pro" className={styles.joinBtn}>
              <Briefcase size={16} strokeWidth={2} aria-hidden="true" />
              Mon espace
            </Link>
          ) : userType === 'visiteur' ? (
            <Link to="/dashboard/visiteur" className={styles.joinBtn}>
              <User size={16} strokeWidth={2} aria-hidden="true" />
              Mon espace
            </Link>
          ) : (
            <Link to="/espace-pro" className={styles.joinBtn}>
              <Briefcase size={16} strokeWidth={2} aria-hidden="true" />
              Espace pro
            </Link>
          )}
          <button
            type="button"
            className={styles.mobileIcon}
            onClick={() => setDrawerOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} strokeWidth={2} />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <nav className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.drawerClose} onClick={() => setDrawerOpen(false)} aria-label="Fermer">
              <X size={26} strokeWidth={2.25} />
            </button>
            <p className={styles.drawerHeading}>Navigation</p>
            {DRAWER_NAV_ITEMS.map((item) => (
              <DrawerNavItem
                key={item.label}
                item={item}
                onClose={() => setDrawerOpen(false)}
                useScrollNav
              />
            ))}
            <div className={styles.drawerDivider} />
            <p className={styles.drawerHeading}>Compte</p>
            {DRAWER_EXTRA_ITEMS.map((item) => (
              <DrawerNavItem
                key={item.label}
                item={item}
                onClose={() => setDrawerOpen(false)}
                useScrollNav={false}
              />
            ))}
            <div className={styles.drawerDivider} />
            <p className={styles.drawerHeading}>Informations</p>
            {SITE_INFO_LINKS.map((item) => (
              <DrawerNavItem
                key={item.label}
                item={item}
                onClose={() => setDrawerOpen(false)}
                useScrollNav={false}
              />
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
