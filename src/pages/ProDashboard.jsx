import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { consumePendingWelcome, setPendingWelcome, showWelcomeFor } from '../utils/welcomeToast';
import {
  Briefcase, MapPin, Phone, Search, Crown, BadgeCheck,
  Save, Smartphone, AlertCircle, CheckCircle, Star,
  Eye, MessageSquare, BarChart3, ExternalLink, Lock, LogOut, KeyRound, Settings,
  LayoutDashboard, Image, Bell, HelpCircle, Menu, X, Users, Globe, FileText,
  Award, TrendingUp, Zap, History, CreditCard, User, Home,
} from 'lucide-react';
import ProfessionSelect, { resolveProfessionValue, professionToFormFields } from '../components/ProfessionSelect';
import { AUTH_VISUAL } from '../data/authVisualImages';
import { useProReviews } from '../hooks/useProReviews';
import {
  getProAccount, saveProAccount, createProAccount, loginProAccount,
  createVisitorAccount, loginVisitorAccount,
  logoutProAccount, deleteProAccount,
  subscribePremium, unsubscribePremium, PREMIUM_PRICE_GNF,
  getProPlanLevel, isPremiumActive,
  BILLING_CYCLE_MONTHLY, BILLING_CYCLE_ANNUAL,
} from '../utils/storage';
import { getInitials, getAvatarColor, getAvatarTextColor } from '../utils/helpers';
import { getUnreadCount } from '../utils/notificationInbox';
import { StarDisplay } from '../components/StarRating';
import { NETWORKS } from '../components/SocialLinks';
import { usePageMeta } from '../hooks/usePageMeta';
import ModalAbonnement, { ToastAbonnement } from '../components/Abonnement/ModalAbonnement';
import { fetchSubscriptionStatus } from '../api/abonnement';
import { peutSouscrire, isAbonnementActif } from '../utils/plans';
import DateRangePicker, { defaultDateRange } from '../components/dashboard/DateRangePicker';
import ThemeToggle from '../components/ThemeToggle';
import PasswordInput from '../components/PasswordInput';
import SidebarCollapseToggle from '../components/dashboard/SidebarCollapseToggle';
import AuthTermsAcceptance from '../components/AuthTermsAcceptance';
import LocaliteInput from '../components/LocaliteInput';
import WelcomeToast from '../components/WelcomeToast';
import { upsertLocalitePersonnalisee } from '../api/localites';
import { estPrefectureOfficielle } from '../utils/localite';
import { useSidebar } from '../context/SidebarContext';
import styles from './ProDashboard.module.css';
import {
  ServicesTab, PhotosTab, ReviewsTabExtended, UpgradeTab,
  AnalyticsTab, ConcurrenceTab, SuggestionsTab, CrmTab, MinisiteTab,
  ReportsTab, ReputationTab, RankingTab, AlertsTab,
  OverviewFreeTab, ProfileTabExtended, SettingsTab,
  HistoryTab, BillingTab, NotificationsTab,
} from './ProDashboardExtras';

function formatGNF(n) {
  return new Intl.NumberFormat('fr-GN').format(n);
}

function getTabsForPlan(plan) {
  const base = [
    { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard, section: 'principal' },
    { id: 'profile', label: 'Mon profil', icon: Briefcase, section: 'principal' },
    { id: 'services', label: 'Services', icon: Briefcase, section: 'principal' },
    { id: 'photos', label: 'Photos', icon: Image, section: 'principal' },
    { id: 'reviews', label: 'Avis clients', icon: MessageSquare, section: 'principal' },
    { id: 'upgrade', label: 'Upgrade', icon: Crown, section: 'compte' },
    { id: 'history', label: 'Historique', icon: History, section: 'compte' },
    { id: 'notifications', label: 'Notifications', icon: Bell, section: 'compte' },
    { id: 'settings', label: 'Paramètres', icon: Settings, section: 'compte' },
  ];
  if (plan === 'advanced' || plan === 'premium') {
    base.splice(8, 0,
      { id: 'billing', label: 'Facturation', icon: CreditCard, section: 'compte' },
    );
  }
  if (plan === 'advanced' || plan === 'premium') {
    base.splice(6, 0,
      { id: 'analytics', label: 'Statistiques', icon: BarChart3, section: 'pro' },
      { id: 'concurrence', label: 'Concurrence', icon: Search, section: 'pro' },
      { id: 'suggestions', label: 'Suggestions IA', icon: Star, section: 'pro' },
      { id: 'alerts', label: 'Centre d\'alertes', icon: Zap, section: 'pro' },
    );
  }
  if (plan === 'premium') {
    base.splice(10, 0,
      { id: 'crm', label: 'CRM Prospects', icon: Users, section: 'premium' },
      { id: 'minisite', label: 'Mini-site', icon: Globe, section: 'premium' },
      { id: 'reports', label: 'Rapports', icon: FileText, section: 'premium' },
      { id: 'reputation', label: 'Score Réputation', icon: Award, section: 'premium' },
      { id: 'ranking', label: 'Classement', icon: TrendingUp, section: 'premium' },
    );
  }
  return base;
}

