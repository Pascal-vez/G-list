import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/helpers';
import styles from './RecentProCard.module.css';

export default function RecentProCard({ pro }) {
  return (
    <article className={styles.card}>
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
          <p className={styles.profession}>{pro.profession}</p>
        </div>
      </div>

      <p className={styles.location}>
        <MapPin size={13} aria-hidden="true" />
        {pro.region}
      </p>

      <div className={styles.rating}>
        <Star size={13} className={styles.star} aria-hidden="true" />
        <span>{pro.note}</span>
      </div>

      <Link to={`/profil/${pro.id}`} className={styles.link}>
        Voir le profil
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </article>
  );
}
