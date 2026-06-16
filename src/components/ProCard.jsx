import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star, Eye, Heart, Navigation } from 'lucide-react';
import { getInitials, getAvatarColor } from '../utils/helpers';
import { formatDistance } from '../utils/geo';
import { useLazyVisible } from '../hooks/useLazyVisible';
import { toggleFavorite, isFavorite } from '../utils/storage';
import { getPlanBadgeLabel } from '../utils/proEnhancements';
import styles from './ProCard.module.css';

export default function ProCard({ pro, userLocation, compact = false }) {
  const [ref, visible] = useLazyVisible();
  const [fav, setFav] = useState(() => isFavorite(pro.id));

  if (!visible) {
    return <div ref={ref} className={styles.placeholder} aria-hidden="true" />;
  }

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFav(toggleFavorite(pro.id));
  };

  const planLabel = getPlanBadgeLabel(pro.plan, pro.topGList);
  const planClass = pro.topGList ? styles.badgeTop : styles[`badge${(pro.plan || 'free').charAt(0).toUpperCase() + (pro.plan || 'free').slice(1)}`] || styles.badgeFree;

  return (
    <article ref={ref} className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <div className={styles.topBar} aria-hidden="true" />

      <button
        type="button"
        className={`${styles.favBtn} ${fav ? styles.favActive : ''}`}
        onClick={handleFav}
        aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
      </button>

      <div className={styles.top}>
        <div
          className={styles.avatar}
          style={{ background: getAvatarColor(pro.categorie) }}
          aria-hidden="true"
        >
          {getInitials(pro.nom)}
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{pro.nom}</h3>
          <p className={styles.category}>{pro.categorie}</p>
          <p className={styles.region}>
            <MapPin size={12} aria-hidden="true" />
            <span>{pro.region} — {pro.quartier}</span>
            {pro.distance != null && userLocation && (
              <span className={styles.distance}>
                <Navigation size={11} aria-hidden="true" />
                {formatDistance(pro.distance)}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className={styles.ratingRow}>
        <div className={styles.rating}>
          <Star size={14} className={styles.starIcon} aria-hidden="true" />
          <span className={styles.ratingValue}>{pro.note}</span>
          <span className={styles.reviewCount}>({pro.nombreAvis} avis)</span>
        </div>
        <span className={`${styles.planBadge} ${planClass}`}>{planLabel}</span>
      </div>

      <div className={styles.miniStats}>
        <span><Eye size={12} /> {pro.vues ?? 0}</span>
        <span><Heart size={12} /> {pro.favoris ?? 0}</span>
      </div>

      <div className={styles.actions}>
        <Link to={`/profil/${pro.id}`} className={styles.profile}>
          Voir le profil
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
