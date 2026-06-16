import styles from './StarRating.module.css';

export default function StarRating({ value, onChange, readonly = false, size = 24 }) {
  return (
    <div className={styles.stars} role={readonly ? 'img' : 'group'} aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${star <= value ? styles.filled : ''}`}
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          style={{ fontSize: size }}
          aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ rating, size = 18, filledColor }) {
  const full = Math.floor(rating);
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={i <= full ? styles.filled : styles.empty}
        style={{
          fontSize: size,
          ...(i <= full && filledColor ? { color: filledColor } : {}),
        }}
      >
        ★
      </span>
    );
  }
  return <span className={styles.display}>{stars}</span>;
}
