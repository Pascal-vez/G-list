import FeaturedProCard from './FeaturedProCard';
import styles from './FeaturedProsCarousel.module.css';

export default function FeaturedProsCarousel({ pros }) {
  if (!pros.length) return null;

  const shouldLoop = pros.length >= 3;
  const loop = shouldLoop ? [...pros, ...pros] : pros;

  return (
    <div className={styles.viewport} aria-label="Professionnels sponsorisés">
      <div className={`${styles.track} ${shouldLoop ? '' : styles.trackStatic}`}>
        {loop.map((pro, index) => (
          <div key={`${pro.id}-${index}`} className={styles.slide}>
            <FeaturedProCard
              pro={pro}
              sponsored={pro.topGList || pro.plan === 'premium'}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
