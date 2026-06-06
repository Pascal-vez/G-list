import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, MapPin, Phone, Search, Crown, BadgeCheck,
  Save, Smartphone, AlertCircle, CheckCircle, Star,
  Eye, MessageSquare, BarChart3, ExternalLink, Lock, LogOut, KeyRound, Settings,
} from 'lucide-react';
import { REGIONS } from '../data/constants';
import ProfessionSelect, { resolveProfessionValue, professionToFormFields } from '../components/ProfessionSelect';
import {
  getProAccount, saveProAccount, createProAccount, loginProAccount,
  recoverProPassword, logoutProAccount,
  subscribePremium, unsubscribePremium, isPremiumActive, PREMIUM_PRICE_GNF,
  getProReviews, getProAverageRating,
} from '../utils/storage';
import { getInitials, getAvatarColor } from '../utils/helpers';
import { StarDisplay } from '../components/StarRating';
import { NETWORKS } from '../components/SocialLinks';
import styles from './ProDashboard.module.css';

function formatGNF(n) {
  return new Intl.NumberFormat('fr-GN').format(n);
}

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
  { id: 'profile', label: 'Mon profil', icon: Briefcase },
  { id: 'reviews', label: 'Avis', icon: MessageSquare },
  { id: 'premium', label: 'Premium', icon: Crown },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

const EMPTY_FORM = {
  nom: '', categorie: '', profession: '', customProfession: '', region: '', quartier: '', telephone: '', whatsapp: '',
  email: '', password: '', description: '', slogan: '', horaires: 'Lun-Sam 8h-18h',
  specialitesStr: '', servicesStr: '',
  social: { facebook: '', instagram: '', tiktok: '', linkedin: '', portfolio: '', website: '' },
};

function accountToForm(acc) {
  if (!acc) return EMPTY_FORM;
  const profFields = professionToFormFields(acc);
  return {
    ...acc,
    ...profFields,
    password: '',
    specialitesStr: (acc.specialites || []).join(', '),
    servicesStr: (acc.services || []).join(', '),
    social: { ...EMPTY_FORM.social, ...acc.social },
  };
}

