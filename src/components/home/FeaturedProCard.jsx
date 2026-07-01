import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { getInitials, getAvatarColor, getAvatarTextColor } from '../../utils/helpers';
import styles from './FeaturedProCard.module.css';

export default function FeaturedProCard({ pro, sponsored = false }) {
  const available = pro.disponible !== false;

  return (
    <article className={styles.card}>
      {sponsored && <span className={styles.sponsored}>Sponsorisé</span>}

      <div className={styles.top}>
        <div
          className={styles.avatar}
          style={{ background: getAvatarColor(pro.categorie), color: getAvatarTextColor(getAvatarColor(pro.categorie)) }}
          aria-hidden="true"
        >
          {getInitials(pro.nom)}
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{pro.nom}</h3>
          <p className={styles.profession}>{pro.profession}</p>
        </div>
      </div>

      <p className={styles.location}>
        <MapPin size={14} aria-hidden="true" />
        {pro.quartier}, {pro.region}
      </p>

      <div className={styles.rating}>
        <Star size={14} className={styles.star} aria-hidden="true" />
        <strong>{pro.note}</strong>
        <span>({pro.nombreAvis} avis)</span>
      </div>

      <p className={`${styles.status} ${available ? styles.statusOn : styles.statusOff}`}>
        <span className={styles.statusDot} aria-hidden="true" />
        {available ? 'Disponible aujourd\'hui' : 'Indisponible'}
      </p>

      <Link to={`/profil/${pro.id}`} className={styles.cta}>
        Voir le profil
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