const TAB_SUBTITLES = {
  overview: 'Vue d\'ensemble de votre activité et de votre profil',
  profile: 'Gérez les informations visibles sur votre fiche',
  services: 'Liste des prestations que vous proposez',
  photos: 'Galerie et visuels de votre activité',
  reviews: 'Avis et retours de vos clients',
  upgrade: 'Comparez les offres et évoluez',
  settings: 'Compte et préférences',
  analytics: 'Performances et trafic sur 30 jours',
  concurrence: 'Positionnement dans votre catégorie',
  suggestions: 'Recommandations pour améliorer votre visibilité',
  crm: 'Suivi de vos prospects et conversions',
  minisite: 'Éditeur portfolio — sections, fichiers et lien personnalisé',
  reports: 'Rapports mensuels de performance',
  reputation: 'Score global de votre réputation',
  ranking: 'Classement dans votre ville',
  alerts: 'Centre d\'alertes — événements et notifications',
  history: 'Historique complet de votre activité',
  billing: 'Abonnements et historique des paiements',
  notifications: 'Boîte de réception G-List',
};

const DATE_FILTER_TABS = new Set([
  'overview', 'analytics', 'reviews', 'crm', 'reports', 'reputation', 'alerts', 'history',
]);

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
  usePageMeta({
    title: 'Espace professionnel',
    description: 'Gérez votre profil, vos avis et votre visibilité sur G-List.',
    path: '/espace-pro',
    noIndex: true,
  });

  const navigate = useNavigate();
  const [account, setAccount] = useState(() => getProAccount());
  const [searchParams] = useSearchParams();
  const [accountType, setAccountType] = useState(() => (
    searchParams.get('type') === 'visiteur' ? 'visitor' : 'pro'
  ));
  const [authMode, setAuthMode] = useState(() => (
    searchParams.get('register') === '1' ? 'register' : 'login'
  ));
  const [form, setForm] = useState(() => accountToForm(getProAccount()));
  const [visitorForm, setVisitorForm] = useState({ prenom: '', nom: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [tab, setTab] = useState('overview');
  const [saved, setSaved] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [premiumSuccess, setPremiumSuccess] = useState(false);
  const [premiumCancelled, setPremiumCancelled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { collapsed } = useSidebar();
  const [headerSearch, setHeaderSearch] = useState('');
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [showAbonnementModal, setShowAbonnementModal] = useState(false);
  const [abonnementModalPlan, setAbonnementModalPlan] = useState('advanced');
  const [abonnementToast, setAbonnementToast] = useState(null);
  const [abonnementAlert, setAbonnementAlert] = useState('');
  const [subscriptionRefreshKey, setSubscriptionRefreshKey] = useState(0);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const isLoggedIn = !!account;
  const authVisual = AUTH_VISUAL[accountType];

  const plan = getProPlanLevel(account);
  const TABS = getTabsForPlan(plan);
  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TABS.some((item) => item.id === t)) {
      setTab(t);
    }
  }, [searchParams, plan]);

  useEffect(() => {
    if (!account?.id) return;
    const pending = consumePendingWelcome();
    if (pending?.type === 'pro') {
      showWelcomeFor(8000, setWelcomeMessage, pending);
    }
  }, [account?.id]);

  // Sync plan depuis Supabase au chargement (l'admin peut avoir activé depuis un autre appareil)
  useEffect(() => {
    if (!account?.id) return;
    let cancelled = false;
    fetchSubscriptionStatus(account).then((status) => {
      if (cancelled || !status) return;
      const remotePlan = status.plan_actif ? (status.plan || account.plan) : 'free';
      const normalizedPlan = remotePlan === 'pro_advanced' ? 'advanced'
        : remotePlan === 'pro_premium' ? 'premium'
        : remotePlan === 'pro' ? 'advanced'
        : remotePlan;
      const needsSync = normalizedPlan !== account.plan
        || status.plan_actif !== account.planActif
        || status.plan_fin !== account.planFin;
      if (normalizedPlan && needsSync) {
        const updated = {
          ...account,
          plan: normalizedPlan,
          planAbonnement: status.plan,
          planActif: status.plan_actif,
          planFin: status.plan_fin,
          planDebut: status.plan_debut,
          premium: normalizedPlan === 'premium',
          premiumExpires: status.plan_fin,
        };
        saveProAccount(updated);
        setAccount(updated);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [account?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const { reviews } = useProReviews(account?.id);
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.note, 0) / reviews.length
    : 0;
  const adminBroadcastCount = useMemo(() => getUnreadCount(), [tab, account]);

  const handleTabChange = (id) => {
    setTab(id);
    setSidebarOpen(false);
  };

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      window.location.href = `/annuaire?search=${encodeURIComponent(headerSearch.trim())}`;
    }
  };

  const sidebarSections = [
    { key: 'principal', label: 'Menu' },
    { key: 'pro', label: 'Outils pro' },
    { key: 'premium', label: 'Premium' },
    { key: 'compte', label: null },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (value) => {
    setForm((prev) => ({ ...prev, region: value }));
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!acceptedTerms) {
      setAuthError('Veuillez accepter les conditions et la politique de confidentialité.');
      return;
    }
    const profession = resolveProfessionValue(form.categorie, form.profession, form.customProfession);
    if (!profession) {
      setAuthError('Veuillez sélectionner ou préciser votre profession.');
      return;
    }
    try {
      if (form.region && !estPrefectureOfficielle(form.region)) {
        await upsertLocalitePersonnalisee(form.region);
      }
      const created = await createProAccount({ ...form, profession });
      setPendingWelcome({ type: 'pro', name: created.nom });
      setAccount(created);
      setForm(accountToForm(created));
    } catch (err) {
      if (err.message === 'EMAIL_EXISTS_LOGIN_INSTEAD') {
        // Compte existant avec le bon mot de passe → connexion automatique
        const logged = await loginProAccount(form.email, form.password);
        if (logged) {
          setPendingWelcome({ type: 'pro', name: logged.nom });
          setAccount(logged);
          setForm(accountToForm(logged));
        } else {
          setAuthError('Un compte existe déjà. Connectez-vous.');
          setAuthMode('login');
          setLoginForm((prev) => ({ ...prev, email: form.email, password: form.password }));
        }
      } else if (err.message === 'EMAIL_EXISTS') {
        setAuthError('Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.');
        setAuthMode('login');
        setLoginForm((prev) => ({ ...prev, email: form.email }));
      } else if (err.message === 'PASSWORD_TOO_SHORT') {
        setAuthError('Le mot de passe doit contenir au moins 6 caractères.');
      } else if (err.message === 'EMAIL_REQUIRED') {
        setAuthError('L\'email est obligatoire.');
      } else if (err.message === 'PASSWORD_REQUIRED') {
        setAuthError('Le mot de passe est obligatoire.');
      } else {
        setAuthError(err.message || 'Une erreur est survenue lors de la création du compte.');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!acceptedTerms) {
      setAuthError('Veuillez accepter les conditions et la politique de confidentialité.');
      return;
    }
    if (accountType === 'visitor') {
      const session = loginVisitorAccount(loginForm.email, loginForm.password);
      if (!session) {
        setAuthError('Email ou mot de passe incorrect.');
        return;
      }
      navigate('/dashboard/visiteur');
      return;
    }
    const session = await loginProAccount(loginForm.email, loginForm.password);
    if (!session) {
      setAuthError('Email ou mot de passe incorrect.');
      return;
    }
    setAccount(session);
    setForm(accountToForm(session));
    setLoginForm({ email: '', password: '' });
  };

  const handleCreateVisitor = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!acceptedTerms) {
      setAuthError('Veuillez accepter les conditions et la politique de confidentialité.');
      return;
    }
    try {
      const created = createVisitorAccount(visitorForm);
      setPendingWelcome({ type: 'visitor', name: created.prenom });
      navigate('/dashboard/visiteur');
    } catch (err) {
      if (err.message === 'PASSWORD_TOO_SHORT') {
        setAuthError('Le mot de passe doit contenir au moins 6 caractères.');
      } else if (err.message === 'EMAIL_EXISTS') {
        setAuthError('Un compte existe déjà avec cet email. Connectez-vous.');
        setAuthMode('login');
        setLoginForm((prev) => ({ ...prev, email: visitorForm.email }));
      } else {
        setAuthError('Email et mot de passe sont obligatoires.');
      }
    }
  };

  const handleLogout = () => {
    logoutProAccount();
    setAccount(null);
    setForm(EMPTY_FORM);
    setAuthMode('login');
    setTab('overview');
    setAuthError('');
  };

  const handleDeleteAccount = async ({ password, reason }) => {
    if (!account?.email) return { ok: false, error: 'NOT_FOUND' };
    const result = await deleteProAccount(account.email, password, { reason, requireReason: true });
    if (result.ok) {
      setAccount(null);
      setForm(EMPTY_FORM);
      setAuthMode('login');
      setTab('overview');
      setAuthError('');
    }
    return result;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const updated = buildAccount();
    if (updated.region && !estPrefectureOfficielle(updated.region)) {
      await upsertLocalitePersonnalisee(updated.region);
    }
    saveProAccount(updated);
    import('../utils/platformEvents.js').then((m) => m.onProProfileSave(updated.id)).catch(() => {});
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

  const handleSubscribeRequest = async (planId) => {
    if (!planId || planId === 'free') return;
    const actif = isAbonnementActif(account);
    const planActuel = actif ? plan : 'free';
    const { autorise, raison } = peutSouscrire(planActuel, planId, actif);
    if (!autorise) {
      setAbonnementAlert(raison);
      window.setTimeout(() => setAbonnementAlert(''), 7000);
      return;
    }
    try {
      const status = await fetchSubscriptionStatus(account);
      if (status?.demandes_en_attente > 0) {
        setAbonnementAlert('Vous avez déjà une demande en cours de traitement. Patientez ou contactez le support.');
        window.setTimeout(() => setAbonnementAlert(''), 8000);
        return;
      }
    } catch { /* ouvrir le modal si statut indisponible */ }
    setAbonnementModalPlan(planId);
    setShowAbonnementModal(true);
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
          <img
            className={styles.authVisualImg}
            src={authVisual.image}
            alt=""
            style={{ objectPosition: authVisual.position }}
          />
          <div className={styles.authVisualOverlay} />
          <p className={styles.authVisualCaption}>
            {authVisual.caption}
            <span>{authVisual.subcaption}</span>
          </p>
        </div>

        <div className={styles.authPanel}>
          <ThemeToggle className={styles.authThemeToggle} />
          <div className={styles.container}>
            <h1 className={styles.pageTitle}>
              {accountType === 'pro' ? 'Espace professionnel' : 'Espace visiteur'}
            </h1>
            <p className={styles.pageSub}>
              {accountType === 'pro'
                ? 'Connectez-vous ou créez votre compte pour gérer votre profil G-List.'
                : 'Connectez-vous ou créez un compte pour vos favoris, votre historique et vos avis.'}
            </p>

          <div className={styles.accountTypePicker} role="group" aria-label="Type de compte">
            <button
              type="button"
              className={`${styles.accountTypeBtn} ${accountType === 'visitor' ? styles.accountTypeBtnActive : ''}`}
              onClick={() => { setAccountType('visitor'); setAuthError(''); setAcceptedTerms(false); }}
            >
              <User size={20} aria-hidden="true" />
              <span className={styles.accountTypeLabel}>
                Utilisateur
                <small>Favoris &amp; historique</small>
              </span>
            </button>
            <button
              type="button"
              className={`${styles.accountTypeBtn} ${accountType === 'pro' ? styles.accountTypeBtnActive : ''}`}
              onClick={() => { setAccountType('pro'); setAuthError(''); setAcceptedTerms(false); }}
            >
              <Briefcase size={20} aria-hidden="true" />
              <span className={styles.accountTypeLabel}>
                Professionnel
                <small>Fiche annuaire &amp; visibilité</small>
              </span>
            </button>
          </div>

          <div className={styles.authTabs}>
            {[
              { id: 'login', label: 'Connexion' },
              { id: 'register', label: 'Créer un compte' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`${styles.authTab} ${authMode === id ? styles.authTabActive : ''}`}
                onClick={() => { setAuthMode(id); setAuthError(''); setAcceptedTerms(false); }}
              >
                {label}
              </button>
            ))}
          </div>

          {authError && <p className={styles.authError}>{authError}</p>}

          {authMode === 'login' && (
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
                <PasswordInput
                  inLabel
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  className={styles.input}
                  autoComplete="current-password"
                />
              </label>
              <AuthTermsAcceptance
                id="pro-auth-terms-login"
                checked={acceptedTerms}
                onChange={setAcceptedTerms}
              />
              <button type="submit" className={styles.saveBtn} disabled={!acceptedTerms}>
                <KeyRound size={18} /> Se connecter
              </button>
              <Link to={`/mot-de-passe-oublie?type=${accountType === 'visitor' ? 'visiteur' : 'pro'}`} className={styles.forgotBtn}>
                Mot de passe oublié ?
              </Link>
            </form>
          )}

          {authMode === 'register' && accountType === 'visitor' && (
            <form onSubmit={handleCreateVisitor} className={styles.form}>
              <label>
                Prénom *
                <input
                  value={visitorForm.prenom}
                  onChange={(e) => setVisitorForm((prev) => ({ ...prev, prenom: e.target.value }))}
                  required
                  className={styles.input}
                />
              </label>
              <label>
                Nom *
                <input
                  value={visitorForm.nom}
                  onChange={(e) => setVisitorForm((prev) => ({ ...prev, nom: e.target.value }))}
                  required
                  className={styles.input}
                />
              </label>
              <label>
                Email *
                <input
                  type="email"
                  value={visitorForm.email}
                  onChange={(e) => setVisitorForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className={styles.input}
                  placeholder="votre@email.com"
                />
              </label>
              <label>
                Mot de passe *
                <PasswordInput
                  inLabel
                  value={visitorForm.password}
                  onChange={(e) => setVisitorForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  className={styles.input}
                  autoComplete="new-password"
                />
              </label>
              <AuthTermsAcceptance
                id="pro-auth-terms-visitor"
                checked={acceptedTerms}
                onChange={setAcceptedTerms}
              />
              <button type="submit" className={styles.saveBtn} disabled={!acceptedTerms}>
                <User size={18} /> Créer mon compte
              </button>
            </form>
          )}

          {authMode === 'register' && accountType === 'pro' && (
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
                <PasswordInput
                  inLabel
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className={styles.input}
                  autoComplete="new-password"
                />
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
                Localité *
                <LocaliteInput
                  value={form.region}
                  onChange={handleRegionChange}
                  required
                  inputClassName={styles.input}
                />
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
              <AuthTermsAcceptance
                id="pro-auth-terms-pro"
                checked={acceptedTerms}
                onChange={setAcceptedTerms}
              />
              <button type="submit" className={styles.saveBtn} disabled={!acceptedTerms}>
                <Briefcase size={18} /> Créer mon espace pro
              </button>
            </form>
          )}

          <Link to="/annuaire" className={styles.browseLink}>
            <Search size={16} /> Consulter l'annuaire
          </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashLayout}>
      {sidebarOpen && <button type="button" className={styles.sidebarBackdrop} onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" />}

      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <SidebarCollapseToggle />
        <div className={styles.sidebarProfile}>
          <button type="button" className={styles.sidebarClose} onClick={() => setSidebarOpen(false)} aria-label="Fermer">
            <X size={20} />
          </button>
          <div
            className={styles.sidebarAvatar}
            style={{ background: getAvatarColor(account.categorie || account.profession), color: getAvatarTextColor(getAvatarColor(account.categorie || account.profession)) }}
          >
            {getInitials(account.nom)}
          </div>
          <div className={styles.sidebarUserInfo}>
            <div className={styles.sidebarNameRow}>
              <strong>{account.nom}</strong>
              {isPremiumActive(account) && (
                <BadgeCheck size={14} className={styles.sidebarVerified} aria-label="Compte vérifié" />
              )}
            </div>
            <span>{account.profession}</span>
            {account.region && (
              <span className={styles.sidebarRegion}>{account.region}</span>
            )}
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.sidebarGroup}>
            <Link
              to="/"
              className={styles.sidebarItem}
              data-label="Accueil"
              onClick={() => setSidebarOpen(false)}
            >
              <Home size={18} className={styles.navIcon} aria-hidden="true" />
              <span className={styles.navLabel}>Accueil</span>
            </Link>
          </div>
          {sidebarSections.map(({ key, label }) => {
            const items = TABS.filter((t) => t.section === key);
            if (!items.length) return null;
            return (
              <div key={key} className={styles.sidebarGroup}>
                {label && <span className={styles.sidebarGroupLabel}>{label}</span>}
                {items.map(({ id, label: tabLabel, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.sidebarItem} ${tab === id ? styles.sidebarItemActive : ''}`}
                    data-label={tabLabel}
                    onClick={() => handleTabChange(id)}
                  >
                    <Icon size={18} className={styles.navIcon} aria-hidden="true" />
                    <span className={styles.navLabel}>{tabLabel}</span>
                    {id === 'reviews' && reviews.length > 0 && (
                      <span className={styles.sidebarBadge}>{reviews.length}</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        {plan !== 'premium' && (
          <div className={styles.sidebarPremium}>
            <Crown size={18} />
            <div>
              <strong>Premium</strong>
              <p>Débloquez CRM, mini-site et rapports.</p>
            </div>
            <button type="button" onClick={() => handleTabChange('upgrade')}>Voir les offres</button>
          </div>
        )}
      </aside>

      <div className={styles.main}>
        <header className={styles.mainHeader}>
          <div className={styles.mainHeaderLeft}>
            <button type="button" className={styles.menuBtn} onClick={() => setSidebarOpen(true)} aria-label="Menu">
              <Menu size={22} />
            </button>
            <div>
              <h1 className={styles.mainTitle}>{activeTab.label}</h1>
              <p className={styles.mainSubtitle}>{TAB_SUBTITLES[tab] || ''}</p>
            </div>
          </div>
          <div className={styles.mainHeaderRight}>
            <form className={styles.headerSearch} onSubmit={handleHeaderSearch}>
              <Search size={16} />
              <input
                type="search"
                placeholder="Rechercher..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
              />
            </form>
            <ThemeToggle className={styles.headerThemeToggle} />
            <button type="button" className={styles.headerIconBtn} title="Notifications" onClick={() => handleTabChange('notifications')}>
              <Bell size={18} />
              {adminBroadcastCount > 0 && (
                <span className={styles.notifBadge}>{adminBroadcastCount}</span>
              )}
            </button>
            <button type="button" className={styles.headerIconBtn} title="Aide" onClick={() => handleTabChange('suggestions')}>
              <HelpCircle size={18} />
            </button>
          </div>
        </header>

        <WelcomeToast message={welcomeMessage} onDismiss={() => setWelcomeMessage('')} />
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
        {abonnementAlert && (
          <div className={styles.toastCancelled}>
            <AlertCircle size={16} aria-hidden /> {abonnementAlert}
          </div>
        )}

        <div className={styles.mainContent}>
        {DATE_FILTER_TABS.has(tab) && (
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        )}
        {tab === 'overview' && (
          <div className={styles.tabContent}>
            <OverviewFreeTab
              account={account}
              reviews={reviews}
              avgRating={avgRating}
              plan={plan}
              onSubscribe={handleSubscribeRequest}
              onTabChange={handleTabChange}
              onAccountUpdate={setAccount}
              dateRange={dateRange}
            />
            <div className={styles.actionRow}>
              <Link to="/" className={styles.actionBtn}><Search size={18} /> Consulter les services</Link>
              <Link to="/mon-profil" className={styles.actionBtnOutline}><ExternalLink size={18} /> Voir mon profil public</Link>
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className={styles.tabContent}>
            <ProfileTabExtended
              account={account}
              form={form}
              handleSave={handleSave}
              handleChange={handleChange}
              handleRegionChange={handleRegionChange}
              handleSocialChange={handleSocialChange}
            />
          </div>
        )}

        {tab === 'services' && (
          <div className={styles.tabContent}>
            <ServicesTab account={account} plan={plan} onSave={(acc) => { saveProAccount(acc); setAccount(acc); flash(); }} />
          </div>
        )}

        {tab === 'photos' && (
          <div className={styles.tabContent}><PhotosTab account={account} plan={plan} /></div>
        )}

        {tab === 'reviews' && (
          <div className={styles.tabContent}><ReviewsTabExtended account={account} plan={plan} dateRange={dateRange} /></div>
        )}

        {tab === 'upgrade' && (
          <div className={styles.tabContent}><UpgradeTab account={account} plan={plan} onSubscribe={handleSubscribeRequest} subscriptionRefreshKey={subscriptionRefreshKey} /></div>
        )}

        {tab === 'analytics' && (plan === 'advanced' || plan === 'premium') && (
          <div className={styles.tabContent}><AnalyticsTab account={account} dateRange={dateRange} /></div>
        )}

        {tab === 'concurrence' && (plan === 'advanced' || plan === 'premium') && (
          <div className={styles.tabContent}><ConcurrenceTab account={account} /></div>
        )}

        {tab === 'suggestions' && (plan === 'advanced' || plan === 'premium') && (
          <div className={styles.tabContent}><SuggestionsTab account={account} onTabChange={handleTabChange} /></div>
        )}

        {tab === 'crm' && plan === 'premium' && (
          <div className={styles.tabContent}><CrmTab account={account} dateRange={dateRange} /></div>
        )}

        {tab === 'minisite' && plan === 'premium' && (
          <MinisiteTab account={account} />
        )}

        {tab === 'reports' && plan === 'premium' && (
          <div className={styles.tabContent}><ReportsTab account={account} dateRange={dateRange} /></div>
        )}

        {tab === 'reputation' && plan === 'premium' && (
          <div className={styles.tabContent}><ReputationTab account={account} dateRange={dateRange} /></div>
        )}

        {tab === 'ranking' && plan === 'premium' && (
          <div className={styles.tabContent}><RankingTab account={account} /></div>
        )}

        {tab === 'alerts' && (plan === 'advanced' || plan === 'premium') && (
          <div className={styles.tabContent}><AlertsTab account={account} plan={plan} dateRange={dateRange} /></div>
        )}

        {tab === 'history' && (
          <div className={styles.tabContent}><HistoryTab account={account} dateRange={dateRange} /></div>
        )}

        {tab === 'billing' && (plan === 'advanced' || plan === 'premium') && (
          <div className={styles.tabContent}><BillingTab account={account} plan={plan} /></div>
        )}

        {tab === 'notifications' && (
          <div className={styles.tabContent}><NotificationsTab onUpdate={() => setTab(tab)} /></div>
        )}

        {/* Paramètres */}
        {tab === 'settings' && (
          <div className={styles.tabContent}>
            <SettingsTab
              account={account}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              onSubscribe={handleSubscribeRequest}
            />
          </div>
        )}
        </div>
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

      <ModalAbonnement
        open={showAbonnementModal}
        onClose={() => setShowAbonnementModal(false)}
        planId={abonnementModalPlan}
        account={account}
        onSuccess={() => {
          setSubscriptionRefreshKey((k) => k + 1);
          setAbonnementToast({
            title: 'Demande envoyée',
            body: 'Votre demande a été enregistrée. Notre équipe la traite sous peu — vous serez notifié dès l\'activation.',
          });
        }}
      />
      <ToastAbonnement message={abonnementToast} onClose={() => setAbonnementToast(null)} />
    </div>
  );
}
