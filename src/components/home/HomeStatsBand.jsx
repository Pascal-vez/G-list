import { Users, MessageSquare, Star, Search, ThumbsUp } from 'lucide-react';
import { StarDisplay } from '../StarRating';
import styles from './HomeStatsBand.module.css';

function formatCount(n) {
  return n.toLocaleString('fr-FR');
}

export default function HomeStatsBand({
  totalPros,
  totalReviews,
  avgRating,
  monthlySearches,
  satisfiedPct,
  topRatedCount,
}) {
  const ratingNum = typeof avgRating === 'number' ? avgRating : parseFloat(String(avgRating).replace(',', '.')) || 0;
  const ratingLabel = typeof avgRating === 'string' ? avgRating : ratingNum.toFixed(1).replace('.', ',');

  const stats = [
    {
      id: 'pros',
      icon: Users,
      value: `${totalPros.toLocaleString('fr-FR')}+`,
      label: 'Professionnels référencés',
      hint: 'Toutes catégories confondues',
    },
    {
      id: 'reviews',
      icon: MessageSquare,
      value: `${formatCount(totalReviews)}+`,
      label: 'Avis clients publiés',
      hint: topRatedCount > 0 ? `${topRatedCount} pros notés 4,5★+` : 'Retours vérifiés sur G-List',
    },
    {
      id: 'rating',
      icon: Star,
      value: `${ratingLabel} / 5`,
      label: 'Note moyenne des professionnels',
      hint: satisfiedPct > 0 ? `${satisfiedPct}% de clients satisfaits` : 'Basée sur les avis publiés',
      isRating: true,
    },
    {
      id: 'searches',
      icon: Search,
      value: `${monthlySearches}+`,
      label: 'Recherches chaque mois',
      hint: 'Sur tout le territoire',
    },
  ];

  return (
    <section className={styles.band} aria-label="Statistiques et avis G-List">
      <div className={styles.inner}>
        <header className={styles.head}>
          <div className={styles.headBadge}>
            <ThumbsUp size={14} aria-hidden="true" />
            Confiance & transparence
          </div>
          <h2 className={styles.headTitle}>La communauté G-List en chiffres</h2>
          <p className={styles.headDesc}>
            Des avis authentiques pour vous aider à choisir le bon professionnel en Guinée.
          </p>
        </header>

        <div className={styles.grid}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.id} className={styles.card}>
                <div className={styles.iconWrap}>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <div className={styles.cardBody}>
                  <strong className={styles.value}>{stat.value}</strong>
                  {stat.isRating && ratingNum > 0 && (
                    <div className={styles.starsRow}>
                      <StarDisplay rating={ratingNum} size={16} filledColor="#4CAF50" />
                    </div>
                  )}
                  <span className={styles.label}>{stat.label}</span>
                  <span className={styles.hint}>{stat.hint}</span>
                </div>
              </article>
            );
          })}
        </div>

        {satisfiedPct > 0 && (
          <div className={styles.trustBar}>
            <div className={styles.trustTrack} role="presentation">
              <div
                className={styles.trustFill}
                style={{ width: `${Math.min(satisfiedPct, 100)}%` }}
              />
            </div>
            <p className={styles.trustText}>
              <strong>{satisfiedPct}%</strong> des professionnels notés obtiennent 4 étoiles ou plus
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
