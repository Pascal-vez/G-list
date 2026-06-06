import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Phone, Clock, MapPin, Star, BadgeCheck, CheckCircle, ExternalLink } from 'lucide-react';
import { getProfessionalById } from '../data/professionals';
import { getInitials, getAvatarColor, formatWhatsAppLink, formatDate } from '../utils/helpers';
import { getGoogleMapsEmbedUrl, getGoogleMapsDirectionsUrl } from '../utils/geo';
import { getProfileReviews, addProfileReview } from '../utils/storage';
import { useGeolocation } from '../hooks/useGeolocation';
import StarRating, { StarDisplay } from '../components/StarRating';
import OpenStatusBadge from '../components/OpenStatusBadge';
import styles from './Profile.module.css';

export default function Profile() {
  const { id } = useParams();
  const pro = getProfessionalById(id);
  const [reviews, setReviews] = useState(() => getProfileReviews(id));
  const [form, setForm] = useState({ prenom: '', note: 0, commentaire: '' });
  const [submitted, setSubmitted] = useState(false);
  const { location } = useGeolocation();

  if (!pro) {
    return (
      <div className={styles.notFound}>
        <h1>Professionnel introuvable</h1>
        <Link to="/" className="btn-primary">← Retour à la liste</Link>
      </div>
    );
  }

  const allReviews = [...reviews, ...pro.avis];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.prenom || !form.note || !form.commentaire) return;
    const review = {
      prenom: form.prenom,
      note: form.note,
      commentaire: form.commentaire,
      date: new Date().toISOString().split('T')[0],
    };
    addProfileReview(id, review);
    setReviews([review, ...reviews]);
    setForm({ prenom: '', note: 0, commentaire: '' });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>
        <ArrowLeft size={18} /> Retour à la liste
      </Link>

      <div className={styles.header}>
        <div
          className={styles.avatar}
          style={{ background: getAvatarColor(pro.categorie) }}
        >
          {getInitials(pro.nom)}
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{pro.nom}</h1>
            <span className={`badge-verified ${pro.verifie ? 'verified' : 'unverified'}`}>
              {pro.verifie && <BadgeCheck size={12} />}
              {pro.verifie ? 'Vérifié' : 'Non vérifié'}
            </span>
          </div>
          <p className={styles.profession}>{pro.profession}</p>
          <div className={styles.statusRow}>
            <OpenStatusBadge horaires={pro.horaires} />
          </div>
          <p className={styles.rating}>
            <Star size={14} className={styles.starIcon} />
            {pro.note} · ({pro.nombreAvis + reviews.length} avis)
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Informations</h2>
        <div className={styles.infoList}>
          <p><MapPin size={16} /> {pro.region} — {pro.quartier}</p>
          <p><Phone size={16} /> {pro.telephone}</p>
          <p className={styles.horairesRow}>
            <Clock size={16} />
            <span>{pro.horaires}</span>
          </p>
        </div>
        <a
          href={formatWhatsAppLink(pro.telephone)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappLarge}
        >
          <MessageCircle size={20} />
          Contacter sur WhatsApp
        </a>
        <p className={styles.description}>{pro.description}</p>

        <div className={styles.mapSection}>
          <iframe
            title={`Localisation — ${pro.nom}`}
            src={getGoogleMapsEmbedUrl(pro.lat, pro.lng)}
            className={styles.map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <a
            href={getGoogleMapsDirectionsUrl(pro.lat, pro.lng, location?.lat, location?.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapLink}
          >
            <ExternalLink size={16} />
            Voir l'itinéraire sur Google Maps
          </a>
        </div>
      </section>

      {pro.specialites?.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Spécialités</h2>
          <div className={styles.tags}>
            {pro.specialites.map((s) => (
              <span key={s} className={styles.tag}>{s}</span>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Avis clients</h2>
        <div className={styles.overallRating}>
          <span className={styles.bigRating}>{pro.note}</span>
          <StarDisplay rating={pro.note} size={22} />
          <span className={styles.reviewCount}>{allReviews.length} avis</span>
        </div>
        <div className={styles.reviewsList}>
          {allReviews.map((avis, i) => (
            <div key={i} className={styles.review}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewName}>{avis.prenom}</span>
                <StarDisplay rating={avis.note} size={14} />
              </div>
              <p className={styles.reviewComment}>{avis.commentaire}</p>
              <span className={styles.reviewDate}>{formatDate(avis.date)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Laisser un avis</h2>
        {submitted && (
          <p className={styles.success}>
            <CheckCircle size={16} />
            Merci ! Votre avis a été publié.
          </p>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Votre prénom
            <input
              type="text"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              required
              className={styles.input}
            />
          </label>
          <label>
            Note
            <StarRating
              value={form.note}
              onChange={(note) => setForm({ ...form, note })}
            />
          </label>
          <label>
            Commentaire
            <textarea
              value={form.commentaire}
              onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
              required
              rows={4}
              className={styles.textarea}
            />
          </label>
          <button type="submit" className="btn-primary" disabled={!form.note}>
            Envoyer
          </button>
        </form>
      </section>
    </div>
  );
}
