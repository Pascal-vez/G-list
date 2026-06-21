import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown, ArrowRight, Lightbulb, TrendingUp, AlertTriangle,
  Eye, MessageSquare, Star, Heart, MapPin, Clock, BadgeCheck,
  Share2, Pencil, Phone, Globe, Building2, Camera, Users, ArrowUp, ArrowDown, Check, Shield, Award,
  Plus, Upload, Sparkles, Target, Trash2, Image as ImageIcon, Zap, FileText, Briefcase, Bell, MessageCircle,
  History, CreditCard, Download,
} from 'lucide-react';
import ProCard from '../components/ProCard';
import BarChart from '../components/dashboard/BarChart';
import MetricCard from '../components/dashboard/MetricCard';
import ThemeToggle from '../components/ThemeToggle';
import { useProfessionalsList } from '../hooks/useProfessionalsList';
import { CATEGORIES } from '../data/constants';
import { useProReviews } from '../hooks/useProReviews';
import { useProAnalytics } from '../hooks/useProAnalytics';
import { postReviewResponse } from '../api/reviews';
import {
  getCrmProspects, moveCrmProspect, getMinisite, saveMinisite,
  getProServices, saveProServices, getProPhotos, saveProPhotos,
  getProStats, saveProAccount,
  getSubscriptionPlans, getPlanPrice, getAnnualSavings, ANNUAL_PAID_MONTHS,
  BILLING_CYCLE_MONTHLY, BILLING_CYCLE_ANNUAL, formatBillingCycleLabel,
  ALERT_EVENT_TYPES, getProAlertSettings, toggleProAlert, getProPlanLevel,
} from '../utils/storage';
import {
  computeReputationBreakdown,
  getCategoryRank, buildProSuggestions, buildProAlerts,
} from '../utils/proAnalytics';
import { filterByDateRange, formatPeriodShort } from '../utils/dateRange';
import AbonnementStatus from '../components/Abonnement/AbonnementStatus';
import { isAbonnementActif } from '../utils/plans';
import { getActiveBroadcastsForUser, dismissBroadcast } from '../utils/adminBroadcasts';
import { getActivityHistory } from '../utils/activityHistory';
import { getBillingHistory, getBillingStatusLabel } from '../utils/billingHistory';
import { getSecuritySessions, exportProGdprData } from '../utils/platformEvents';
import NotificationInbox from '../components/NotificationInbox';
import { getInitials, getAvatarColor } from '../utils/helpers';
import { StarDisplay } from '../components/StarRating';
import ProCardPreview from '../components/ProCardPreview';
import MinisiteEditor from '../components/minisite/MinisiteEditor';
import ProReportGenerator from '../components/pro/ProReportGenerator';
import PasswordInput from '../components/PasswordInput';
import { NETWORKS } from '../components/SocialLinks';
import styles from './ProDashboardExtras.module.css';

function formatGNF(n) {
  return new Intl.NumberFormat('fr-GN').format(n);
}

function PremiumPanel({ title, subtitle, children, action }) {
  return (
    <section className={styles.premiumPanel}>
      {(title || subtitle || action) && (
        <div className={styles.premiumPanelHead}>
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <span>{subtitle}</span>}
          </div>
          {action}
        </div>
      )}
      <div className={styles.premiumPanelBody}>{children}</div>
    </section>
  );
}

const FIELD_LABELS = {
  nom: 'Nom de l\'entreprise',
  telephone: 'Téléphone',
  quartier: 'Quartier',
};

export function ServicesTab({ account, plan, onSave }) {
  const [services, setServices] = useState(() => {
    const saved = getProServices(account.id);
    if (saved.length) return saved;
    return (account.services || []).map((s) => ({ nom: s, description: '' }));
  });
  const limit = plan === 'free' ? 3 : 20;

  const add = () => {
    if (services.length >= limit) return;
    setServices([...services, { nom: '', description: '' }]);
  };

  const remove = (i) => setServices(services.filter((_, idx) => idx !== i));

  const save = () => {
    saveProServices(account.id, services);
    onSave({ ...account, services: services.map((s) => s.nom) });
  };

  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <Briefcase size={20} aria-hidden="true" />
        <div>
          <strong>Catalogue de services</strong>
          <p>Présentez clairement votre offre aux visiteurs de G-List.</p>
        </div>
        <span className={styles.premiumBadge}>{services.length}/{limit}</span>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard icon={Briefcase} value={services.length} label="Services actifs" period={`Limite ${limit}`} accent="#F5C518" />
        <MetricCard icon={Eye} value={`${Math.min(100, services.length * 25)}%`} label="Complétion" period="Section services" accent="#4CAF50" />
        <MetricCard icon={Plus} value={Math.max(0, limit - services.length)} label="Places restantes" period="Disponibles" accent="#5C9EFF" />
        <MetricCard icon={Target} value={`${Math.round((services.length / limit) * 100)}%`} label="Remplissage" period="Du quota" accent="#AB47BC" />
      </div>

      <PremiumPanel title="Vos prestations" subtitle="Nom et description visibles sur votre profil public">
        <div className={styles.serviceList}>
          {services.map((s, i) => (
            <div key={i} className={styles.serviceItem}>
              <div className={styles.serviceItemHead}>
                <span className={styles.serviceNum}>{i + 1}</span>
                {services.length > 1 && (
                  <button type="button" className={styles.serviceRemove} onClick={() => remove(i)} aria-label="Supprimer">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <input
                placeholder="Nom du service"
                value={s.nom}
                onChange={(e) => { const n = [...services]; n[i].nom = e.target.value; setServices(n); }}
                className={styles.premiumInput}
              />
              <textarea
                placeholder="Description courte (bénéfices, durée, tarif indicatif…)"
                value={s.description}
                onChange={(e) => { const n = [...services]; n[i].description = e.target.value; setServices(n); }}
                className={styles.premiumTextarea}
                rows={2}
              />
            </div>
          ))}
          {services.length === 0 && (
            <div className={styles.premiumEmpty}>Aucun service — ajoutez votre première prestation.</div>
          )}
        </div>
        {services.length < limit && (
          <button type="button" onClick={add} className={styles.premiumAddBtn}>
            <Plus size={16} aria-hidden="true" /> Ajouter un service
          </button>
        )}
      </PremiumPanel>

      {plan === 'free' && (
        <div className={styles.repTip}>
          <Crown size={18} aria-hidden="true" />
          <p><strong>Plan Free :</strong> 3 services maximum. Passez en Advanced pour un catalogue illimité.</p>
        </div>
      )}

      <div className={styles.premiumFoot}>
        <button type="button" onClick={save} className={styles.premiumSaveBtn}>Sauvegarder les services</button>
      </div>
    </div>
  );
}

export function PhotosTab({ account, plan }) {
  const [photos, setPhotos] = useState(() => getProPhotos(account.id));
  const limit = plan === 'free' ? 2 : plan === 'advanced' ? 6 : 12;

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || photos.length >= limit) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...photos, reader.result];
      setPhotos(next);
      saveProPhotos(account.id, next);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (i) => {
    const next = photos.filter((_, idx) => idx !== i);
    setPhotos(next);
    saveProPhotos(account.id, next);
  };

  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <ImageIcon size={20} aria-hidden="true" />
        <div>
          <strong>Galerie photos</strong>
          <p>Des visuels de qualité augmentent la confiance et les contacts.</p>
        </div>
        <span className={styles.premiumBadge}>{photos.length}/{limit}</span>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard icon={Camera} value={photos.length} label="Photos publiées" period={`Max ${limit}`} accent="#AB47BC" />
        <MetricCard icon={TrendingUp} value="+40%" label="Impact estimé" period="Avec 4+ photos" accent="#4CAF50" />
        <MetricCard icon={Plus} value={Math.max(0, limit - photos.length)} label="Places restantes" period="Disponibles" accent="#5C9EFF" />
        <MetricCard icon={Target} value={`${Math.round((photos.length / limit) * 100)}%`} label="Galerie" period="Remplissage" accent="#F5C518" />
      </div>

      <PremiumPanel title="Portfolio visuel" subtitle="JPEG ou PNG — affichées sur votre fiche publique">
        <div className={styles.photoGridPremium}>
          {photos.map((p, i) => (
            <div key={i} className={styles.photoTile}>
              <div className={styles.photoItem} style={{ backgroundImage: `url(${p})` }} />
              <button type="button" className={styles.photoRemove} onClick={() => removePhoto(i)} aria-label="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {photos.length < limit && (
            <label className={styles.uploadBoxPremium}>
              <Upload size={22} aria-hidden="true" />
              <span>Ajouter une photo</span>
              <input type="file" accept="image/*" onChange={handleUpload} hidden />
            </label>
          )}
        </div>
        {photos.length === 0 && (
          <p className={styles.premiumEmptyHint}>Glissez ou cliquez pour importer votre première image.</p>
        )}
      </PremiumPanel>

      {plan === 'free' && (
        <div className={styles.repTip}>
          <Crown size={18} aria-hidden="true" />
          <p><strong>Plan Free :</strong> 2 photos. Advanced permet 6, Premium jusqu&apos;à 12.</p>
        </div>
      )}
    </div>
  );
}

