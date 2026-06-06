import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, MapPin, Star, BadgeCheck, Navigation } from 'lucide-react';
import { getInitials, formatWhatsAppLink } from '../utils/helpers';
import { formatDistance } from '../utils/geo';
import { useLazyVisible } from '../hooks/useLazyVisible';
import styles from './ProCard.module.css';

export default function ProCard({ pro, userLocation }) {
  const [ref, visible] = useLazyVisible();

  if (!visible) {
    return <div ref={ref} className={styles.placeholder} aria-hidden="true" />;
  }

  return (
    <article ref={ref} className={styles.card}>
      <div className={styles.topBar} aria-hidden="true" />

      <span
        className={`${styles.badge} ${pro.verifie ? styles.badgeVerified : styles.badgeUnverified}`}
      >
        {pro.verifie && <BadgeCheck size={11} />}
        {pro.verifie ? 'Vérifié' : 'Non vérifié'}
      </span>

      <div className={styles.top}>
        <div className={styles.avatar} aria-hidden="true">
          {getInitials(pro.nom)}
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{pro.nom}</h3>
          <p className={styles.profession}>{pro.profession}</p>
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

      <hr className={styles.separator} />

      <div className={styles.ratingRow}>
        <div className={styles.rating}>
          <Star size={14} className={styles.starIcon} aria-hidden="true" />
          <span className={styles.ratingValue}>{pro.note}</span>
          <span className={styles.reviewCount}>({pro.nombreAvis} avis)</span>
        </div>
      </div>

      <div className={styles.actions}>
        <a
          href={formatWhatsAppLink(pro.telephone)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsapp}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle size={15} aria-hidden="true" />
          WhatsApp
        </a>
        <Link to={`/profil/${pro.id}`} className={styles.profile}>
          Voir le profil
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
