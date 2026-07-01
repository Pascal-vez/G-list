import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FeedbackWidget from './FeedbackWidget';
import EngagementModal from './EngagementModal';
import EvaluateButton from './EvaluateButton';
import SkipLink from './SkipLink';
import CookieBanner from './CookieBanner';
import PlatformAnalytics from './PlatformAnalytics';
import GlistBot from './GlistBot';
import SystemBroadcastBanner from './SystemBroadcastBanner';
import RouteScrollManager from './RouteScrollManager';
import styles from './Layout.module.css';

const PERSONAL_PATH_PREFIXES = [
  '/espace-pro',
  '/dashboard/visiteur',
  '/mon-profil',
  '/mot-de-passe-oublie',
  '/reinitialiser-mot-de-passe',
  '/verifier-email',
];

const DASHBOARD_PATH_PREFIXES = [
  '/espace-pro',
  '/dashboard/visiteur',
];

function matchesPathPrefix(pathname, prefixes) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isPersonalPage(pathname) {
  return matchesPathPrefix(pathname, PERSONAL_PATH_PREFIXES);
}

function isDashboardPage(pathname) {
  return matchesPathPrefix(pathname, DASHBOARD_PATH_PREFIXES);
}

export default function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const hideFooter = isPersonalPage(location.pathname);
  const hideNavbar = isDashboardPage(location.pathname);
  const [showFloaters, setShowFloaters] = useState(true);

  useEffect(() => {
    document.body.style.overflow = '';
    document.body.style.background = '';
  }, [location.pathname]);

  useEffect(() => {
    if (!isHome) {
      setShowFloaters(true);
      return undefined;
    }

    const mq = window.matchMedia('(max-width: 768px)');

    const update = () => {
      if (!mq.matches) {
        setShowFloaters(true);
        return;
      }
      setShowFloaters(window.scrollY > window.innerHeight * 0.55);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    mq.addEventListener('change', update);
    return () => {
      window.removeEventListener('scroll', update);
      mq.removeEventListener('change', update);
    };
  }, [isHome, location.pathname]);

  return (
    <div className={styles.layout}>
      <SkipLink />
      <RouteScrollManager />
      {!hideNavbar && <Header />}
      {!hideNavbar && <SystemBroadcastBanner />}
      <main id="main-content" className={styles.main}>{children}</main>
      {!hideFooter && <Footer />}
      <PlatformAnalytics />
      <CookieBanner />
      {!hideNavbar && showFloaters && (
        <>
          <GlistBot />
          <EvaluateButton />
          <FeedbackWidget />
        </>
      )}
      <EngagementModal />
    </div>
  );
}