export function ReviewsTabExtended({ account, plan, dateRange }) {
  const { reviews: allReviews, reload } = useProReviews(account?.id);
  const reviews = useMemo(
    () => filterByDateRange(allReviews, dateRange.startDate, dateRange.endDate),
    [allReviews, dateRange.startDate, dateRange.endDate],
  );
  const periodLabel = formatPeriodShort(dateRange.startDate, dateRange.endDate);
  const [responses, setResponses] = useState({});
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.note, 0) / reviews.length).toFixed(1)
    : '—';
  const responded = reviews.filter((r) => r.response).length;
  const pending = reviews.length - responded;

  const saveResponse = async (reviewId, text) => {
    if (plan === 'free' || !text?.trim()) return;
    await postReviewResponse(account.id, reviewId, text);
    setResponses({ ...responses, [reviewId]: '' });
    reload();
  };

  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <MessageSquare size={20} aria-hidden="true" />
        <div>
          <strong>Gestion des avis</strong>
          <p>Avis reçus sur la période sélectionnée ({periodLabel}).</p>
        </div>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard icon={Star} value={avg} label="Note moyenne" period={`${reviews.length} avis`} accent="#F5C518" />
        <MetricCard icon={MessageSquare} value={responded} label="Réponses publiées" period="Engagement" accent="#5C9EFF" />
        <MetricCard icon={Heart} value={reviews.filter((r) => r.note >= 4).length} label="Avis positifs" period="4★ et plus" accent="#4CAF50" />
        <MetricCard icon={AlertTriangle} value={pending} label="Sans réponse" period="À traiter" accent="#FF9800" />
      </div>

      {plan === 'free' && (
        <div className={styles.repTip}>
          <Crown size={18} aria-hidden="true" />
          <p><strong>Plan Free :</strong> lecture seule. Passez en Advanced pour répondre aux avis.</p>
        </div>
      )}

      <PremiumPanel title="Avis clients" subtitle={reviews.length ? `${reviews.length} avis sur la période` : 'Aucun avis sur cette période'}>
        {reviews.length === 0 ? (
          <div className={styles.premiumEmpty}>Les premiers avis apparaîtront ici dès qu&apos;un visiteur laissera un commentaire.</div>
        ) : (
          <div className={styles.reviewListPremium}>
            {reviews.map((r) => {
              const existing = r.response;
              return (
                <article key={r.id} className={styles.reviewCardPremium}>
                  <div className={styles.reviewHead}>
                    <div className={styles.reviewAuthor}>
                      <span className={styles.reviewAvatar}>{r.prenom?.[0] || '?'}</span>
                      <div>
                        <strong>{r.prenom}</strong>
                        <StarDisplay rating={r.note} size={13} />
                      </div>
                    </div>
                    <span className={styles.reviewNoteBadge}>{r.note}★</span>
                  </div>
                  <p className={styles.reviewBody}>{r.commentaire}</p>
                  {existing && (
                    <div className={styles.responsePremium}>
                      <strong>Votre réponse</strong>
                      <p>{existing.text}</p>
                    </div>
                  )}
                  {plan !== 'free' && !existing && (
                    <div className={styles.responseFormPremium}>
                      <input
                        placeholder="Rédiger une réponse professionnelle…"
                        value={responses[r.id] || ''}
                        onChange={(e) => setResponses({ ...responses, [r.id]: e.target.value })}
                        className={styles.premiumInput}
                      />
                      <button type="button" onClick={() => saveResponse(r.id, responses[r.id])} className={styles.premiumActionBtn}>
                        Publier la réponse
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </PremiumPanel>
    </div>
  );
}

const PLAN_ORDER = { free: 0, advanced: 1, premium: 2 };

const PLAN_VISUALS = {
  free: { icon: Briefcase, cardClass: 'billingCardFree', label: 'Découverte' },
  advanced: { icon: Zap, cardClass: 'billingCardAdvanced', label: 'Croissance' },
  premium: { icon: Crown, cardClass: 'billingCardPremium', label: 'Performance' },
};

export function UpgradeTab({ account, plan, onSubscribe }) {
  const [billingCycle, setBillingCycle] = useState(BILLING_CYCLE_MONTHLY);
  const abonnementActif = isAbonnementActif(account);
  const plans = useMemo(() => getSubscriptionPlans(), []);
  const tiers = useMemo(() => [
    plans.free,
    plans.advanced,
    plans.premium,
  ], [plans]);

  return (
    <div className={styles.billingPage}>
      <div className={styles.billingIntro}>
        <div className={styles.billingIntroIcon}>
          <Crown size={22} aria-hidden="true" />
        </div>
        <div className={styles.billingIntroText}>
          <strong>Offres pour {account.nom}</strong>
          <p>Choisissez le plan adapté à votre activité. Changez d&apos;offre à tout moment, sans engagement caché.</p>
        </div>
        <span className={styles.billingIntroPlan}>
          Plan actuel · <em>{plans[plan]?.name || 'Free'}</em>
        </span>
      </div>

      <div className={styles.billingCycleBar}>
        <span className={styles.billingCycleLabel}>Facturation</span>
        <div className={styles.billingCycleToggle} role="group" aria-label="Cycle de facturation">
          <button
            type="button"
            className={billingCycle === BILLING_CYCLE_MONTHLY ? styles.billingCycleActive : ''}
            onClick={() => setBillingCycle(BILLING_CYCLE_MONTHLY)}
          >
            Mensuel
          </button>
          <button
            type="button"
            className={billingCycle === BILLING_CYCLE_ANNUAL ? styles.billingCycleActive : ''}
            onClick={() => setBillingCycle(BILLING_CYCLE_ANNUAL)}
          >
            Annuel
            <em>−2 mois</em>
          </button>
        </div>
      </div>

      <div className={styles.billingGrid}>
        {tiers.map((t) => {
          const isCurrent = plan === t.id;
          const isUpgrade = PLAN_ORDER[t.id] > PLAN_ORDER[plan];
          const isDowngrade = PLAN_ORDER[t.id] < PLAN_ORDER[plan];
          const price = getPlanPrice(t.id, billingCycle);
          const savings = billingCycle === BILLING_CYCLE_ANNUAL ? getAnnualSavings(t.id) : 0;
          const visual = PLAN_VISUALS[t.id] || PLAN_VISUALS.free;
          const PlanIcon = visual.icon;

          return (
            <article
              key={t.id}
              className={[
                styles.billingCard,
                styles[visual.cardClass],
                isCurrent ? styles.billingCardCurrent : '',
                t.recommended && !isCurrent ? styles.billingCardRecommended : '',
              ].filter(Boolean).join(' ')}
            >
              <div className={styles.billingCardAccent} aria-hidden="true" />

              {t.recommended && !isCurrent && (
                <span className={styles.billingRibbon}>
                  <Sparkles size={11} aria-hidden="true" />
                  Recommandé
                </span>
              )}
              {isCurrent && (
                <span className={styles.billingRibbonCurrent}>
                  <BadgeCheck size={11} aria-hidden="true" />
                  Plan actuel
                </span>
              )}

              <div className={styles.billingCardBody}>
                <header className={styles.billingCardHeader}>
                  <div className={styles.billingPlanIcon}>
                    <PlanIcon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <span className={styles.billingPlanLabel}>{visual.label}</span>
                    <h3>{t.name}</h3>
                    <p className={styles.billingTagline}>{t.tagline}</p>
                  </div>
                </header>

                <div className={styles.billingPriceBlock}>
                  {t.priceMonthly ? (
                    <>
                      <div className={styles.billingPriceRow}>
                        <span className={styles.billingAmount}>{formatGNF(price)}</span>
                        <span className={styles.billingCurrency}>GNF</span>
                        <span className={styles.billingPeriod}>
                          / {billingCycle === BILLING_CYCLE_ANNUAL ? 'an' : 'mois'}
                        </span>
                      </div>
                      {billingCycle === BILLING_CYCLE_ANNUAL && savings > 0 && (
                        <span className={styles.billingSavings}>
                          Économie {formatGNF(savings)} GNF · {ANNUAL_PAID_MONTHS} mois payés pour 12
                        </span>
                      )}
                      {billingCycle === BILLING_CYCLE_ANNUAL && t.priceMonthly > 0 && (
                        <span className={styles.billingEquiv}>
                          soit {formatGNF(Math.round(price / 12))} GNF / mois
                        </span>
                      )}
                    </>
                  ) : (
                    <div className={styles.billingPriceRow}>
                      <span className={styles.billingAmount}>Gratuit</span>
                      <span className={styles.billingPeriod}>Sans engagement</span>
                    </div>
                  )}
                </div>

                {t.description && (
                  <p className={styles.billingDescription}>{t.description}</p>
                )}

                <ul className={styles.billingFeatures}>
                  {t.features.map((f) => (
                    <li key={f}>
                      <span className={styles.billingCheckWrap}>
                        <Check size={12} className={styles.billingCheck} aria-hidden="true" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.billingCardFoot}>
                {isCurrent ? (
                  <span className={styles.billingFootCurrent}>
                    <BadgeCheck size={16} aria-hidden="true" />
                    Abonnement actif
                  </span>
                ) : isUpgrade ? (
                  <button type="button" onClick={() => onSubscribe?.(t.id)} className={styles.billingCtaPrimary}>
                    <Crown size={16} aria-hidden="true" />
                    S&apos;abonner — {t.name}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                ) : isDowngrade && abonnementActif ? (
                  <span className={styles.billingFootCurrent}>
                    Changement indisponible tant que l&apos;abonnement est actif
                  </span>
                ) : isDowngrade ? (
                  <button type="button" onClick={() => onSubscribe?.(t.id)} className={styles.billingCtaSecondary}>
                    Revenir à {t.name}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.billingTrust}>
        <span><Shield size={14} aria-hidden="true" /> Paiement sécurisé</span>
        <span><CreditCard size={14} aria-hidden="true" /> {billingCycle === BILLING_CYCLE_ANNUAL ? 'Facturation annuelle' : 'Facturation mensuelle'}</span>
        <span><MessageCircle size={14} aria-hidden="true" /> Assistance WhatsApp</span>
      </div>
    </div>
  );
}

export function AnalyticsTab({ account, dateRange }) {
  const { startDate, endDate } = dateRange;
  const { metrics, chartData, loading } = useProAnalytics(account, dateRange);
  const periodLabel = formatPeriodShort(startDate, endDate);
  const { sources, visibilityScore } = metrics;

  if (loading) {
    return <div className={styles.tab}><p>Chargement des statistiques…</p></div>;
  }

  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <TrendingUp size={20} aria-hidden="true" />
        <div>
          <strong>Analytics & performance</strong>
          <p>Données filtrées sur la période sélectionnée ({periodLabel}).</p>
        </div>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard icon={Eye} value={metrics.views} label="Vues profil" period={periodLabel} trend={metrics.viewsTrend} accent="#5C9EFF" />
        <MetricCard icon={MessageCircle} value={metrics.whatsapp} label="Clics WhatsApp" period="Conversions" trend={metrics.whatsappTrend} accent="#25D366" />
        <MetricCard icon={Heart} value={metrics.favorites} label="Favoris" period="Engagement" trend={metrics.favoritesTrend} accent="#F5C518" />
        <MetricCard icon={Target} value={`${metrics.engagement}%`} label="Taux engagement" period="Vues → contact" accent="#AB47BC" />
      </div>

      <PremiumPanel title="Évolution des vues" subtitle={`Tendance sur ${periodLabel}`}>
        <BarChart data={chartData} height={120} />
      </PremiumPanel>

      <div className={styles.analyticsGrid}>
        <PremiumPanel title="Sources de trafic" subtitle="D&apos;où viennent vos visiteurs">
          <div className={styles.sourcesPremium}>
            {[
              { label: 'Recherche directe', pct: sources.direct, color: '#F5C518' },
              { label: 'Via catégorie', pct: sources.category, color: '#5C9EFF' },
              { label: 'Via ville', pct: sources.region, color: '#4CAF50' },
            ].map((s) => (
              <div key={s.label} className={styles.sourceRow}>
                <div className={styles.sourceRowTop}>
                  <span>{s.label}</span>
                  <strong>{s.pct}%</strong>
                </div>
                <div className={styles.sourceTrack}>
                  <div className={styles.sourceFill} style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </PremiumPanel>

        <PremiumPanel title="Funnel de conversion" subtitle="Du premier clic au contact">
          <div className={styles.funnelPremium}>
            <div className={styles.funnelStep}>
              <Eye size={18} aria-hidden="true" />
              <div>
                <span>Vues profil</span>
                <strong>{metrics.views}</strong>
              </div>
            </div>
            <ArrowRight size={16} className={styles.funnelArrow} aria-hidden="true" />
            <div className={styles.funnelStep}>
              <Users size={18} aria-hidden="true" />
              <div>
                <span>Clics fiche</span>
                <strong>{metrics.profileClicks}</strong>
                <small>{metrics.views ? Math.round(metrics.profileClicks / metrics.views * 100) : 0}%</small>
              </div>
            </div>
            <ArrowRight size={16} className={styles.funnelArrow} aria-hidden="true" />
            <div className={styles.funnelStep}>
              <MessageCircle size={18} aria-hidden="true" />
              <div>
                <span>WhatsApp</span>
                <strong>{metrics.whatsapp}</strong>
                <small>{metrics.engagement}%</small>
              </div>
            </div>
          </div>
        </PremiumPanel>
      </div>

      <PremiumPanel title="Score de visibilité" subtitle="Indice composite G-List">
        <div className={styles.visibilityBlock}>
          <div className={styles.scoreBarPremium}>
            <div style={{ width: `${visibilityScore}%` }} />
          </div>
          <span className={styles.visibilityScore}>{visibilityScore} / 100</span>
        </div>
      </PremiumPanel>

      <div className={styles.repTip}>
        <Lightbulb size={18} aria-hidden="true" />
        <p><strong>Conseil :</strong> complétez votre profil, ajoutez des photos et répondez aux avis pour améliorer votre score.</p>
      </div>
    </div>
  );
}

function visibilityScore(pro) {
  return Math.round((pro.note || 0) * 15 + (pro.nombreAvis || 0) * 3 + (pro.vues || 0) * 0.05);
}

const CONCURRENCE_SORT_LABELS = {
  score: 'score de visibilité',
  note: 'note',
  nombreAvis: "nombre d'avis",
  vues: 'vues',
  nom: 'nom',
};

function resolveCategoryName(categorieIdOrName) {
  const byId = CATEGORIES.find((c) => c.id === categorieIdOrName);
  if (byId) return byId.name;
  const byName = CATEGORIES.find((c) => c.name === categorieIdOrName);
  return byName?.name || categorieIdOrName;
}

function buildCategoryPeers(account, allPros) {
  const categoryName = resolveCategoryName(account.categorie);
  const accountNote = account.note || 0;

  const inCategory = allPros.filter((p) => p.categorie === categoryName);
  const hasSelf = inCategory.some((p) => p.id === account.id);

  const peers = hasSelf
    ? inCategory
    : [
      ...inCategory,
      {
        id: account.id,
        nom: account.nom,
        categorie: categoryName,
        note: Math.round(accountNote * 10) / 10,
        nombreAvis: reviews.length,
        vues: account.profileViews || 0,
      },
    ];

  return peers.map((p) => ({ ...p, score: visibilityScore(p) }));
}

function sortPeers(peers, sortKey, sortDir) {
  const sorted = [...peers];
  const dir = sortDir === 'desc' ? -1 : 1;
  sorted.sort((a, b) => {
    if (sortKey === 'nom') return dir * a.nom.localeCompare(b.nom, 'fr');
    return dir * ((a[sortKey] ?? 0) - (b[sortKey] ?? 0));
  });
  return sorted;
}

export function ConcurrenceTab({ account }) {
  const [sortKey, setSortKey] = useState('score');
  const [sortDir, setSortDir] = useState('desc');
  const allPros = useProfessionalsList();

  const peers = useMemo(() => buildCategoryPeers(account, allPros), [account, allPros]);
  const categoryLabel = resolveCategoryName(account.categorie);

  const visibilityRank = useMemo(() => {
    const byScore = sortPeers(peers, 'score', 'desc');
    const index = byScore.findIndex((p) => p.id === account.id);
    return index >= 0 ? index + 1 : byScore.length;
  }, [peers, account.id]);

  const displayed = useMemo(
    () => sortPeers(peers, sortKey, sortDir),
    [peers, sortKey, sortDir],
  );

  const maxScore = useMemo(
    () => Math.max(...displayed.map((p) => p.score), 1),
    [displayed],
  );

  const selfScore = peers.find((p) => p.id === account.id)?.score ?? 0;
  const gapToLeader = Math.max(0, maxScore - selfScore);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortColumns = [
    { key: 'nom', label: 'Professionnel' },
    { key: 'note', label: 'Note' },
    { key: 'nombreAvis', label: 'Avis' },
    { key: 'vues', label: 'Vues' },
    { key: 'score', label: 'Score' },
  ];

  return (
    <div className={styles.tab}>
      <div className={styles.metricsRow}>
        <MetricCard
          icon={TrendingUp}
          value={`#${visibilityRank}`}
          label="Votre position"
          period={`sur ${peers.length} pros`}
          accent="#F5C518"
        />
        <MetricCard
          icon={Star}
          value={selfScore}
          label="Score visibilité"
          period="Indice composite"
          accent="#D4A800"
        />
        <MetricCard
          icon={Users}
          value={peers.length}
          label="Dans la catégorie"
          period={categoryLabel || 'Votre secteur'}
          accent="#5C9EFF"
        />
        <MetricCard
          icon={Target}
          value={gapToLeader}
          label="Écart leader"
          period="Points à gagner"
          accent="#FF9800"
        />
      </div>

      <div className={styles.concurrenceCard}>
        <div className={styles.concurrenceCardHead}>
          <h3>Classement des concurrents</h3>
          <span className={styles.concurrenceSortLabel}>
            Trié par <strong>{CONCURRENCE_SORT_LABELS[sortKey]}</strong>
            {sortDir === 'desc' ? ' ↓' : ' ↑'}
          </span>
        </div>
        <div className={styles.concurrenceTableWrap}>
          <table className={styles.concurrenceTable}>
            <thead>
              <tr>
                <th>#</th>
                {sortColumns.map(({ key, label }) => (
                  <th key={key}>
                    <button
                      type="button"
                      className={`${styles.concurrenceSortBtn} ${sortKey === key ? styles.concurrenceSortActive : ''}`}
                      onClick={() => handleSort(key)}
                    >
                      {label}
                      {sortKey === key && (
                        sortDir === 'desc'
                          ? <ArrowDown size={12} aria-hidden="true" />
                          : <ArrowUp size={12} aria-hidden="true" />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.concurrenceEmpty}>
                    Aucun concurrent dans cette catégorie pour le moment.
                  </td>
                </tr>
              ) : displayed.map((c, index) => {
                const isSelf = c.id === account.id;
                return (
                  <tr
                    key={c.id}
                    className={isSelf ? styles.concurrenceRowSelf : undefined}
                  >
                    <td className={`${styles.concurrenceRank} ${sortKey === 'score' && index < 3 ? styles.concurrenceRankTop : ''}`}>
                      {index + 1}
                    </td>
                    <td>
                      <div className={styles.concurrenceName}>
                        <span
                          className={styles.concurrenceAvatar}
                          style={{ background: getAvatarColor(c.categorie || account.categorie) }}
                        >
                          {getInitials(c.nom)}
                        </span>
                        <span>{c.nom}</span>
                        {isSelf && <span className={styles.concurrenceYou}>Vous</span>}
                      </div>
                    </td>
                    <td>
                      <div className={styles.concurrenceRating}>
                        <Star size={13} className={styles.concurrenceStar} />
                        {c.note}
                      </div>
                    </td>
                    <td className={styles.concurrenceMuted}>{c.nombreAvis}</td>
                    <td className={styles.concurrenceMuted}>{c.vues}</td>
                    <td>
                      <div className={styles.concurrenceScoreCell}>
                        <div className={styles.concurrenceScoreBar}>
                          <div style={{ width: `${maxScore ? (c.score / maxScore) * 100 : 0}%` }} />
                        </div>
                        <span className={styles.concurrenceScoreVal}>{c.score}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className={styles.hint}>
        Le score de visibilité combine note (×15), avis (×3) et vues (×0,05).
        Cliquez sur une colonne pour changer le tri.
      </p>
    </div>
  );
}

export function SuggestionsTab({ account, onTabChange }) {
  const completion = getProfileCompletion(account);
  const suggestions = useMemo(
    () => buildProSuggestions(account, completion),
    [account, completion],
  );

  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <Sparkles size={20} aria-hidden="true" />
        <div>
          <strong>Suggestions IA</strong>
          <p>Actions prioritaires pour booster votre visibilité sur G-List.</p>
        </div>
        <span className={styles.premiumBadge}>{suggestions.length} conseil{suggestions.length !== 1 ? 's' : ''}</span>
      </div>

      {suggestions.length === 0 ? (
        <div className={styles.premiumEmpty}>
          <Check size={28} aria-hidden="true" />
          <p>Excellent — aucune suggestion prioritaire pour le moment.</p>
        </div>
      ) : (
        <div className={styles.suggestionList}>
          {suggestions.map((s) => (
            <article key={s.text} className={`${styles.suggestionCardPremium} ${styles[`suggestion${s.priority}`] || ''}`}>
              <span className={styles.suggestionIcon}><Lightbulb size={18} aria-hidden="true" /></span>
              <div className={styles.suggestionBody}>
                <span className={styles.suggestionPriority}>
                  {s.priority === 'high' ? 'Priorité haute' : s.priority === 'medium' ? 'Recommandé' : 'Optionnel'}
                </span>
                <p>{s.text}</p>
              </div>
              <button type="button" className={styles.premiumActionBtn} onClick={() => onTabChange?.(s.tab)}>
                {s.action}
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      )}

      <div className={styles.repTip}>
        <Lightbulb size={18} aria-hidden="true" />
        <p><strong>Astuce :</strong> appliquez un conseil par semaine pour des résultats mesurables en 30 jours.</p>
      </div>
    </div>
  );
}

export function CrmTab({ account, dateRange }) {
  const [allProspects, setAllProspects] = useState(() => getCrmProspects(account.id));
  const prospects = useMemo(
    () => filterByDateRange(allProspects, dateRange.startDate, dateRange.endDate),
    [allProspects, dateRange.startDate, dateRange.endDate],
  );
  const periodLabel = formatPeriodShort(dateRange.startDate, dateRange.endDate);
  const columns = ['nouveau', 'contacte', 'converti'];
  const labels = { nouveau: 'Nouveau', contacte: 'Contacté', converti: 'Converti' };
  const colColors = { nouveau: '#5C9EFF', contacte: '#F5C518', converti: '#4CAF50' };
  const converted = prospects.filter((p) => p.column === 'converti').length;
  const nouveau = prospects.filter((p) => p.column === 'nouveau').length;
  const contacte = prospects.filter((p) => p.column === 'contacte').length;
  const rate = prospects.length ? Math.round((converted / prospects.length) * 100) : 0;

  const move = (id, col) => {
    moveCrmProspect(account.id, id, col);
    setAllProspects(getCrmProspects(account.id));
  };

  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <Users size={20} aria-hidden="true" />
        <div>
          <strong>CRM prospects</strong>
          <p>Prospects enregistrés sur la période ({periodLabel}).</p>
        </div>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard icon={Users} value={prospects.length} label="Prospects actifs" period="Pipeline" accent="#5C9EFF" />
        <MetricCard icon={Bell} value={nouveau} label="Nouveaux" period="À traiter" accent="#AB47BC" />
        <MetricCard icon={Phone} value={contacte} label="En suivi" period="Contactés" accent="#F5C518" />
        <MetricCard icon={Check} value={converted} label="Conversions" period="Ce mois" accent="#4CAF50" />
        <MetricCard icon={TrendingUp} value={`${rate}%`} label="Taux conversion" period="Global" accent="#D4A800" trend={rate} />
      </div>

      <div className={styles.kanbanPremium}>
        {columns.map((col) => (
          <div key={col} className={styles.kanbanColPremium}>
            <div className={styles.kanbanColHead} style={{ borderColor: colColors[col] }}>
              <h4>{labels[col]}</h4>
              <span>{prospects.filter((p) => p.column === col).length}</span>
            </div>
            <div className={styles.kanbanColBody}>
              {prospects.filter((p) => p.column === col).map((p) => (
                <div key={p.id} className={styles.prospectCardPremium}>
                  <div className={styles.prospectCardTop}>
                    <strong>{p.prenom}</strong>
                    <span className={styles.prospectDate}>{p.date}</span>
                  </div>
                  <span className={styles.prospectService}>{p.service}</span>
                  {p.note && <p className={styles.prospectNote}>{p.note}</p>}
                  <div className={styles.moveBtnsPremium}>
                    {columns.filter((c) => c !== col).map((c) => (
                      <button key={c} type="button" onClick={() => move(p.id, c)}>
                        → {labels[c]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {prospects.filter((p) => p.column === col).length === 0 && (
                <p className={styles.kanbanEmpty}>Aucun prospect</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MinisiteTab({ account }) {
  return (
    <div className={styles.minisiteEditorWrap}>
      <MinisiteEditor account={account} />
    </div>
  );
}

export function ReportsTab({ account, dateRange }) {
  return <ProReportGenerator account={account} dateRange={dateRange} />;
}

export function ReputationTab({ account, dateRange }) {
  const completion = getProfileCompletion(account);
  const { metrics: periodMetrics } = useProAnalytics(account, dateRange);
  const periodLabel = formatPeriodShort(dateRange.startDate, dateRange.endDate);
  const criteria = useMemo(
    () => computeReputationBreakdown(account, completion),
    [account, completion],
  );
  const total = criteria.reduce((s, x) => s + x.pts, 0);
  const categoryAvg = 68;
  const vsCategory = total - categoryAvg;
  const percentile = Math.min(99, Math.max(5, 100 - total + 18));

  return (
    <div className={styles.tab}>
      <div className={styles.repHero}>
        <div className={styles.repHeroMain}>
          <p className={styles.repEyebrow}>Score réputation</p>
          <div className={styles.repHeroRow}>
            <div
              className={styles.repGauge}
              style={{ '--score-pct': total }}
              aria-hidden="true"
            >
              <div className={styles.repGaugeInner}>
                <span className={styles.repGaugeValue}>{total}</span>
                <span className={styles.repGaugeMax}>/ 100</span>
              </div>
            </div>
            <div className={styles.repHeroText}>
              <h3>{account.nom}</h3>
              <p>Indice global de confiance sur G-List</p>
              <span className={`${styles.repDelta} ${vsCategory >= 0 ? styles.repDeltaUp : styles.repDeltaDown}`}>
                {vsCategory >= 0 ? '+' : ''}{vsCategory} pts vs moyenne catégorie
              </span>
            </div>
          </div>
        </div>
        <div className={styles.repHeroAside}>
          <div className={styles.repAsideItem}>
            <span className={styles.repAsideLabel}>Moyenne catégorie</span>
            <strong>{categoryAvg}<small>/100</small></strong>
          </div>
          <div className={styles.repAsideItem}>
            <span className={styles.repAsideLabel}>Percentile</span>
            <strong>Top {percentile}<small>%</small></strong>
          </div>
        </div>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard icon={Shield} value={total} label="Score actuel" period="Indice composite" accent="#F5C518" />
        <MetricCard icon={Award} value={`#${Math.max(1, 11 - Math.floor(total / 10))}`} label="Rang réputation" period="Dans votre catégorie" accent="#D4A800" />
        <MetricCard icon={TrendingUp} value={`+${vsCategory}`} label="Vs moyenne" period="Écart positif" accent="#4CAF50" trend={vsCategory} />
        <MetricCard icon={Eye} value={periodMetrics.views} label="Vues période" period={periodLabel} accent="#5C9EFF" trend={periodMetrics.viewsTrend} />
      </div>

      <div className={styles.repCard}>
        <div className={styles.repCardHead}>
          <h3>Détail par critère</h3>
          <span>4 piliers de votre réputation</span>
        </div>
        <div className={styles.repCriteria}>
          {criteria.map((item) => {
            const icons = { 'Complétude profil': BadgeCheck, 'Qualité avis': Star, 'Activité récente': Clock, 'Engagement visiteurs': Eye };
            const accents = { 'Complétude profil': '#5C9EFF', 'Qualité avis': '#F5C518', 'Activité récente': '#AB47BC', 'Engagement visiteurs': '#4CAF50' };
            const Icon = icons[item.label] || Star;
            const accent = accents[item.label] || '#F5C518';
            const pct = Math.round((item.pts / item.max) * 100);
            return (
              <div key={item.label} className={styles.repCriterion}>
                <div className={styles.repCriterionTop}>
                  <div className={styles.repCriterionLabel}>
                    <span className={styles.repCriterionIcon} style={{ background: `${accent}22`, color: accent }}>
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.pts} / {item.max} pts · {pct}%</span>
                    </div>
                  </div>
                  <span className={styles.repCriterionPts}>{pct}%</span>
                </div>
                <div className={styles.repBarTrack}>
                  <div
                    className={styles.repBarFill}
                    style={{ width: `${pct}%`, background: item.accent }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.repTip}>
        <Lightbulb size={18} aria-hidden="true" />
        <p>
          <strong>Conseil :</strong> complétez votre profil et répondez aux avis pour gagner jusqu&apos;à
          {' '}{25 - criteria[0].pts + 25 - criteria[2].pts} points supplémentaires ce mois-ci.
        </p>
      </div>
    </div>
  );
}

export function RankingTab({ account }) {
  const rank = useMemo(() => getCategoryRank(account), [account]);
  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <Award size={20} aria-hidden="true" />
        <div>
          <strong>Classement par villes</strong>
          <p>Votre position face aux professionnels de {rank.categoryLabel}.</p>
        </div>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard icon={Award} value={`#${rank.categoryRank}`} label="Rang catégorie" period={`sur ${rank.categoryTotal} pros`} accent="#F5C518" />
        <MetricCard icon={MapPin} value={`#${rank.regionRank}`} label="Rang ville" period={`sur ${rank.regionTotal} pros`} accent="#5C9EFF" />
        <MetricCard icon={TrendingUp} value="+2" label="Évolution 30j" period="Positions gagnées" accent="#4CAF50" trend={2} />
        <MetricCard icon={Users} value={rank.categoryTotal} label="Concurrents" period={rank.categoryLabel} accent="#AB47BC" />
      </div>

      <div className={styles.concurrenceCard}>
        <div className={styles.concurrenceCardHead}>
          <h3>Top 5 — {rank.categoryLabel}</h3>
          <span>Classement par note moyenne</span>
        </div>
        <div className={styles.rankTableWrap}>
          <table className={styles.rankTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Professionnel</th>
                <th>Note</th>
                <th>Avis</th>
              </tr>
            </thead>
            <tbody>
              {rank.top5.map((p, i) => (
                <tr key={p.id} className={p.id === account.id ? styles.rankRowSelf : ''}>
                  <td>
                    <span className={`${styles.rankMedal} ${i < 3 ? styles[`rankMedal${i + 1}`] : ''}`}>{i + 1}</span>
                  </td>
                  <td>
                    <strong>{p.nom}</strong>
                    {p.id === account.id && <span className={styles.rankYouBadge}>Vous</span>}
                  </td>
                  <td><Star size={14} className={styles.rankStar} aria-hidden="true" /> {p.note}</td>
                  <td className={styles.concurrenceMuted}>{p.nombreAvis || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.repTip}>
        <Target size={18} aria-hidden="true" />
        <p><strong>Objectif :</strong> atteindre le top 3 pour maximiser votre visibilité dans {rank.categoryLabel}.</p>
      </div>
    </div>
  );
}

export function AlertsTab({ account, plan, dateRange }) {
  const [settings, setSettings] = useState(() => getProAlertSettings(account.id));
  const [adminMessages, setAdminMessages] = useState(() => getActiveBroadcastsForUser());
  const planLevel = plan || getProPlanLevel(account);
  const planOrder = { free: 0, advanced: 1, premium: 2 };

  const availableEvents = ALERT_EVENT_TYPES.filter(
    (event) => planOrder[planLevel] >= planOrder[event.minPlan],
  );

  const alerts = useMemo(() => {
    const all = buildProAlerts(account).filter((alert) => settings[alert.eventId] !== false);
    return filterByDateRange(all, dateRange.startDate, dateRange.endDate);
  }, [account, dateRange.startDate, dateRange.endDate, settings]);

  const highCount = alerts.filter((a) => a.level === 'high').length;
  const enabledCount = availableEvents.filter((e) => settings[e.id] !== false).length;

  const handleToggle = (eventId, enabled) => {
    toggleProAlert(account.id, eventId, enabled);
    setSettings(getProAlertSettings(account.id));
  };

  const handleDismissAdmin = (id) => {
    dismissBroadcast(id);
    setAdminMessages(getActiveBroadcastsForUser());
  };

  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <Bell size={20} aria-hidden="true" />
        <div>
          <strong>Centre d&apos;alertes</strong>
          <p>Activez les notifications pour les événements qui comptent pour votre activité.</p>
        </div>
        {highCount > 0 && <span className={styles.premiumBadgeAlert}>{highCount} urgent{highCount > 1 ? 'es' : 'e'}</span>}
      </div>

      {adminMessages.length > 0 && (
        <PremiumPanel title="Messages G-List" subtitle="Annonces de l'administration">
          <div className={styles.alertListPremium}>
            {adminMessages.map((b) => (
              <article key={b.id} className={`${styles.alertCardPremium} ${styles[`alert${b.type === 'warning' || b.type === 'maintenance' ? 'high' : 'medium'}`]}`}>
                <span className={styles.alertIconWrap}>
                  <Bell size={18} aria-hidden="true" />
                </span>
                <div className={styles.alertBody}>
                  <span className={styles.alertLevel}>Message officiel</span>
                  <strong>{b.title}</strong>
                  <p>{b.message}</p>
                  <time>{new Date(b.createdAt).toLocaleString('fr-FR')}</time>
                </div>
                {b.dismissible !== false && (
                  <button type="button" className={styles.adminMsgDismiss} onClick={() => handleDismissAdmin(b.id)} aria-label="Masquer">
                    <Trash2 size={14} />
                  </button>
                )}
              </article>
            ))}
          </div>
        </PremiumPanel>
      )}

      <PremiumPanel title="Événements surveillés" subtitle={`${enabledCount} alerte${enabledCount > 1 ? 's' : ''} activée${enabledCount > 1 ? 's' : ''}`}>
        <div className={styles.alertConfigGrid}>
          {availableEvents.map((event) => {
            const enabled = settings[event.id] !== false;
            return (
              <label key={event.id} className={`${styles.alertConfigCard} ${enabled ? styles.alertConfigCardOn : ''}`}>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => handleToggle(event.id, e.target.checked)}
                />
                <div>
                  <strong>{event.label}</strong>
                  <span>{event.description}</span>
                  {event.minPlan === 'premium' && (
                    <em className={styles.alertConfigBadge}>Premium</em>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </PremiumPanel>

      <PremiumPanel title="Alertes déclenchées" subtitle="Sur la période sélectionnée">
        {alerts.length === 0 ? (
          <div className={styles.premiumEmpty}>
            <Check size={28} aria-hidden="true" />
            <p>Aucune alerte active pour cette période — tout est sous contrôle.</p>
          </div>
        ) : (
          <div className={styles.alertListPremium}>
            {alerts.map((a) => (
              <article key={`${a.eventId}-${a.text}`} className={`${styles.alertCardPremium} ${styles[`alert${a.level}`]}`}>
                <span className={styles.alertIconWrap}>
                  <AlertTriangle size={18} aria-hidden="true" />
                </span>
                <div className={styles.alertBody}>
                  <span className={styles.alertLevel}>
                    {a.level === 'high' ? 'Priorité haute' : 'À surveiller'}
                  </span>
                  <p>{a.text}</p>
                  <time>{a.date}</time>
                </div>
              </article>
            ))}
          </div>
        )}
      </PremiumPanel>
    </div>
  );
}

export function getProfileCompletion(account) {
  const checks = [
    !!account.nom,
    !!account.profession,
    !!account.region,
    !!account.telephone,
    (account.description?.length || 0) > 20,
    !!account.slogan,
    (account.specialites?.length || 0) > 0,
    (account.services?.length || 0) > 0,
    !!account.email,
    Object.values(account.social || {}).some((v) => v),
    getProPhotos(account.id).length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function getCompletionTip(account) {
  if (!account.description || account.description.length < 20) return 'Ajoutez une description détaillée pour atteindre 100 %.';
  if (!(account.services?.length)) return 'Listez vos services pour compléter votre profil.';
  if (!getProPhotos(account.id).length) return 'Ajoutez des photos pour renforcer votre visibilité.';
  if (!account.slogan) return 'Ajoutez un slogan accrocheur.';
  return 'Votre profil est presque complet — continuez ainsi !';
}

function getProfileChecklist(account, reviewCount = 0) {
  return [
    { id: 'photos', label: 'Ajouter des photos', done: getProPhotos(account.id).length > 0, tab: 'photos', icon: Camera },
    { id: 'description', label: 'Rédiger une description', done: (account.description?.length || 0) > 20, tab: 'profile', icon: Pencil },
    { id: 'services', label: 'Lister vos services', done: (account.services?.length || 0) > 0, tab: 'services', icon: Briefcase },
    { id: 'social', label: 'Lier vos réseaux sociaux', done: Object.values(account.social || {}).some(Boolean), tab: 'profile', icon: Share2 },
    { id: 'reviews', label: 'Obtenir un premier avis', done: reviewCount > 0, tab: 'reviews', icon: Star },
  ];
}

function ReviewsEmptyPanel({ account, onTabChange, reviewCount = 0 }) {
  const [shareMsg, setShareMsg] = useState('');
  const checklist = getProfileChecklist(account, reviewCount);
  const pending = checklist.filter((item) => !item.done);

  const handleShare = async () => {
    const url = `${window.location.origin}/profil/${account.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: account.nom, text: `Découvrez ${account.profession} sur G-List`, url });
        return;
      } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg('Lien copié !');
      setTimeout(() => setShareMsg(''), 2000);
    } catch {
      setShareMsg(url);
    }
  };

  return (
    <div className={styles.reviewsEmptyState}>
      <div className={styles.reviewsEmptyHero}>
        <div className={styles.reviewsEmptyIcon}>
          <Star size={28} aria-hidden="true" />
        </div>
        <div>
          <h4>Aucun avis sur cette période</h4>
          <p>Les avis clients renforcent la confiance et améliorent votre classement dans l&apos;annuaire.</p>
        </div>
      </div>

      <div className={styles.reviewsEmptyTips}>
        {[
          { icon: Share2, title: 'Partagez votre fiche', text: 'Envoyez le lien à vos clients après chaque prestation.' },
          { icon: MessageSquare, title: 'Demandez un retour', text: 'Un message WhatsApp suffit pour obtenir un avis.' },
          { icon: TrendingUp, title: 'Gagnez en visibilité', text: 'Plus vous avez d\'avis, plus votre profil remonte.' },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title} className={styles.reviewsEmptyTip}>
            <Icon size={18} aria-hidden="true" />
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.reviewsEmptyActions}>
        <button type="button" className={styles.reviewsEmptyCtaPrimary} onClick={handleShare}>
          <Share2 size={16} aria-hidden="true" />
          {shareMsg || 'Partager mon profil'}
        </button>
        <button type="button" className={styles.reviewsEmptyCtaSecondary} onClick={() => onTabChange?.('reviews')}>
          Voir la rubrique avis
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>

      {pending.length > 0 && (
        <div className={styles.reviewsEmptyChecklist}>
          <h5>Prochaines étapes pour booster votre profil</h5>
          <ul>
            {pending.slice(0, 4).map(({ id, label, tab, icon: Icon }) => (
              <li key={id}>
                <button type="button" onClick={() => onTabChange?.(tab)}>
                  <span className={styles.checklistIcon}><Icon size={14} aria-hidden="true" /></span>
                  {label}
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ProfileDashboardHeader({ account, reviews, avgRating, onEditProfile, onToggleAvailable }) {
  const minisite = getMinisite(account.id, account);
  const heroSection = minisite.sections?.find((s) => s.type === 'hero');
  const coverImage = heroSection?.coverImage || minisite.coverPhoto;
  const [shareMsg, setShareMsg] = useState('');
  const coverStyle = coverImage
    ? { backgroundImage: `url(${coverImage})` }
    : { background: `linear-gradient(135deg, ${getAvatarColor(account.categorie || account.profession)} 0%, #1A1A1A 100%)` };

  const handleShare = async () => {
    const url = `${window.location.origin}/profil/${account.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: account.nom, text: account.profession, url });
        return;
      } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg('Lien copié !');
      setTimeout(() => setShareMsg(''), 2000);
    } catch {
      setShareMsg(url);
    }
  };

  return (
    <section className={styles.profileHeader}>
      <div className={styles.coverBanner} style={coverStyle}>
        <button type="button" className={styles.coverEditBtn} onClick={() => onEditProfile?.('minisite')}>
          <Camera size={14} /> Modifier la couverture
        </button>
      </div>
      <div className={styles.profileHeaderBody}>
        <div className={styles.profileHeaderMain}>
          <div className={styles.profileAvatarWrap}>
            <div className={styles.profileAvatar} style={{ background: getAvatarColor(account.categorie || account.profession) }}>
              {getInitials(account.nom)}
            </div>
          </div>
          <div className={styles.profileIdentity}>
            <div className={styles.profileNameRow}>
              <h2>{account.nom}</h2>
              {account.verifie && (
                <span className={styles.verifiedBadge}>
                  <BadgeCheck size={13} /> Vérifié
                </span>
              )}
            </div>
            <p className={styles.profileTitle}>{account.profession}</p>
            {account.slogan && <p className={styles.profileSlogan}>{account.slogan}</p>}
            <div className={styles.profileMeta}>
              <span><MapPin size={14} /> {account.quartier ? `${account.quartier}, ` : ''}{account.region}</span>
              {account.horaires && <span><Clock size={14} /> {account.horaires}</span>}
              <span><Eye size={14} /> {account.profileViews || 0} vues</span>
            </div>
            <label className={styles.availabilityToggle}>
              <input
                type="checkbox"
                checked={account.disponible !== false}
                onChange={(e) => onToggleAvailable?.(e.target.checked)}
              />
              <span className={styles.toggleTrack} />
              Disponible pour de nouveaux clients
            </label>
          </div>
        </div>
        <div className={styles.profileHeaderAside}>
          <div className={styles.profileRating}>
            <StarDisplay rating={avgRating || 0} size={16} />
            <strong>{avgRating ? avgRating.toFixed(1) : '—'}</strong>
            <span>{reviews.length} avis</span>
          </div>
          <div className={styles.profileActions}>
            <button type="button" className={styles.shareBtn} onClick={handleShare}>
              <Share2 size={15} /> {shareMsg || 'Partager'}
            </button>
            <button type="button" className={styles.editProfileBtn} onClick={() => onEditProfile?.('profile')}>
              <Pencil size={15} /> Modifier le profil
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OverviewFreeTab({
  account, reviews, avgRating, plan, onSubscribe, onTabChange, onAccountUpdate, dateRange,
}) {
  const { startDate, endDate } = dateRange;
  const { metrics: periodMetrics, chartData } = useProAnalytics(account, dateRange);
  const periodLabel = formatPeriodShort(startDate, endDate);
  const periodReviews = useMemo(
    () => filterByDateRange(reviews, startDate, endDate),
    [reviews, startDate, endDate],
  );
  const periodAvg = periodReviews.length
    ? (periodReviews.reduce((s, r) => s + r.note, 0) / periodReviews.length).toFixed(1)
    : '—';
  const completion = getProfileCompletion(account);
  const recentReviews = periodReviews.slice(0, 3);

  const handleToggleAvailable = (disponible) => {
    const updated = { ...account, disponible };
    saveProAccount(updated);
    onAccountUpdate?.(updated);
  };

  return (
    <div className={styles.overviewLayout}>
      <ProfileDashboardHeader
        account={account}
        reviews={reviews}
        avgRating={avgRating}
        onEditProfile={onTabChange}
        onToggleAvailable={handleToggleAvailable}
      />

      <div className={styles.metricsRow}>
        <MetricCard icon={Eye} value={periodMetrics.views} label="Vues profil" period={periodLabel} trend={periodMetrics.viewsTrend} />
        <MetricCard icon={MessageSquare} value={periodMetrics.whatsapp} label="Contacts reçus" period={periodLabel} trend={periodMetrics.whatsappTrend} />
        <MetricCard icon={Star} value={periodAvg} label="Note moyenne" period={`${periodReviews.length} avis`} trend={Number(periodAvg) >= 4 ? 5 : -2} />
        <MetricCard icon={Heart} value={periodMetrics.favorites} label="Favoris" period={periodLabel} trend={periodMetrics.favoritesTrend} />
      </div>

      <div className={styles.overviewGrid}>
        <section className={styles.reviewsSection}>
          <div className={styles.sectionHead}>
            <div>
              <h3>Derniers avis clients</h3>
              {periodReviews.length > 0 && (
                <span className={styles.newBadge}>{periodReviews.length} sur la période</span>
              )}
            </div>
            <button type="button" className={styles.seeAllBtn} onClick={() => onTabChange?.('reviews')}>
              Voir tous
            </button>
          </div>
          {recentReviews.length === 0 ? (
            <ReviewsEmptyPanel account={account} onTabChange={onTabChange} reviewCount={reviews.length} />
          ) : (
            recentReviews.map((r) => (
              <div key={r.id} className={styles.reviewSnippet}>
                <div className={styles.reviewSnippetHead}>
                  <div className={styles.reviewAuthor}>
                    <div className={styles.reviewAvatar}>{r.prenom?.[0] || '?'}</div>
                    <div>
                      <strong>{r.prenom}</strong>
                      <span className={styles.reviewDate}>{r.date}</span>
                    </div>
                  </div>
                  <StarDisplay rating={r.note} size={12} />
                </div>
                <p>{r.commentaire}</p>
              </div>
            ))
          )}
        </section>

        <aside className={styles.detailsColumn}>
          <div className={styles.detailCard}>
            <h4>Complétion du profil</h4>
            <div className={styles.completionValue}>{completion}%</div>
            <div className={styles.completionBar}>
              <div style={{ width: `${completion}%` }} />
            </div>
            <p className={styles.completionTip}>{getCompletionTip(account)}</p>
          </div>

          {account.description && (
            <div className={styles.detailCard}>
              <h4>Présentation</h4>
              <p className={styles.presentationText}>{account.description}</p>
            </div>
          )}

          {(account.services?.length > 0 || account.specialites?.length > 0) && (
            <div className={styles.detailCard}>
              <h4>Services</h4>
              <div className={styles.serviceTags}>
                {[...(account.services || []), ...(account.specialites || [])].slice(0, 8).map((s) => (
                  <span key={s} className={styles.serviceTag}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.detailCard}>
            <h4>Coordonnées</h4>
            <ul className={styles.contactList}>
              <li><Building2 size={15} /> {account.nom}</li>
              <li><MapPin size={15} /> {account.quartier ? `${account.quartier}, ` : ''}{account.region}</li>
              <li><Phone size={15} /> {account.telephone}</li>
              {account.social?.website && <li><Globe size={15} /> {account.social.website}</li>}
            </ul>
            {NETWORKS.some(({ key }) => account.social?.[key]) && (
              <div className={styles.socialRow}>
                {NETWORKS.filter(({ key }) => account.social?.[key]).map(({ key, label }) => (
                  <a key={key} href={account.social[key]} target="_blank" rel="noopener noreferrer" title={label}>
                    {label.slice(0, 2)}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className={styles.quickActions}>
            <h4>Actions rapides</h4>
            <button type="button" onClick={() => onTabChange?.('reviews')}>Demander un avis</button>
            <button type="button" onClick={() => onTabChange?.('photos')}>Ajouter des photos</button>
            <button type="button" onClick={() => onTabChange?.('services')}>Gérer les services</button>
          </div>
        </aside>
      </div>

      <section className={styles.activitySection}>
        <h3>Activité — {periodLabel}</h3>
        <BarChart data={chartData} />
      </section>

      {plan === 'free' && (
        <div className={styles.upgradeBanner}>
          <Crown size={20} />
          <div><strong>Passez en Advanced</strong><p>Analytics, réponses avis, concurrence et plus.</p></div>
          <button type="button" onClick={() => onSubscribe?.('advanced')}>S&apos;abonner</button>
        </div>
      )}
    </div>
  );
}

export function ProfileTabExtended({ account, form, handleSave, handleChange, handleSocialChange }) {
  const completion = getProfileCompletion({ ...account, ...form, specialites: form.specialitesStr?.split(',').map((s) => s.trim()).filter(Boolean) });

  return (
    <form onSubmit={handleSave} className={styles.tab}>
      <div className={styles.premiumIntro}>
        <Pencil size={20} aria-hidden="true" />
        <div>
          <strong>Édition du profil</strong>
          <p>Informations affichées sur votre fiche publique G-List.</p>
        </div>
        <span className={styles.premiumBadge}>{completion}% complété</span>
      </div>

      <div className={styles.profileGridPremium}>
        <div className={styles.profileFormPremium}>
          <PremiumPanel title="Identité" subtitle="Nom et coordonnées visibles">
            <div className={styles.formGrid2}>
              {['nom', 'telephone', 'quartier'].map((f) => (
                <label key={f} className={styles.premiumField}>
                  <span>{FIELD_LABELS[f] || f}</span>
                  <input name={f} value={form[f] || ''} onChange={handleChange} className={styles.premiumInput} />
                </label>
              ))}
            </div>
          </PremiumPanel>

          <PremiumPanel title="Présentation" subtitle="Décrivez votre activité et votre valeur">
            <label className={styles.premiumField}>
              <span>Slogan</span>
              <input name="slogan" value={form.slogan || ''} onChange={handleChange} className={styles.premiumInput} placeholder="Votre accroche en une phrase" />
            </label>
            <label className={styles.premiumField}>
              <span>Description</span>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={styles.premiumTextarea} placeholder="Présentez votre expertise, votre expérience et ce qui vous distingue…" />
            </label>
            <label className={styles.premiumField}>
              <span>Spécialités</span>
              <input name="specialitesStr" value={form.specialitesStr} onChange={handleChange} className={styles.premiumInput} placeholder="Ex : plomberie, dépannage, installation — séparées par virgules" />
            </label>
            <label className={styles.premiumField}>
              <span>Horaires</span>
              <input name="horaires" value={form.horaires} onChange={handleChange} className={styles.premiumInput} placeholder="Ex : Lun–Sam 8h–18h" />
            </label>
          </PremiumPanel>

          <PremiumPanel title="Réseaux sociaux" subtitle="Liens vers vos pages professionnelles">
            <div className={styles.socialGrid}>
              {NETWORKS.map(({ key, label }) => (
                <label key={key} className={styles.premiumField}>
                  <span>{label}</span>
                  <input
                    value={form.social?.[key] || ''}
                    onChange={(e) => handleSocialChange(key, e.target.value)}
                    className={styles.premiumInput}
                    placeholder={`https://${label.toLowerCase()}.com/…`}
                  />
                </label>
              ))}
            </div>
          </PremiumPanel>

          <div className={styles.premiumFoot}>
            <button type="submit" className={styles.premiumSaveBtn}>Enregistrer les modifications</button>
          </div>
        </div>

        <aside className={styles.previewColPremium}>
          <PremiumPanel title="Aperçu live" subtitle="Aperçu du rendu public — carte annuaire">
            <ProCardPreview account={{ ...account, ...form, specialites: form.specialitesStr?.split(',').map((s) => s.trim()).filter(Boolean) }} />
          </PremiumPanel>
          <div className={styles.completionCardPremium}>
            <h4>Complétion du profil</h4>
            <div className={styles.completionValue}>{completion}%</div>
            <div className={styles.completionBar}>
              <div style={{ width: `${completion}%` }} />
            </div>
            <p>{getCompletionTip({ ...account, ...form })}</p>
          </div>
        </aside>
      </div>
    </form>
  );
}

export function SettingsTab({ account, onLogout, onDeleteAccount, onSubscribe }) {
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const openDeleteWarning = () => {
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Saisissez votre mot de passe pour continuer.');
      return;
    }
    setShowDeleteWarning(true);
  };

  const closeDeleteWarning = () => {
    if (deleting) return;
    setShowDeleteWarning(false);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    setDeleteError('');
    setDeleting(true);
    const result = await onDeleteAccount?.(deletePassword);
    setDeleting(false);

    if (result?.ok === false) {
      setDeleteError(result.error === 'PASSWORD_INVALID' ? 'Mot de passe incorrect.' : 'Impossible de supprimer le compte.');
      return;
    }

    setShowDeleteWarning(false);
  };

  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <Shield size={20} aria-hidden="true" />
        <div>
          <strong>Paramètres du compte</strong>
          <p>Gérez vos informations et votre session.</p>
        </div>
      </div>

      <AbonnementStatus
        account={account}
        onRenew={(planId) => onSubscribe?.(planId)}
        onUpgrade={(planId) => onSubscribe?.(planId)}
      />

      <PremiumPanel title="Apparence" subtitle="Thème de l'interface">
        <ThemeToggle variant="ligne" />
      </PremiumPanel>

      <PremiumPanel title="Informations du compte" subtitle="Données liées à votre espace pro">
        <div className={styles.settingsGrid}>
          <div className={styles.settingsItem}>
            <span>Entreprise</span>
            <strong>{account.nom}</strong>
          </div>
          <div className={styles.settingsItem}>
            <span>Email</span>
            <strong>{account.email}</strong>
          </div>
          <div className={styles.settingsItem}>
            <span>Profession</span>
            <strong>{account.profession}</strong>
          </div>
          <div className={styles.settingsItem}>
            <span>Villes</span>
            <strong>{account.region || '—'}</strong>
          </div>
        </div>
      </PremiumPanel>

      <PremiumPanel title="Session" subtitle="Sécurité de votre connexion">
        <p className={styles.settingsHintPremium}>
          Déconnectez-vous pour quitter votre espace pro sur cet appareil. Vos données restent sauvegardées.
        </p>
        <button type="button" className={styles.logoutPremiumBtn} onClick={onLogout}>
          Se déconnecter
        </button>
      </PremiumPanel>

      <PremiumPanel title="Sessions récentes" subtitle="Sécurité du compte">
        <div className={styles.sessionsList}>
          {getSecuritySessions('pro', account.id).map((s) => (
            <div key={s.id} className={`${styles.sessionItem} ${s.current ? styles.sessionCurrent : ''}`}>
              <Shield size={14} />
              <div>
                <strong>{s.current ? 'Session actuelle' : 'Session précédente'}</strong>
                <span>{s.userAgent?.slice(0, 60)}…</span>
                <time>{new Date(s.timestamp).toLocaleString('fr-FR')}</time>
              </div>
            </div>
          ))}
          {getSecuritySessions('pro', account.id).length === 0 && (
            <p className={styles.settingsHintPremium}>Les sessions seront enregistrées à votre prochaine connexion.</p>
          )}
        </div>
      </PremiumPanel>

      <PremiumPanel title="Export RGPD" subtitle="Téléchargez vos données personnelles">
        <p className={styles.settingsHintPremium}>
          Conformément au RGPD, exportez l&apos;ensemble de vos données G-List au format JSON.
        </p>
        <button
          type="button"
          className={styles.exportGdprBtn}
          onClick={() => {
            const data = exportProGdprData(account.id, account);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `glist-export-${account.id}.json`;
            a.click();
          }}
        >
          <Download size={16} /> Exporter mes données
        </button>
      </PremiumPanel>

      <PremiumPanel title="Zone de danger" subtitle="Suppression définitive du compte">
        <p className={styles.settingsHintPremium}>
          La suppression efface votre profil, vos avis, votre mini-site et toutes les données associées. Cette action ne peut pas être annulée.
        </p>
        <label className={styles.deleteField}>
          <span>Confirmer avec votre mot de passe</span>
          <PasswordInput
            inLabel
            value={deletePassword}
            onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
            className={styles.deleteInput}
            placeholder="Votre mot de passe"
            autoComplete="current-password"
          />
        </label>
        {deleteError && !showDeleteWarning && <p className={styles.deleteError}>{deleteError}</p>}
        <button
          type="button"
          className={styles.deleteAccountBtn}
          onClick={openDeleteWarning}
          disabled={deleting}
        >
          <Trash2 size={16} aria-hidden="true" />
          Supprimer mon compte
        </button>
      </PremiumPanel>

      {showDeleteWarning && (
        <div className={styles.deleteModalOverlay} onClick={closeDeleteWarning} role="presentation">
          <div
            className={styles.deleteModal}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-desc"
          >
            <div className={styles.deleteModalIconWrap} aria-hidden="true">
              <AlertTriangle size={40} />
            </div>
            <h3 id="delete-modal-title">Supprimer définitivement votre compte ?</h3>
            <p id="delete-modal-desc" className={styles.deleteModalLead}>
              Vous êtes sur le point de supprimer le compte <strong>{account.nom}</strong>.
              Cette action est <strong>irréversible</strong> et vos données seront <strong>définitivement effacées</strong>.
            </p>
            <ul className={styles.deleteModalList}>
              <li>Votre profil public et votre fiche annuaire</li>
              <li>Vos avis, statistiques et historique d&apos;activité</li>
              <li>Votre mini-site portfolio et son lien personnalisé</li>
              <li>Vos prospects CRM, services et photos</li>
            </ul>
            <p className={styles.deleteModalWarn}>
              Aucune récupération ne sera possible après confirmation. Assurez-vous d&apos;avoir sauvegardé ce dont vous avez besoin.
            </p>
            {deleteError && <p className={styles.deleteModalError}>{deleteError}</p>}
            <div className={styles.deleteModalActions}>
              <button type="button" className={styles.deleteModalCancel} onClick={closeDeleteWarning} disabled={deleting}>
                Annuler
              </button>
              <button type="button" className={styles.deleteModalConfirm} onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? 'Suppression…' : 'Oui, supprimer mon compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export function HistoryTab({ account, dateRange }) {
  const activities = useMemo(
    () => getActivityHistory('pro', account.id, dateRange),
    [account.id, dateRange.startDate, dateRange.endDate],
  );

  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <History size={20} aria-hidden="true" />
        <div>
          <strong>Historique d&apos;activité</strong>
          <p>Journal complet de vos actions sur G-List.</p>
        </div>
        <span className={styles.premiumBadge}>{activities.length} événement{activities.length > 1 ? 's' : ''}</span>
      </div>

      <PremiumPanel title="Timeline" subtitle="Connexions, modifications, abonnements…">
        {activities.length === 0 ? (
          <div className={styles.premiumEmpty}>
            <History size={28} aria-hidden="true" />
            <p>Aucune activité enregistrée sur cette période.</p>
          </div>
        ) : (
          <div className={styles.activityTimeline}>
            {activities.map((a) => (
              <article key={a.id} className={styles.activityItem}>
                <span className={styles.activityDot} />
                <div>
                  <strong>{a.label}</strong>
                  {a.meta?.plan && <span className={styles.activityMeta}> — {a.meta.plan}</span>}
                  <time>{new Date(a.timestamp).toLocaleString('fr-FR')}</time>
                </div>
              </article>
            ))}
          </div>
        )}
      </PremiumPanel>
    </div>
  );
}

export function BillingTab({ account, plan }) {
  const history = useMemo(() => getBillingHistory(account.id), [account.id]);

  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <CreditCard size={20} aria-hidden="true" />
        <div>
          <strong>Facturation & abonnements</strong>
          <p>Historique des paiements et offre actuelle.</p>
        </div>
        <span className={styles.premiumBadge}>{plan || 'free'}</span>
      </div>

      <PremiumPanel title="Offre actuelle" subtitle="Votre abonnement G-List">
        <div className={styles.settingsGrid}>
          <div className={styles.settingsItem}><span>Plan</span><strong>{plan || 'free'}</strong></div>
          <div className={styles.settingsItem}><span>Cycle</span><strong>{account.billingCycle ? formatBillingCycleLabel(account.billingCycle) : '—'}</strong></div>
          <div className={styles.settingsItem}><span>Expire le</span><strong>{account.premiumExpires ? new Date(account.premiumExpires).toLocaleDateString('fr-FR') : '—'}</strong></div>
        </div>
      </PremiumPanel>

      <PremiumPanel title="Historique des paiements" subtitle={`${history.length} transaction${history.length > 1 ? 's' : ''}`}>
        {history.length === 0 ? (
          <div className={styles.premiumEmpty}>
            <CreditCard size={28} aria-hidden="true" />
            <p>Aucun paiement enregistré. Les transactions apparaîtront après un upgrade.</p>
          </div>
        ) : (
          <div className={styles.billingTable}>
            {history.map((b) => (
              <div key={b.id} className={styles.billingRow}>
                <div>
                  <strong>{b.plan}</strong>
                  <span>{new Date(b.date).toLocaleDateString('fr-FR')} · {formatBillingCycleLabel(b.billingCycle)}</span>
                </div>
                <div className={styles.billingAmount}>
                  <span>{formatGNF(b.amount)} GNF</span>
                  <em>{getBillingStatusLabel(b.status)}</em>
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumPanel>
    </div>
  );
}

export function NotificationsTab({ onUpdate }) {
  return (
    <div className={styles.tab}>
      <div className={styles.premiumIntro}>
        <Bell size={20} aria-hidden="true" />
        <div>
          <strong>Notifications</strong>
          <p>Messages officiels G-List et alertes système.</p>
        </div>
      </div>
      <NotificationInbox onUpdate={onUpdate} />
    </div>
  );
}
