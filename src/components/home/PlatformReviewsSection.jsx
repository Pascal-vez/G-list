import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import StarRating, { StarDisplay } from '../StarRating';
import {
  fetchPlatformReviews,
  fetchPlatformReviewStats,
  addPlatformReview,
} from '../../api/supabasePlatformReviews';
import { formatDate } from '../../utils/helpers';
import { useTranslation } from '../../i18n/I18nContext';
import styles from './PlatformReviewsSection.module.css';

const INITIAL_VISIBLE = 4;
const LOAD_MORE = 10;

export default function PlatformReviewsSection({ onStatsChange }) {
  const { t, locale } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState({ count: 0, avg: 0 });
  const [form, setForm] = useState({ authorName: '', rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async (limit = INITIAL_VISIBLE) => {
    try {
      const [list, st] = await Promise.all([
        fetchPlatformReviews({ offset: 0, limit }),
        fetchPlatformReviewStats(),
      ]);
      setReviews(list.reviews || []);
      setTotal(list.total || 0);
      setStats(st);
      onStatsChange?.(st);
    } catch {
      setReviews([]);
    }
  }, [onStatsChange]);

  useEffect(() => {
    reload(INITIAL_VISIBLE);
  }, [reload]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.authorName.trim() || !form.rating || !form.comment.trim()) {
      setError(t('reviews.form.errorRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await addPlatformReview({
        authorName: form.authorName.trim(),
        rating: form.rating,
        comment: form.comment.trim(),
      });
      setForm({ authorName: '', rating: 0, comment: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setVisibleCount(INITIAL_VISIBLE);
      await reload(INITIAL_VISIBLE);
    } catch {
      setError(t('reviews.form.errorSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = async () => {
    const next = visibleCount + LOAD_MORE;
    setLoadingMore(true);
    try {
      const list = await fetchPlatformReviews({ offset: 0, limit: next });
      setReviews(list.reviews || []);
      setTotal(list.total || 0);
      setVisibleCount(next);
    } finally {
      setLoadingMore(false);
    }
  };

  const visible = reviews.slice(0, visibleCount);
  const rangeStart = total > 0 ? 1 : 0;
  const rangeEnd = Math.min(visibleCount, total);

  const avgLabel = String(stats.avg).replace('.', locale === 'en' ? '.' : ',');

  return (
    <section className={styles.section} aria-label={t('reviews.ariaLabel')}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <MessageSquare size={22} aria-hidden />
          <div>
            <h3>{t('reviews.title')}</h3>
            <p>
              {stats.count > 0
                ? t('reviews.summary', { count: stats.count, avg: avgLabel })
                : t('reviews.empty')}
            </p>
          </div>
        </header>

        {visible.length > 0 && (
          <div className={styles.list}>
            {visible.map((r) => (
              <article key={r.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <strong>{r.author_name}</strong>
                  <StarDisplay rating={r.rating} size={14} />
                </div>
                <p>{r.comment}</p>
                <time dateTime={r.created_at}>{formatDate(r.created_at?.split('T')[0])}</time>
              </article>
            ))}
          </div>
        )}

        {total > visibleCount && (
          <div className={styles.pagination}>
            <span>{t('reviews.pagination.range', { start: rangeStart, end: rangeEnd, total })}</span>
            <button type="button" className={styles.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? t('common.loading') : t('reviews.loadMore')}
            </button>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <h4><Star size={18} aria-hidden /> {t('reviews.form.title')}</h4>
          <p className={styles.formHint}>{t('reviews.form.hint')}</p>
          {submitted && <p className={styles.success}>{t('reviews.form.success')}</p>}
          {error && <p className={styles.error}>{error}</p>}
          <label>
            {t('reviews.form.firstNameLabel')}
            <input
              type="text"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              placeholder={t('reviews.form.firstNamePlaceholder')}
              required
            />
          </label>
          <label>
            {t('reviews.form.ratingLabel')}
            <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          </label>
          <label>
            {t('reviews.form.commentLabel')}
            <textarea
              rows={3}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder={t('reviews.form.commentPlaceholder')}
              required
            />
          </label>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? t('reviews.form.submitting') : t('reviews.form.submit')}
          </button>
        </form>
      </div>
    </section>
  );
}
