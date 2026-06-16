import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedProsCarousel from '../components/home/FeaturedProsCarousel';
import RecentProCard from '../components/home/RecentProCard';
import HomeStatsBand from '../components/home/HomeStatsBand';
import { getAllProfessionals } from '../api/professionals';
import { getCategoryCounts } from '../utils/helpers';
import { getTotalProfileReviews } from '../utils/storage';
import { usePageMeta } from '../hooks/usePageMeta';
import styles from './Home.module.css';

export default function Home() {
  usePageMeta({
    description: 'Trouvez les meilleurs professionnels de Guinée — médecins, artisans, restaurants, techniciens et plus.',
    path: '/',
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

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

  const professionals = getAllProfessionals();
  const categoryCounts = useMemo(() => getCategoryCounts(professionals), [professionals.length]);

  const featuredPros = useMemo(() => {
    const sponsored = professionals.filter((p) => p.topGList || p.plan === 'premium');
    const pool = sponsored.length > 0 ? sponsored : professionals;
    return [...pool].sort((a, b) => b.note - a.note);
  }, []);

  const recentPros = useMemo(() => (
    [...professionals].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 4)
  ), []);

  const avgRating = useMemo(() => {
    if (!professionals.length) return 0;
    const sum = professionals.reduce((s, p) => s + (p.note || 0), 0);
    return sum / professionals.length;
  }, [professionals.length]);

  const reviewStats = useMemo(() => {
    const catalogReviews = professionals.reduce((s, p) => s + (p.nombreAvis || 0), 0);
    const userReviews = getTotalProfileReviews();
    const totalReviews = catalogReviews + userReviews;
    const topRated = professionals.filter((p) => (p.note || 0) >= 4.5 && (p.nombreAvis || 0) > 0).length;
    const satisfied = professionals.filter((p) => (p.note || 0) >= 4).length;
    const satisfiedPct = professionals.length
      ? Math.round((satisfied / professionals.length) * 100)
      : 0;
    return { totalReviews, satisfiedPct, topRated };
  }, [professionals.length]);

  return (
    <>
      <Hero />

      <section className={styles.featuredSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitleRow}>
              <Zap size={20} className={styles.sectionIcon} aria-hidden="true" />
              <h2>Professionnels mis en avant</h2>
              <span className={styles.sponsoredTag}>Sponsorisé</span>
            </div>
          </div>
          <FeaturedProsCarousel pros={featuredPros} />
        </div>
      </section>

      <div id="categories" className={styles.categoriesWrap}>
        <Categories categoryCounts={categoryCounts} layout="horizontal" limit={8} />
      </div>

      <section className={styles.recentSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <h2>Professionnels récemment inscrits</h2>
            <Link to="/annuaire" className={styles.seeAllBtn}>
              Voir tous les professionnels
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
        totalReviews={reviewStats.totalReviews}
        avgRating={avgRating}
        monthlySearches="2 000"
        satisfiedPct={reviewStats.satisfiedPct}
        topRatedCount={reviewStats.topRated}
      />
    </>
  );
}
