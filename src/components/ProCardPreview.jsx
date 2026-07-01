import { getInitials, getAvatarColor, getAvatarTextColor } from '../utils/helpers';
import { getPlanBadgeLabel } from '../utils/proEnhancements';
import styles from './ProCardPreview.module.css';

export default function ProCardPreview({ account }) {
  const plan = account.plan || (account.premium ? 'premium' : 'free');
  return (
    <div className={styles.card}>
      <div className={styles.topBar} />
      <div className={styles.avatar} style={{ background: getAvatarColor(account.categorie), color: getAvatarTextColor(getAvatarColor(account.categorie)) }}>
        {getInitials(account.nom || 'Pro')}
      </div>
      <h3>{account.nom}</h3>
      <p className={styles.cat}>{account.categorie || account.profession}</p>
      <p className={styles.loc}>{account.region} — {account.quartier}</p>
      <span className={styles.badge}>{getPlanBadgeLabel(plan, false)}</span>
    </div>
  );
}
