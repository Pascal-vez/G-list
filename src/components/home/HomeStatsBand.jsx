import { Users, MessageSquare, Star, Search, ThumbsUp } from 'lucide-react';
import { StarDisplay } from '../StarRating';
import { useTranslation } from '../../i18n/I18nContext';
import { formatLocaleNumber } from '../../i18n/helpers';
import styles from './HomeStatsBand.module.css';

export default function HomeStatsBand({
  totalPros,
  totalReviews,
  avgRating,
  monthlySearches,
  satisfiedPct,
  topRatedCount,
}) {
  const { t, locale } = useTranslation();
  const ratingNum = typeof avgRating === 'number' ? avgRating : parseFloat(String(avgRating).replace(',', '.')) || 0;
  const ratingLabel = typeof avgRating === 'string'
    ? avgRating
    : ratingNum.toFixed(1).replace('.', locale === 'en' ? '.' : ',');

  const stats = [
    {
      id: 'pros',
      icon: Users,
      value: `${formatLocaleNumber(totalPros, locale)}+`,
      label: t('stats.pros.label'),
      hint: t('stats.pros.hint'),
    },
    {
      id: 'reviews',
      icon: MessageSquare,
      value: `${formatLocaleNumber(totalReviews, locale)}+`,
      label: t('stats.reviews.label'),
      hint: topRatedCount > 0
        ? t('stats.reviews.hintTopRated', { count: topRatedCount })
        : t('stats.reviews.hintDefault'),
    },
    {
      id: 'rating',
      icon: Star,
      value: `${ratingLabel} / 5`,
      label: t('stats.rating.label'),
      hint: satisfiedPct > 0
        ? t('stats.rating.hintSatisfied', { pct: satisfiedPct })
        : t('stats.rating.hintDefault'),
      isRating: true,
    },
    {
      id: 'searches',
      icon: Search,
      value: `${formatLocaleNumber(monthlySearches, locale)}+`,
      label: t('stats.searches.label'),
      hint: t('stats.searches.hint'),
    },
  ];

  return (
    <section className={styles.band} aria-label={t('stats.ariaLabel')}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <div className={styles.headBadge}>
            <ThumbsUp size={14} aria-hidden="true" />
            {t('stats.badge')}
          </div>
          <h2 className={styles.headTitle}>{t('stats.title')}</h2>
          <p className={styles.headDesc}>{t('stats.description')}</p>
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
              {t('stats.trustBar', { pct: satisfiedPct })}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
