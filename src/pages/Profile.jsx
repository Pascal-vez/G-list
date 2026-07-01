import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageCircle, ArrowLeft, Phone, Clock, MapPin, Star, Heart,
  CheckCircle, X, Eye, BadgeCheck, Flag, Map, Globe, FileText,
} from 'lucide-react';
import { useProfessionalById } from '../hooks/useProfessionalById';
import { useProReviews } from '../hooks/useProReviews';
import { getInitials, getAvatarColor, getAvatarTextColor, formatWhatsAppLink, formatDate } from '../utils/helpers';
import {
  toggleFavorite, isFavorite, addQuoteRequest, getVisitorAccount,
} from '../utils/storage';
import { postReview, trackProfileView, trackWhatsAppClick } from '../api/reviews';
import { invalidateProfessionalsCache } from '../api/professionals';
import {
  getPlanBadgeLabel, getGalleryLimit, generatePlaceholderPhotos,
} from '../utils/proEnhancements';
import { addViewHistory } from '../utils/storage';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePageMeta } from '../hooks/usePageMeta';
import { useFavoritesSync } from '../hooks/useFavoritesSync';
import { sortByDistance } from '../utils/geo';
import StarRating, { StarDisplay } from '../components/StarRating';
import ShareButton from '../components/ShareButton';
import ReportModal from '../components/ReportModal';
import MapModal from '../components/MapModal';
import OpenStatusBadge from '../components/OpenStatusBadge';
import SocialLinks from '../components/SocialLinks';
import { getMinisiteSlugForPro, getProPlanLevel } from '../utils/storage';
import { useSupabase } from '../lib/supabaseClient';
import { fetchPublishedMinisiteSlug } from '../api/supabaseMinisite';
import { getMinisitePublicPath } from '../utils/minisite';
import styles from './Profile.module.css';

const TABS = [
  { id: 'about', label: 'À propos' },
  { id: 'services', label: 'Services' },
  { id: 'gallery', label: 'Galerie' },
  { id: 'reviews', label: 'Avis' },
  { id: 'contact', label: 'Contact' },
];

