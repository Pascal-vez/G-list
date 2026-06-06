import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FeedbackWidget from './FeedbackWidget';
import EngagementModal from './EngagementModal';
import EvaluateButton from './EvaluateButton';
import RouteScrollManager from './RouteScrollManager';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
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
      <RouteScrollManager />
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
      {showFloaters && (
        <>
          <EvaluateButton />
          <FeedbackWidget />
        </>
      )}
      <EngagementModal />
    </div>
  );
}
