import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Briefcase, ChevronDown, User, UserPlus } from 'lucide-react';
import Logo from './Logo';
import { getUserType } from '../utils/storage';
import { SITE_NAV_MAIN_LINKS, SITE_NAV_MORE_LINKS, DRAWER_MOBILE_ITEMS, SITE_INFO_LINKS } from '../data/siteNav';
import SiteNavLink from './SiteNavLink';
import DrawerNavItem from './DrawerNavItem';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.css';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const userType = getUserType();

  const accountDrawerItem = userType === 'visiteur'
    ? { label: 'Mon espace', to: '/dashboard/visiteur', iconKey: 'user' }
    : userType === 'pro'
      ? { label: 'Mon espace', to: '/espace-pro', iconKey: 'briefcase' }
      : { label: "S'inscrire", to: '/espace-pro?register=1', iconKey: 'userPlus' };

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
          <ThemeToggle onDark className={styles.headerThemeToggle} />
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
            <Link to="/espace-pro?register=1" className={styles.joinBtn}>
              <UserPlus size={16} strokeWidth={2} aria-hidden="true" />
              S&apos;inscrire
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
            {DRAWER_MOBILE_ITEMS.map((item) => (
              <DrawerNavItem
                key={item.label}
                item={item}
                onClose={() => setDrawerOpen(false)}
                useScrollNav
              />
            ))}
            <div className={styles.drawerDivider} />
            <ThemeToggle variant="ligne" onDark className={styles.drawerTheme} />
            <DrawerNavItem
              item={accountDrawerItem}
              onClose={() => setDrawerOpen(false)}
              useScrollNav={false}
            />
          </nav>
        </div>
      )}
    </>
  );
}
