import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase, MapPin, Phone, Search, Crown, BadgeCheck,
  Save, Smartphone, AlertCircle, CheckCircle, Star,
  Eye, MessageSquare, BarChart3, ExternalLink, Lock, LogOut, KeyRound, Settings,
  LayoutDashboard, Image, Bell, HelpCircle, Menu, X, Users, Globe, FileText,
  Award, TrendingUp, Zap, History, CreditCard,
} from 'lucide-react';
import { REGIONS } from '../data/constants';
import ProfessionSelect, { resolveProfessionValue, professionToFormFields } from '../components/ProfessionSelect';
import {
  getProAccount, saveProAccount, createProAccount, loginProAccount,
  logoutProAccount, deleteProAccount,
  subscribePremium, unsubscribePremium, PREMIUM_PRICE_GNF,
  getProReviews, getProAverageRating, getProPlanLevel, upgradePlan, isPremiumActive,
  BILLING_CYCLE_MONTHLY, BILLING_CYCLE_ANNUAL,
} from '../utils/storage';
import { getInitials, getAvatarColor } from '../utils/helpers';
import { getUnreadCount } from '../utils/notificationInbox';
import { SAAS_PLATFORM_LEVEL } from '../utils/saasLevel100';
import { StarDisplay } from '../components/StarRating';
import { NETWORKS } from '../components/SocialLinks';
import SeoHead from '../components/SEO/SeoHead';
import { UPGRADE_CONGRATS } from '../utils/planConfig';
import DateRangePicker, { defaultDateRange } from '../components/dashboard/DateRangePicker';
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
  const [account, setAccount] = useState(() => getProAccount());
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState(() => accountToForm(getProAccount()));
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('overview');
  const [saved, setSaved] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [premiumSuccess, setPremiumSuccess] = useState(false);
  const [premiumCancelled, setPremiumCancelled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [upgradeCongrats, setUpgradeCongrats] = useState(null);
  const [searchParams] = useSearchParams();

  const isLoggedIn = !!account;

  const plan = getProPlanLevel(account);
  const TABS = getTabsForPlan(plan);
  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TABS.some((item) => item.id === t)) {
      setTab(t);
    }
  }, [searchParams, plan]);
  const reviews = account ? getProReviews(account.id) : [];
  const avgRating = account ? getProAverageRating(account.id) : 0;
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
      } else if (err.message === 'PASSWORD_TOO_SHORT') {
        setAuthError('Le mot de passe doit contenir au moins 6 caractères.');
      } else {
        setAuthError('Email et mot de passe sont obligatoires pour créer un compte.');
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const session = loginProAccount(loginForm.email, loginForm.password);
    if (!session) {
      setAuthError('Email ou mot de passe incorrect.');
      return;
    }
    setAccount(session);
    setForm(accountToForm(session));
    setLoginForm({ email: '', password: '' });
  };

  const handleLogout = () => {
    logoutProAccount();
    setAccount(null);
    setForm(EMPTY_FORM);
    setAuthMode('login');
    setTab('overview');
    setAuthError('');
  };

  const handleDeleteAccount = (password) => {
    if (!account?.email) return { ok: false, error: 'NOT_FOUND' };
    const result = deleteProAccount(account.email, password);
    if (result.ok) {
      setAccount(null);
      setForm(EMPTY_FORM);
      setAuthMode('login');
      setTab('overview');
      setAuthError('');
    }
    return result;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = buildAccount();
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

  const handleUpgrade = (newPlan, billingCycle = BILLING_CYCLE_MONTHLY) => {
    const currentPlan = getProPlanLevel(account);
    const order = { free: 0, advanced: 1, premium: 2 };
    const updated = upgradePlan(newPlan, { billingCycle });
    if (updated) {
      setAccount(updated);
      if (order[newPlan] > order[currentPlan] && UPGRADE_CONGRATS[newPlan]) {
        setUpgradeCongrats({ plan: newPlan, billingCycle });
      }
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
      <>
        <SeoHead
          titre="Espace professionnel"
          description="Gérez votre profil, vos avis et votre visibilité sur G-List."
          url="/espace-pro"
          noIndex
        />
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
                onClick={() => { setAuthMode(id); setAuthError(''); }}
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
              <Link to="/mot-de-passe-oublie?type=pro" className={styles.forgotBtn}>
                Mot de passe oublié ?
              </Link>
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
                <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} className={styles.input} />
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
                Villes *
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

          <Link to="/annuaire" className={styles.browseLink}>
            <Search size={16} /> Consulter l'annuaire
          </Link>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        titre="Espace professionnel"
        description="Gérez votre profil, vos avis et votre visibilité sur G-List."
        url="/espace-pro"
        noIndex
      />
    <div className={styles.dashLayout}>
      {sidebarOpen && <button type="button" className={styles.sidebarBackdrop} onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" />}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarProfile}>
          <button type="button" className={styles.sidebarClose} onClick={() => setSidebarOpen(false)} aria-label="Fermer">
            <X size={20} />
          </button>
          <div
            className={styles.sidebarAvatar}
            style={{ background: getAvatarColor(account.categorie || account.profession) }}
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
                    onClick={() => handleTabChange(id)}
                  >
                    <Icon size={18} />
                    <span>{tabLabel}</span>
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
              onUpgrade={handleUpgrade}
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
            <ProfileTabExtended account={account} form={form} handleSave={handleSave} handleChange={handleChange} handleSocialChange={handleSocialChange} />
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
          <div className={styles.tabContent}><UpgradeTab account={account} plan={plan} onUpgrade={handleUpgrade} /></div>
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
            <SettingsTab account={account} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />
          </div>
        )}
        </div>
      </div>

      {upgradeCongrats && (
        <div className={styles.modalOverlay} onClick={() => setUpgradeCongrats(null)}>
          <div className={`${styles.modal} ${styles.congratsModal}`} onClick={(e) => e.stopPropagation()}>
            <Crown size={36} className={styles.modalCrown} />
            <h3>{UPGRADE_CONGRATS[upgradeCongrats.plan].title}</h3>
            <p className={styles.modalText}>{UPGRADE_CONGRATS[upgradeCongrats.plan].message}</p>
            {upgradeCongrats.billingCycle === BILLING_CYCLE_ANNUAL && (
              <p className={styles.congratsAnnual}>
                Abonnement annuel activé — 2 mois offerts inclus.
              </p>
            )}
            <button type="button" className={styles.confirmBtn} onClick={() => setUpgradeCongrats(null)}>
              C&apos;est parti !
            </button>
          </div>
        </div>
      )}

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
    </>
  );
}
