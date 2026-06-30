import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Briefcase, ChevronDown, User, UserPlus } from 'lucide-react';
import Logo from './Logo';
import ShareButton from './ShareButton';
import { getUserType, getProAccount } from '../utils/storage';
import { SITE_NAV_MAIN_LINKS, SITE_NAV_MORE_LINKS, DRAWER_MOBILE_ITEMS, SITE_INFO_LINKS } from '../data/siteNav';
import { useTranslation } from '../i18n/I18nContext';
import SiteNavLink from './SiteNavLink';
import DrawerNavItem from './DrawerNavItem';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './Header.module.css';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const userType = getUserType();
  const proAccount = getProAccount();
  const { t } = useTranslation();

  const closeDrawer = () => setDrawerOpen(false);

  const accountLink = userType === 'visiteur'
    ? { to: '/dashboard/visiteur', label: t('header.mySpace'), Icon: User }
    : userType === 'pro' && proAccount
      ? { to: '/espace-pro', label: t('header.mySpace'), Icon: Briefcase }
      : null;

  const AccountIcon = accountLink?.Icon;

  return (
    <>
      <header className={`${styles.header} ${isHome ? styles.headerHome : ''}`}>
        <Link to="/" className={styles.logoLink}>
          <Logo />
        </Link>

        <nav className={styles.desktopNav} aria-label="Navigation principale">
          {SITE_NAV_MAIN_LINKS.map(({ labelKey, to }) => (
            <SiteNavLink key={labelKey} to={to} className={styles.navLink}>
              {t(labelKey)}
            </SiteNavLink>
          ))}
          <div className={styles.navDropdown}>
            <button type="button" className={styles.navLink} aria-haspopup="true" aria-expanded="false">
              {t('nav.more')} <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
            </button>
            <div className={styles.navDropdownMenu}>
              {SITE_NAV_MORE_LINKS.map(({ labelKey, to }) => (
                <SiteNavLink key={labelKey} to={to} className={styles.navDropdownItem}>
                  {t(labelKey)}
                </SiteNavLink>
              ))}
              <div className={styles.navDropdownDivider} />
              {SITE_INFO_LINKS.map(({ labelKey, to }) => (
                <Link key={labelKey} to={to} className={styles.navDropdownItem}>
                  {t(labelKey)}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher onDark className={styles.headerLang} />
          <ThemeToggle onDark className={styles.headerThemeToggle} />
          {userType === 'pro' && proAccount ? (
            <Link to="/espace-pro" className={styles.joinBtn}>
              <Briefcase size={16} strokeWidth={2} aria-hidden="true" />
              {t('header.mySpace')}
            </Link>
          ) : userType === 'visiteur' ? (
            <Link to="/dashboard/visiteur" className={styles.joinBtn}>
              <User size={16} strokeWidth={2} aria-hidden="true" />
              {t('header.mySpace')}
            </Link>
          ) : (
            <Link to="/espace-pro?register=1" className={styles.joinBtn}>
              <UserPlus size={16} strokeWidth={2} aria-hidden="true" />
              {t('header.signUp')}
            </Link>
          )}
          <button
            type="button"
            className={styles.mobileIcon}
            onClick={() => setDrawerOpen(true)}
            aria-label={t('header.menu')}
          >
            <Menu size={24} strokeWidth={2} />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className={styles.drawerOverlay} onClick={closeDrawer}>
          <nav className={styles.drawer} onClick={(e) => e.stopPropagation()} aria-label={t('header.menu')}>
            <div className={styles.drawerHeader}>
              <Link to="/" className={styles.drawerLogo} onClick={closeDrawer}>
                <Logo />
              </Link>
              <button type="button" className={styles.drawerClose} onClick={closeDrawer} aria-label={t('header.close')}>
                <X size={26} strokeWidth={2.25} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {DRAWER_MOBILE_ITEMS.map((item) => (
                <DrawerNavItem
                  key={item.labelKey}
                  item={item}
                  onClose={closeDrawer}
                  useScrollNav
                />
              ))}

              <div className={styles.drawerDivider} />

              <div className={styles.drawerSettingRow}>
                <span className={styles.drawerSettingLabel}>{t('lang.label')}</span>
                <LanguageSwitcher onDark className={styles.drawerLangControl} />
              </div>

              <ThemeToggle variant="ligne" onDark className={styles.drawerTheme} />

              <div className={styles.drawerDivider} />

              <div className={styles.drawerAccount}>
                {accountLink ? (
                  <Link to={accountLink.to} className={styles.drawerSignUpBtn} onClick={closeDrawer}>
                    {AccountIcon && <AccountIcon size={18} strokeWidth={2} aria-hidden="true" />}
                    {accountLink.label}
                  </Link>
                ) : (
                  <>
                    <Link to="/espace-pro?register=1" className={styles.drawerSignUpBtn} onClick={closeDrawer}>
                      <UserPlus size={18} strokeWidth={2} aria-hidden="true" />
                      {t('header.signUp')}
                    </Link>
                    <Link to="/espace-pro" className={styles.drawerLoginLink} onClick={closeDrawer}>
                      {t('header.signIn')}
                    </Link>
                  </>
                )}
              </div>

              <div className={styles.drawerDivider} />

              <ShareButton
                title="G-List"
                text={t('share.siteText')}
                label={t('share.site')}
                className={styles.drawerShare}
              />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