function RatingBars({ reviews }) {
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    stars: n,
    count: reviews.filter((r) => Math.round(r.note) === n).length,
  }));
  const total = reviews.length || 1;
  return (
    <div className={styles.ratingBars}>
      {counts.map(({ stars, count }) => (
        <div key={stars} className={styles.barRow}>
          <span>{stars}★</span>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${(count / total) * 100}%` }} />
          </div>
          <span className={styles.barCount}>{count}</span>
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  useFavoritesSync();
  const { id } = useParams();
  const { pro, loading } = useProfessionalById(id);
  const { reviews, reload: reloadReviews } = useProReviews(id);
  const [tab, setTab] = useState('about');
  const [form, setForm] = useState({ prenom: '', note: 0, commentaire: '' });
  const [submitted, setSubmitted] = useState(false);
  const [fav, setFav] = useState(() => isFavorite(id));
  const [lightbox, setLightbox] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ nom: '', service: '', message: '' });
  const [quoteSent, setQuoteSent] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [minisiteSlug, setMinisiteSlug] = useState(null);
  const { location } = useGeolocation();

  const effectivePlan = pro ? getProPlanLevel(pro) : 'free';
  const isPremium = effectivePlan === 'premium';

  useEffect(() => {
    if (!pro || !isPremium) {
      setMinisiteSlug(null);
      return;
    }
    if (useSupabase) {
      fetchPublishedMinisiteSlug(pro.id).then((slug) => setMinisiteSlug(slug || null));
      return;
    }
    setMinisiteSlug(getMinisiteSlugForPro(pro.id));
  }, [pro?.id, isPremium]);

  const proWithDistance = useMemo(() => {
    if (!pro || !location) return pro;
    const [sorted] = sortByDistance([pro], location.lat, location.lng);
    return sorted;
  }, [pro, location]);

  const jsonLd = pro ? {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: pro.nom,
    description: pro.description,
    telephone: pro.telephone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: pro.quartier,
      addressRegion: pro.region,
      addressCountry: 'GN',
    },
    aggregateRating: pro.nombreAvis ? {
      '@type': 'AggregateRating',
      ratingValue: pro.note,
      reviewCount: pro.nombreAvis,
    } : undefined,
  } : null;

  usePageMeta({
    title: pro?.nom,
    description: pro ? `${pro.profession} à ${pro.region} — ${pro.description?.slice(0, 120)}` : undefined,
    path: pro ? `/profil/${pro.id}` : undefined,
    type: 'profile',
    jsonLd,
  });

  useEffect(() => {
    if (!pro) return;
    trackProfileView(pro.id);
    addViewHistory({ id: pro.id, nom: pro.nom, categorie: pro.categorie });
  }, [pro, id]);

  if (loading) {
    return (
      <div className={styles.notFound}>
        <p>Chargement du profil…</p>
      </div>
    );
  }

  if (!pro) {
    return (
      <div className={styles.notFound}>
        <h1>Professionnel introuvable</h1>
        <Link to="/" className="btn-primary">← Retour à la liste</Link>
      </div>
    );
  }

  const allReviews = reviews;
  const planLabel = getPlanBadgeLabel(effectivePlan, pro.topGList);
  const isAdvancedOrPremium = effectivePlan === 'advanced' || isPremium;
  const galleryCount = getGalleryLimit(effectivePlan);
  const photos = generatePlaceholderPhotos(pro, galleryCount);
  const canRespond = isAdvancedOrPremium;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.prenom || !form.note || !form.commentaire) return;
    try {
      await postReview(id, {
        prenom: form.prenom,
        note: form.note,
        commentaire: form.commentaire,
      });
      await reloadReviews();
      invalidateProfessionalsCache();
      setForm({ prenom: '', note: 0, commentaire: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setSubmitted(false);
    }
  };

  const handleWhatsApp = () => {
    trackWhatsAppClick(pro.id);
  };

  const handleQuote = (e) => {
    e.preventDefault();
    const visitor = getVisitorAccount();
    addQuoteRequest(pro.id, { ...quoteForm, visitorEmail: visitor?.email || 'anonyme@glist.gn' });
    setQuoteSent(true);
    setQuoteForm({ nom: '', service: '', message: '' });
  };

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}><ArrowLeft size={18} /> Retour à la liste</Link>

      <header className={styles.hero}>
        <div className={styles.cover} style={{ background: getAvatarColor(pro.categorie) }} />
        <div className={styles.heroContent}>
          <div className={styles.avatarLarge} style={{ background: getAvatarColor(pro.categorie), color: getAvatarTextColor(getAvatarColor(pro.categorie)) }}>
            {getInitials(pro.nom)}
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.nameRow}>
              <h1 className="hero-display">{pro.nom}</h1>
              {pro.verifie && (
                <span className={styles.verifiedBadge}><BadgeCheck size={16} /> Vérifié</span>
              )}
              <span className={`${styles.planBadge} ${effectivePlan === 'premium' ? styles.planBadgePremium : effectivePlan === 'advanced' ? styles.planBadgeAdvanced : ''}`}>{planLabel}</span>
            </div>
            <p className={styles.profession}>{pro.profession}</p>
            {pro.slogan && <p className={styles.slogan}>{pro.slogan}</p>}
            <OpenStatusBadge horaires={pro.horaires} />
            <div className={styles.ratingLine}>
              <Star size={16} className={styles.starIcon} />
              <strong>{pro.note}</strong>
              <span>({allReviews.length} avis)</span>
            </div>
            <p className={styles.location}><MapPin size={14} /> {pro.region} — {pro.quartier}</p>
            <div className={styles.heroActions}>
              {minisiteSlug && (
                <Link to={getMinisitePublicPath(minisiteSlug)} className={styles.visitSiteBtn}>
                  <Globe size={18} /> Visiter le site
                </Link>
              )}
              {isPremium && (
                <button type="button" className={styles.quoteBtn} onClick={() => setTab('contact')}>
                  <FileText size={18} /> Demande de devis
                </button>
              )}
              <a href={formatWhatsAppLink(pro.telephone)} target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn} onClick={handleWhatsApp}>
                <MessageCircle size={18} /> WhatsApp
              </a>
              <a href={`tel:${(pro.telephone || '').replace(/\s/g, '')}`} className={styles.phoneBtn}>
                <Phone size={18} /> Appeler
              </a>
              <button type="button" className={styles.mapBtn} onClick={() => setShowMap(true)}>
                <Map size={18} /> Carte
              </button>
              <ShareButton
                className={styles.shareBtn}
                title={pro.nom}
                text={`${pro.profession} sur G-List`}
                url={`${window.location.origin}/profil/${pro.id}`}
              />
              <button type="button" className={styles.reportBtn} onClick={() => setShowReport(true)}>
                <Flag size={16} /> Signaler
              </button>
              <button type="button" className={`${styles.favBtn} ${fav ? styles.favActive : ''}`} onClick={() => setFav(toggleFavorite(pro.id))}>
                <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
              </button>
            </div>
            {pro.social && <SocialLinks social={pro.social} size="md" />}
            <div className={styles.statsLine}>
              <span><Eye size={14} /> {pro.vues} vues</span>
              <span><Heart size={14} /> {pro.favoris} favoris</span>
              <span><MessageCircle size={14} /> {pro.whatsappClicks} clics WhatsApp</span>
            </div>
          </div>
        </div>
      </header>

      <nav className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className={styles.tabContent}>
        {tab === 'about' && (
          <section>
            {pro.description && <p className={styles.description}>{pro.description}</p>}
            <div className={styles.infoGrid}>
              {pro.horaires && <p><Clock size={16} /> {pro.horaires}</p>}
              {!!pro.experience && <p><Star size={16} /> {pro.experience} ans d&apos;expérience</p>}
            </div>
            {pro.specialites?.length > 0 && (
              <div className={styles.tags}>
                {pro.specialites.map((s) => <span key={s} className={styles.tag}>{s}</span>)}
              </div>
            )}
            {(pro.langues || []).length > 0 && (
              <div className={styles.langues}>
                <strong>Langues :</strong> {(pro.langues || []).join(' · ')}
              </div>
            )}
          </section>
        )}

        {tab === 'services' && (
          <section>
            <div className={styles.servicesList}>
              {(pro.services || []).slice(0, effectivePlan === 'free' ? 3 : undefined).map((s, i) => (
                <div key={i} className={styles.serviceCard}>
                  <h3>{s.nom}</h3>
                  <p>{s.description}</p>
                  {(effectivePlan === 'premium') && <span className={styles.servicePrice}>{s.prix}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'gallery' && (
          <section>
            <div className={styles.gallery}>
              {photos.map((p) => (
                <button key={p.id} type="button" className={styles.galleryItem} style={{ background: p.color }} onClick={() => setLightbox(p)}>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {tab === 'reviews' && (
          <section>
            <div className={styles.reviewsSummary}>
              <div className={styles.overallRating}>
                <span className={styles.bigRating}>{pro.note}</span>
                <StarDisplay rating={pro.note} size={22} />
                <span>{allReviews.length} avis</span>
              </div>
              <RatingBars reviews={allReviews} />
            </div>
            <div className={styles.reviewsList}>
              {allReviews.map((avis, i) => (
                <div key={avis.id || i} className={styles.review}>
                  <div className={styles.reviewHeader}>
                    <span>{avis.prenom}</span>
                    <StarDisplay rating={avis.note} size={14} />
                  </div>
                  <p>{avis.commentaire}</p>
                  <span className={styles.reviewDate}>{formatDate(avis.date)}</span>
                  {canRespond && avis.response && (
                    <div className={styles.proResponse}>
                      <strong>Réponse du pro :</strong>
                      <p>{avis.response.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.reviewForm}>
              <h3>Laisser un avis</h3>
              {submitted && <p className={styles.success}><CheckCircle size={16} /> Merci ! Votre avis a été publié.</p>}
              <form onSubmit={handleSubmit}>
                <label>Prénom<input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required className={styles.input} /></label>
                <label>Note<StarRating value={form.note} onChange={(note) => setForm({ ...form, note })} /></label>
                <label>Commentaire<textarea value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} required rows={3} className={styles.textarea} /></label>
                <button type="submit" className="btn-primary" disabled={!form.note}>Envoyer</button>
              </form>
            </div>
          </section>
        )}

        {tab === 'contact' && (
          <section>
            <div className={styles.contactInfo}>
              <p><Phone size={16} /> {pro.telephone ? <a href={`tel:${pro.telephone.replace(/\s/g, '')}`}>{pro.telephone}</a> : '—'}</p>
              {pro.email && <p><MessageCircle size={16} /> <a href={`mailto:${pro.email}`}>{pro.email}</a></p>}
              <p><MapPin size={16} /> {pro.region} — {pro.quartier}</p>
              <p><Clock size={16} /> {pro.horaires}</p>
              <button type="button" className={styles.mapLink} onClick={() => setShowMap(true)}>
                <Map size={16} /> Voir sur la carte
              </button>
            </div>
            <a href={formatWhatsAppLink(pro.telephone)} target="_blank" rel="noopener noreferrer" className={styles.whatsappLarge} onClick={handleWhatsApp}>
              <MessageCircle size={22} /> Contacter sur WhatsApp
            </a>
            {isPremium && (
              <div className={styles.quoteForm}>
                <h3>Demande de devis</h3>
                {quoteSent && <p className={styles.success}><CheckCircle size={16} /> Demande envoyée !</p>}
                <form onSubmit={handleQuote}>
                  <label>Nom<input value={quoteForm.nom} onChange={(e) => setQuoteForm({ ...quoteForm, nom: e.target.value })} required className={styles.input} /></label>
                  <label>Service souhaité<input value={quoteForm.service} onChange={(e) => setQuoteForm({ ...quoteForm, service: e.target.value })} required className={styles.input} /></label>
                  <label>Message<textarea value={quoteForm.message} onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })} required rows={3} className={styles.textarea} /></label>
                  <button type="submit" className="btn-primary">Envoyer la demande</button>
                </form>
              </div>
            )}
          </section>
        )}
      </div>

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button type="button" className={styles.lightboxClose} aria-label="Fermer"><X size={24} /></button>
          <div className={styles.lightboxContent} style={{ background: lightbox.color }} onClick={(e) => e.stopPropagation()}>
            <span>{lightbox.label}</span>
          </div>
        </div>
      )}

      {showMap && (
        <MapModal pro={proWithDistance || pro} userLocation={location} onClose={() => setShowMap(false)} />
      )}

      {showReport && (
        <ReportModal pro={pro} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
