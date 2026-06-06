import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Briefcase, UserPlus, ChevronDown } from 'lucide-react';
import Logo from './Logo';
import { getUserType } from '../utils/storage';
import { SITE_NAV_MAIN_LINKS, SITE_NAV_MORE_LINKS, DRAWER_NAV_ITEMS, DRAWER_EXTRA_ITEMS, SITE_INFO_LINKS } from '../data/siteNav';
import SiteNavLink from './SiteNavLink';
import DrawerNavItem from './DrawerNavItem';
import styles from './Header.module.css';

export default function Header() {
  const [query, setQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const userType = getUserType();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/?search=' + encodeURIComponent(query.trim()));
      setDrawerOpen(false);
      setMobileSearchOpen(false);
    }
  };

  return (
    <>
      <header className={`${styles.header} ${isHome ? styles.headerHome : ''}`}>
        <Link to="/" className={styles.logoLink}>
          <Logo />
        </Link>

        <form className={styles.searchDesktop} onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn} aria-label="Rechercher">
            <Search size={20} />
          </button>
        </form>

        <nav className={styles.desktopNav} aria-label="Navigation principale">
          {SITE_NAV_MAIN_LINKS.map(({ label, to }) => (
            <SiteNavLink key={label} to={to} className={styles.navLink}>
              {label}
            </SiteNavLink>
          ))}
          <div className={styles.navDropdown}>
            <button type="button" className={styles.navLink} aria-haspopup="true" aria-expanded="false">
              Plus <ChevronDown size={14} style={{ verticalAlign: '-2px' }} />
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
              <Briefcase size={18} />
              Mon espace
            </Link>
          ) : (
            <Link to="/espace-pro" className={styles.joinBtn}>
              <UserPlus size={18} />
              Rejoindre
            </Link>
          )}
          <button
            className={styles.mobileIcon}
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Recherche"
          >
            <Search size={24} />
          </button>
          <button
            className={styles.mobileIcon}
            onClick={() => setDrawerOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {mobileSearchOpen && (
        <form className={styles.mobileSearchBar} onSubmit={handleSearch}>
          <div className={styles.mobileSearchWrap}>
            <Search size={18} className={styles.mobileSearchIcon} aria-hidden="true" />
            <input
              type="search"
              placeholder="Médecin, plombier, restaurant..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className={styles.mobileSearchInput}
            />
          </div>
          <button type="submit" className={styles.mobileSearchSubmit} aria-label="Rechercher">
            <Search size={20} />
          </button>
        </form>
      )}

      {drawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <nav className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)} aria-label="Fermer">
              <X size={24} />
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
