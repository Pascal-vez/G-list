import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedProsCarousel from '../components/home/FeaturedProsCarousel';
import RecentProCard from '../components/home/RecentProCard';
import HomeStatsBand from '../components/home/HomeStatsBand';
import PlatformReviewsSection from '../components/home/PlatformReviewsSection';
import { useProfessionalsList } from '../hooks/useProfessionalsList';
import { usePlatformAnalytics } from '../hooks/usePlatformAnalytics';
import { getCategoryCounts } from '../utils/helpers';
import { defaultDateRange } from '../components/dashboard/DateRangePicker';
import { usePageMeta } from '../hooks/usePageMeta';
import { useTranslation } from '../i18n/I18nContext';
import styles from './Home.module.css';

export default function Home() {
  const { t } = useTranslation();
  usePageMeta({
    description: t('home.meta.description'),
    path: '/',
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [platformReviewStats, setPlatformReviewStats] = useState({ count: 0, avg: 0 });
  const dateRange = useMemo(() => defaultDateRange(), []);
  const { kpis } = usePlatformAnalytics(dateRange);

  useEffect(() => {
    const hasAnnuaireQuery =
      searchParams.get('search')
      || searchParams.get('region')
      || searchParams.get('verified')
      || searchParams.get('rating')
      || searchParams.get('category');

    if (hasAnnuaireQuery || location.hash === '#professionals') {
      navigate(`/annuaire${location.search}`, { replace: true });
    }
  }, [searchParams, location.hash, location.search, navigate]);

  const professionals = useProfessionalsList();
  const categoryCounts = useMemo(() => getCategoryCounts(professionals), [professionals.length]);

  const featuredPros = useMemo(() => (
    professionals
      .filter((p) => p.plan === 'premium' && !p.hidden && !p.disabled)
      .sort((a, b) => (b.note || 0) - (a.note || 0))
  ), [professionals]);

  const recentPros = useMemo(() => (
    [...professionals].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 4)
  ), [professionals]);

  const avgRating = useMemo(() => {
    if (!professionals.length) return 0;
    const withReviews = professionals.filter((p) => (p.nombreAvis || 0) > 0);
    if (!withReviews.length) return 0;
    const sum = withReviews.reduce((s, p) => s + (p.note || 0), 0);
    return sum / withReviews.length;
  }, [professionals]);

  const reviewStats = useMemo(() => {
    const totalReviews = professionals.reduce((s, p) => s + (p.nombreAvis || 0), 0);
    const topRated = professionals.filter((p) => (p.note || 0) >= 4.5 && (p.nombreAvis || 0) > 0).length;
    const satisfied = professionals.filter((p) => (p.note || 0) >= 4 && (p.nombreAvis || 0) > 0).length;
    const withReviews = professionals.filter((p) => (p.nombreAvis || 0) > 0).length;
    const satisfiedPct = withReviews ? Math.round((satisfied / withReviews) * 100) : 0;
    return { totalReviews, satisfiedPct, topRated };
  }, [professionals]);

  return (
    <>
      <Hero />

      {featuredPros.length > 0 && (
        <section className={styles.featuredSection}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitleRow}>
                <Zap size={20} className={styles.sectionIcon} aria-hidden="true" />
                <h2>{t('home.featured.title')}</h2>
                <span className={styles.sponsoredTag}>{t('home.featured.sponsored')}</span>
              </div>
            </div>
            <FeaturedProsCarousel pros={featuredPros} />
          </div>
        </section>
      )}

      <div id="categories" className={styles.categoriesWrap}>
        <Categories categoryCounts={categoryCounts} layout="horizontal" limit={8} />
      </div>

      <section className={styles.recentSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <h2>{t('home.recent.title')}</h2>
            <Link to="/annuaire" className={styles.seeAllBtn}>
              {t('home.recent.seeAll')}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.recentGrid}>
            {recentPros.map((pro) => (
              <RecentProCard key={pro.id} pro={pro} />
            ))}
          </div>
        </div>
      </section>

      <HomeStatsBand
        totalPros={professionals.length}
        totalReviews={reviewStats.totalReviews + platformReviewStats.count}
        avgRating={platformReviewStats.avg || avgRating}
        monthlySearches={kpis?.totalViews ?? 0}
        satisfiedPct={reviewStats.satisfiedPct}
        topRatedCount={reviewStats.topRated}
      />

      <PlatformReviewsSection onStatsChange={setPlatformReviewStats} />
    </>
  );
}