export default function ProDashboard() {
  const [account, setAccount] = useState(() => getProAccount());
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState(() => accountToForm(getProAccount()));
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [recoveredPassword, setRecoveredPassword] = useState(null);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('overview');
  const [saved, setSaved] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [premiumSuccess, setPremiumSuccess] = useState(false);
  const [premiumCancelled, setPremiumCancelled] = useState(false);

  const isLoggedIn = !!account;

  const premiumActive = account && isPremiumActive(account);
  const reviews = account ? getProReviews(account.id) : [];
  const avgRating = account ? getProAverageRating(account.id) : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (key, value) => {
    setForm((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  };

  const buildAccount = () => ({
    ...account,
    nom: form.nom,
    profession: resolveProfessionValue(form.categorie, form.profession, form.customProfession) || form.profession,
    categorie: form.categorie,
    region: form.region,
    quartier: form.quartier,
    telephone: form.telephone,
    whatsapp: form.whatsapp || form.telephone,
    email: form.email,
    description: form.description,
    slogan: form.slogan,
    horaires: form.horaires,
    specialites: form.specialitesStr.split(',').map((s) => s.trim()).filter(Boolean),
    services: form.servicesStr.split(',').map((s) => s.trim()).filter(Boolean),
    social: form.social,
  });

  const handleCreate = (e) => {
    e.preventDefault();
    setAuthError('');
    const profession = resolveProfessionValue(form.categorie, form.profession, form.customProfession);
    if (!profession) {
      setAuthError('Veuillez sélectionner ou préciser votre profession.');
      return;
    }
    try {
      const created = createProAccount({ ...form, profession });
      setAccount(created);
      setForm(accountToForm(created));
      setAuthMode('login');
      flash();
    } catch (err) {
      if (err.message === 'EMAIL_EXISTS') {
        setAuthError('Un compte existe déjà avec cet email. Connectez-vous.');
        setAuthMode('login');
        setLoginForm((prev) => ({ ...prev, email: form.email }));
      } else {
        setAuthError('Email et mot de passe sont obligatoires pour créer un compte.');
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    setRecoveredPassword(null);
    const session = loginProAccount(loginForm.email, loginForm.password);
    if (!session) {
      setAuthError('Email ou mot de passe incorrect.');
      return;
    }
    setAccount(session);
    setForm(accountToForm(session));
    setLoginForm({ email: '', password: '' });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setAuthError('');
    const password = recoverProPassword(forgotEmail);
    if (!password) {
      setAuthError('Aucun compte trouvé avec cet email.');
      setRecoveredPassword(null);
      return;
    }
    setRecoveredPassword(password);
  };

  const handleLogout = () => {
    logoutProAccount();
    setAccount(null);
    setForm(EMPTY_FORM);
    setAuthMode('login');
    setTab('overview');
    setRecoveredPassword(null);
    setAuthError('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = buildAccount();
    saveProAccount(updated);
    setAccount(updated);
    flash();
  };

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSubscribe = () => {
    const updated = subscribePremium();
    if (updated) {
      setAccount(updated);
      setPremiumSuccess(true);
      setShowPremiumModal(false);
      setTimeout(() => setPremiumSuccess(false), 5000);
    }
  };

  const handleUnsubscribe = () => {
    const updated = unsubscribePremium();
    if (updated) {
      setAccount(updated);
      setPremiumCancelled(true);
      setShowUnsubscribeModal(false);
      setTimeout(() => setPremiumCancelled(false), 5000);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authVisual} aria-hidden="true">
          <div className={styles.authVisualImg} />
          <div className={styles.authVisualOverlay} />
          <p className={styles.authVisualCaption}>
            Votre métier mérite d&apos;être visible
            <span>Rejoignez l&apos;annuaire pro de Guinée</span>
          </p>
        </div>

        <div className={styles.authPanel}>
          <div className={styles.container}>
            <h1 className={styles.pageTitle}>Espace professionnel</h1>
            <p className={styles.pageSub}>
              Connectez-vous ou créez votre compte pour gérer votre profil G-List.
            </p>

          <div className={styles.authTabs}>
            {[
              { id: 'login', label: 'Connexion' },
              { id: 'register', label: 'Créer un compte' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`${styles.authTab} ${authMode === id ? styles.authTabActive : ''}`}
                onClick={() => { setAuthMode(id); setAuthError(''); setRecoveredPassword(null); }}
              >
                {label}
              </button>
            ))}
          </div>

          {authError && <p className={styles.authError}>{authError}</p>}

          {authMode === 'login' && !recoveredPassword && (
            <form onSubmit={handleLogin} className={styles.form}>
              <label>
                Email *
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className={styles.input}
                  placeholder="votre@email.com"
                />
              </label>
              <label>
                Mot de passe *
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  className={styles.input}
                />
              </label>
              <button type="submit" className={styles.saveBtn}>
                <KeyRound size={18} /> Se connecter
              </button>
              <button
                type="button"
                className={styles.forgotBtn}
                onClick={() => { setAuthMode('forgot'); setAuthError(''); setRecoveredPassword(null); }}
              >
                Mot de passe oublié ?
              </button>
            </form>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className={styles.form}>
              <p className={styles.forgotHint}>
                Entrez votre email pour afficher votre mot de passe (prototype de démonstration).
              </p>
              <label>
                Email *
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className={styles.input}
                  placeholder="votre@email.com"
                />
              </label>
              {recoveredPassword && (
                <div className={styles.recoveredBox}>
                  <KeyRound size={18} />
                  <div>
                    <strong>Votre mot de passe :</strong>
                    <p className={styles.recoveredPassword}>{recoveredPassword}</p>
                  </div>
                </div>
              )}
              <button type="submit" className={styles.saveBtn}>
                Afficher mon mot de passe
              </button>
              <button
                type="button"
                className={styles.forgotBtn}
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
              >
                ← Retour à la connexion
              </button>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleCreate} className={styles.form}>
              <label>
                Nom complet *
                <input name="nom" value={form.nom} onChange={handleChange} required className={styles.input} />
              </label>
              <label>
                Email *
                <input type="email" name="email" value={form.email} onChange={handleChange} required className={styles.input} placeholder="votre@email.com" />
              </label>
              <label>
                Mot de passe *
                <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={4} className={styles.input} />
              </label>
              <ProfessionSelect
                category={form.categorie}
                profession={form.profession}
                customProfession={form.customProfession}
                onCategoryChange={(v) => setForm((prev) => ({ ...prev, categorie: v, profession: '', customProfession: '' }))}
                onProfessionChange={(v) => setForm((prev) => ({ ...prev, profession: v }))}
                onCustomProfessionChange={(v) => setForm((prev) => ({ ...prev, customProfession: v }))}
                inputClassName={styles.input}
              />
              <label>
                Région *
                <select name="region" value={form.region} onChange={handleChange} required className={styles.input}>
                  <option value="">Sélectionner</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label>
                Quartier
                <input name="quartier" value={form.quartier} onChange={handleChange} className={styles.input} />
              </label>
              <label>
                Téléphone / WhatsApp *
                <input name="telephone" value={form.telephone} onChange={handleChange} required className={styles.input} placeholder="+224 6XX XX XX XX" />
              </label>
              <label>
                Description
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={styles.textarea} />
              </label>
              <button type="submit" className={styles.saveBtn}>
                <Briefcase size={18} /> Créer mon espace pro
              </button>
            </form>
          )}

          <Link to="/" className={styles.browseLink}>
            <Search size={16} /> Consulter l'annuaire
          </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.dashHeader}>
          <div className={styles.avatar} style={{ background: getAvatarColor(account.categorie || account.profession) }}>
            {getInitials(account.nom)}
          </div>
          <div className={styles.dashHeaderInfo}>
            <div className={styles.nameRow}>
              <h1>{account.nom}</h1>
              {account.verifie && (
                <span className="badge-verified verified">
                  <BadgeCheck size={13} /> Vérifié
                </span>
              )}
            </div>
            <p className={styles.profession}>{account.profession}</p>
          </div>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout} title="Se déconnecter">
            <LogOut size={18} />
          </button>
        </div>

        {saved && <div className={styles.toast}><CheckCircle size={16} /> Profil mis à jour</div>}
        {premiumSuccess && (
          <div className={styles.toastPremium}>
            <BadgeCheck size={16} /> Premium activé — Badge bleu et fonctionnalités débloquées !
          </div>
        )}
        {premiumCancelled && (
          <div className={styles.toastCancelled}>
            <AlertCircle size={16} /> Abonnement Premium résilié — fonctionnalités Premium désactivées.
          </div>
        )}

        {/* Tabs */}
        <nav className={styles.tabs}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
              {id === 'reviews' && reviews.length > 0 && (
                <span className={styles.tabBadge}>{reviews.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Vue d'ensemble */}
        {tab === 'overview' && (
          <div className={styles.tabContent}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <Star size={20} className={styles.statIconGold} />
                <span className={styles.statValue}>{avgRating ? avgRating.toFixed(1) : '—'}</span>
                <span className={styles.statLabel}>Note moyenne</span>
              </div>
              <div className={styles.statCard}>
                <MessageSquare size={20} className={styles.statIconGold} />
                <span className={styles.statValue}>{reviews.length}</span>
                <span className={styles.statLabel}>Avis reçus</span>
              </div>
              <div className={`${styles.statCard} ${!premiumActive ? styles.statLocked : ''}`}>
                <Eye size={20} className={styles.statIconBlue} />
                <span className={styles.statValue}>
                  {premiumActive ? account.profileViews || 0 : <Lock size={16} />}
                </span>
                <span className={styles.statLabel}>Visites profil</span>
              </div>
              <div className={styles.statCard}>
                <Phone size={20} className={styles.statIconGreen} />
                <span className={styles.statValue}>{Math.floor((account.profileViews || 0) * 0.3)}</span>
                <span className={styles.statLabel}>Contacts WhatsApp</span>
              </div>
            </div>

            <div className={styles.actionRow}>
              <Link to="/" className={styles.actionBtn}>
                <Search size={18} /> Consulter les services
              </Link>
              <Link to="/mon-profil" className={styles.actionBtnOutline}>
                <ExternalLink size={18} /> Voir mon profil public
              </Link>
            </div>

            {reviews.length > 0 && (
              <section className={styles.card}>
                <h2>Derniers avis</h2>
                {reviews.slice(0, 2).map((r) => (
                  <div key={r.id} className={styles.reviewPreview}>
                    <div className={styles.reviewHead}>
                      <strong>{r.prenom}</strong>
                      <StarDisplay rating={r.note} size={12} />
                    </div>
                    <p>{r.commentaire}</p>
                  </div>
                ))}
                <button className={styles.seeAll} onClick={() => setTab('reviews')}>
                  Voir tous les avis →
                </button>
              </section>
            )}
          </div>
        )}

        {/* Mon profil */}
        {tab === 'profile' && (
          <div className={styles.tabContent}>
            <form onSubmit={handleSave} className={styles.form}>
              <section className={styles.card}>
                <h2>Informations de base</h2>
                {[
                  ['nom', 'Nom complet'], ['telephone', 'Téléphone'], ['whatsapp', 'WhatsApp'], ['email', 'Email'],
                ].map(([name, label]) => (
                  <label key={name}>
                    {label}
                    <input name={name} value={form[name] || ''} onChange={handleChange} className={styles.input} />
                  </label>
                ))}
                <ProfessionSelect
                  category={form.categorie}
                  profession={form.profession}
                  customProfession={form.customProfession}
                  onCategoryChange={(v) => setForm((prev) => ({ ...prev, categorie: v, profession: '', customProfession: '' }))}
                  onProfessionChange={(v) => setForm((prev) => ({ ...prev, profession: v }))}
                  onCustomProfessionChange={(v) => setForm((prev) => ({ ...prev, customProfession: v }))}
                  inputClassName={styles.input}
                  required={false}
                />
                <label>
                  Région
                  <select name="region" value={form.region} onChange={handleChange} className={styles.input}>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <label>
                  Quartier
                  <input name="quartier" value={form.quartier} onChange={handleChange} className={styles.input} />
                </label>
                <label>
                  Description
                  <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={styles.textarea} />
                </label>
              </section>

              {premiumActive ? (
                <section className={styles.card}>
                  <h2>Profil professionnel <span className={styles.premiumTag}>Premium</span></h2>
                  <label>
                    Slogan
                    <input name="slogan" value={form.slogan} onChange={handleChange} className={styles.input} placeholder="Ex: Votre expert de confiance à Conakry" />
                  </label>
                  <label>
                    Horaires
                    <input name="horaires" value={form.horaires} onChange={handleChange} className={styles.input} />
                  </label>
                  <label>
                    Services (séparés par des virgules)
                    <input name="servicesStr" value={form.servicesStr} onChange={handleChange} className={styles.input} placeholder="Consultation, Dépannage, Installation" />
                  </label>
                  <label>
                    Spécialités (séparées par des virgules)
                    <input name="specialitesStr" value={form.specialitesStr} onChange={handleChange} className={styles.input} />
                  </label>

                  <h3 className={styles.subHeading}>Réseaux sociaux & liens</h3>
                  {NETWORKS.map(({ key, label }) => (
                    <label key={key}>
                      {label}
                      <input
                        value={form.social[key] || ''}
                        onChange={(e) => handleSocialChange(key, e.target.value)}
                        className={styles.input}
                        placeholder={`Lien ${label}`}
                      />
                    </label>
                  ))}
                </section>
              ) : (
                <div className={styles.lockedSection}>
                  <Lock size={24} />
                  <p>Profil professionnel complet, réseaux sociaux et portfolio — réservé aux abonnés Premium.</p>
                  <button type="button" className={styles.unlockBtn} onClick={() => setTab('premium')}>
                    <Crown size={16} /> Passer à Premium
                  </button>
                </div>
              )}

              <button type="submit" className={styles.saveBtn}>
                <Save size={18} /> Enregistrer
              </button>
            </form>
          </div>
        )}

        {/* Avis */}
        {tab === 'reviews' && (
          <div className={styles.tabContent}>
            <section className={styles.card}>
              <div className={styles.reviewsHeader}>
                <h2>Avis & commentaires</h2>
                {avgRating > 0 && (
                  <div className={styles.avgRating}>
                    <span className={styles.avgNum}>{avgRating.toFixed(1)}</span>
                    <StarDisplay rating={avgRating} size={18} />
                    <span className={styles.avgCount}>{reviews.length} avis</span>
                  </div>
                )}
              </div>
              {reviews.length === 0 ? (
                <p className={styles.emptyText}>Aucun avis pour le moment. Partagez votre profil !</p>
              ) : (
                <div className={styles.reviewsList}>
                  {reviews.map((r) => (
                    <div key={r.id} className={styles.reviewCard}>
                      <div className={styles.reviewHead}>
                        <div>
                          <strong>{r.prenom}</strong>
                          <StarDisplay rating={r.note} size={13} />
                        </div>
                        <span className={styles.reviewDate}>
                          {new Date(r.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className={styles.reviewComment}>{r.commentaire}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Premium */}
        {tab === 'premium' && (
          <div className={styles.tabContent}>
            <section className={`${styles.card} ${styles.premiumCard}`}>
              <div className={styles.premiumHeader}>
                <Crown size={28} className={styles.crown} />
                <div>
                  <h2>G-List Premium</h2>
                  <p className={styles.premiumSub}>Votre page professionnelle complète</p>
                </div>
              </div>

              {premiumActive ? (
                <>
                  <div className={styles.premiumActive}>
                    <BadgeCheck size={22} className={styles.blueIcon} />
                    <div>
                      <p className={styles.premiumStatus}>Abonnement actif — Badge bleu certifié</p>
                      <p className={styles.premiumExpiry}>
                        Renouvellement avant le {new Date(account.premiumExpires).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.unsubscribeBtn}
                    onClick={() => setShowUnsubscribeModal(true)}
                  >
                    Se désabonner du Premium
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.price}>{formatGNF(PREMIUM_PRICE_GNF)} <span>GNF / mois</span></p>
                  <ul className={styles.featureList}>
                    <li><BadgeCheck size={15} /> Badge bleu certifié (comme Facebook)</li>
                    <li><Eye size={15} /> Statistiques de visites sur votre profil</li>
                    <li><ExternalLink size={15} /> Page professionnelle complète</li>
                    <li><Phone size={15} /> Réseaux sociaux & portfolio cliquables</li>
                    <li><MapPin size={15} /> Mise en avant sur la carte</li>
                    <li><Star size={15} /> Services, spécialités & slogan personnalisés</li>
                  </ul>
                  <button className={styles.premiumBtn} onClick={() => setShowPremiumModal(true)}>
                    <Crown size={18} /> S'abonner — {formatGNF(PREMIUM_PRICE_GNF)} GNF/mois
                  </button>
                </>
              )}

              <div className={styles.renewalNotice}>
                <AlertCircle size={14} />
                <p>
                  Il est de <strong>votre responsabilité</strong> de renouveler votre abonnement
                  dans l'application via dépôt <strong>Mobile Money</strong> (Orange Money, MTN MoMo).
                </p>
              </div>
            </section>
          </div>
        )}

        {/* Paramètres */}
        {tab === 'settings' && (
          <div className={styles.tabContent}>
            <section className={styles.card}>
              <h2>Compte</h2>
              <div className={styles.settingsRow}>
                <span className={styles.settingsLabel}>Nom</span>
                <span className={styles.settingsValue}>{account.nom}</span>
              </div>
              <div className={styles.settingsRow}>
                <span className={styles.settingsLabel}>Email</span>
                <span className={styles.settingsValue}>{account.email}</span>
              </div>
              <div className={styles.settingsRow}>
                <span className={styles.settingsLabel}>Profession</span>
                <span className={styles.settingsValue}>{account.profession}</span>
              </div>
            </section>

            <section className={styles.card}>
              <h2>Session</h2>
              <p className={styles.settingsHint}>
                Déconnectez-vous pour quitter votre espace pro sur cet appareil.
              </p>
              <button type="button" className={styles.logoutSettingsBtn} onClick={handleLogout}>
                <LogOut size={18} />
                Se déconnecter
              </button>
            </section>
          </div>
        )}
      </div>

      {showUnsubscribeModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUnsubscribeModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <AlertCircle size={32} className={styles.modalWarningIcon} />
            <h3>Se désabonner du Premium ?</h3>
            <p className={styles.modalText}>
              Vous perdrez le badge certifié, les statistiques de visites, la page pro
              complète et la mise en avant sur la carte. Vous pourrez vous réabonner à tout moment.
            </p>
            <button className={styles.unsubscribeConfirmBtn} onClick={handleUnsubscribe}>
              Confirmer la résiliation
            </button>
            <button className={styles.cancelBtn} onClick={() => setShowUnsubscribeModal(false)}>
              Garder mon abonnement
            </button>
          </div>
        </div>
      )}

      {showPremiumModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPremiumModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Crown size={32} className={styles.modalCrown} />
            <h3>Abonnement Premium</h3>
            <p className={styles.modalPrice}>{formatGNF(PREMIUM_PRICE_GNF)} GNF / mois</p>
            <p className={styles.modalText}>
              Badge bleu certifié, page pro complète, statistiques de visites,
              réseaux sociaux et portfolio.
            </p>
            <div className={styles.modalMobile}>
              <Smartphone size={18} />
              Paiement par Orange Money · MTN MoMo
            </div>
            <p className={styles.modalWarning}>
              Vous êtes responsable du renouvellement mensuel via l'application.
            </p>
            <button className={styles.confirmBtn} onClick={handleSubscribe}>
              Confirmer (simulation)
            </button>
            <button className={styles.cancelBtn} onClick={() => setShowPremiumModal(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
