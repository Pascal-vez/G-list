import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, MessageCircle, Star, BadgeCheck, ArrowLeft, Eye, Globe } from 'lucide-react';
import { getProAccount, getProReviews, getProAverageRating, isPremiumActive, incrementProProfileViews, getMinisiteSlugForPro } from '../utils/storage';
import { getMinisitePublicPath } from '../utils/minisite';
import { getInitials, getAvatarColor, formatWhatsAppLink } from '../utils/helpers';
import { usePageMeta } from '../hooks/usePageMeta';
import { StarDisplay } from '../components/StarRating';
import SocialLinks from '../components/SocialLinks';
import OpenStatusBadge from '../components/OpenStatusBadge';
import styles from './ProPublicProfile.module.css';

export default function ProPublicProfile() {
  const account = getProAccount();
  const premium = account && isPremiumActive(account);

  usePageMeta({
    title: account ? account.nom : 'Mon profil public',
    description: account
      ? `${account.profession} à ${account.region} — profil professionnel G-List`
      : 'Votre page publique sur G-List',
    path: '/mon-profil',
    noIndex: true,
  });

  useEffect(() => {
    if (account) incrementProProfileViews();
  }, [account]);

  if (!account) {
    return (
      <div className={styles.empty}>
        <p>Aucun profil pro trouvé.</p>
        <Link to="/espace-pro" className="btn-primary">Créer mon espace</Link>
      </div>
    );
  }

  const reviews = getProReviews(account.id);
  const avgRating = getProAverageRating(account.id);
  const minisiteSlug = premium ? getMinisiteSlugForPro(account.id, account) : null;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Link to="/espace-pro" className={styles.back}>
          <ArrowLeft size={18} /> Retour au tableau de bord
        </Link>

        <div className={styles.heroContent}>
          <div
            className={styles.avatar}
            style={{ background: getAvatarColor(account.profession) }}
          >
            {getInitials(account.nom)}
          </div>
          <div>
            <div className={styles.nameRow}>
              <h1 className="hero-display">{account.nom}</h1>
              {premium && (
                <span className="badge-verified verified">
                  <BadgeCheck size={14} />
                  Vérifié
                </span>
              )}
            </div>
            <p className={styles.profession}>{account.profession}</p>
            {account.horaires && (
              <div className={styles.statusRow}>
                <OpenStatusBadge horaires={account.horaires} />
              </div>
            )}
            {account.slogan && <p className={styles.slogan}>{account.slogan}</p>}
            <p className={styles.location}>
              <MapPin size={15} />
              {account.region} — {account.quartier}
            </p>
            {avgRating > 0 && (
              <p className={styles.rating}>
                <Star size={15} className={styles.starFill} />
                {avgRating.toFixed(1)} · ({reviews.length} avis)
              </p>
            )}
          </div>
        </div>

        {premium && account.social && (
          <div className={styles.socialWrap}>
            <SocialLinks social={account.social} size="lg" />
          </div>
        )}
      </div>

      <div className={styles.body}>
        {minisiteSlug && (
          <Link to={getMinisitePublicPath(minisiteSlug)} className={styles.visitSiteBanner}>
            <Globe size={20} aria-hidden="true" />
            <div>
              <strong>Visiter mon site</strong>
              <span>Portfolio complet — glist.gn/pro/{minisiteSlug}</span>
            </div>
          </Link>
        )}

        {premium && account.profileViews != null && (
          <div className={styles.statBar}>
            <Eye size={16} />
            {account.profileViews} visites sur votre profil
          </div>
        )}

        <section className={styles.section}>
          <h2>À propos</h2>
          <p className={styles.desc}>{account.description || 'Aucune description pour le moment.'}</p>
        </section>

        {account.services?.length > 0 && (
          <section className={styles.section}>
            <h2>Services</h2>
            <div className={styles.tags}>
              {account.services.map((s) => (
                <span key={s} className={styles.tag}>{s}</span>
              ))}
            </div>
          </section>
        )}

        {account.specialites?.length > 0 && (
          <section className={styles.section}>
            <h2>Spécialités</h2>
            <div className={styles.tags}>
              {account.specialites.map((s) => (
                <span key={s} className={styles.tagGold}>{s}</span>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2>Contact</h2>
          <div className={styles.contactList}>
            <p><Phone size={16} /> {account.telephone}</p>
            {account.horaires && (
              <p className={styles.horairesRow}>
                <Clock size={16} />
                <span>{account.horaires}</span>
              </p>
            )}
          </div>
          <a
            href={formatWhatsAppLink(account.whatsapp || account.telephone)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsapp}
          >
            <MessageCircle size={20} />
            Contacter sur WhatsApp
          </a>
        </section>

        {reviews.length > 0 && (
          <section className={styles.section}>
            <h2>Avis clients ({reviews.length})</h2>
            <div className={styles.reviews}>
              {reviews.map((r) => (
                <div key={r.id} className={styles.review}>
                  <div className={styles.reviewHead}>
                    <span className={styles.reviewName}>{r.prenom}</span>
                    <StarDisplay rating={r.note} size={13} />
                  </div>
                  <p>{r.commentaire}</p>
                  <span className={styles.reviewDate}>
                    {new Date(r.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
