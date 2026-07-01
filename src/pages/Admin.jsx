import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import bcrypt from 'bcryptjs';
import { Link } from 'react-router-dom';
import {
  Shield, Lock,
  RotateCw, LogOut,
  MessageSquare, Bell,
  Users, Lightbulb,
  LayoutDashboard, UserCircle, BarChart3, Map,
  FileText, FileBarChart, ShieldAlert, Sparkles, Wallet, Crown, Menu, X, ScrollText, Home,
} from 'lucide-react';
import { getAdminUnreadCount, markAllAdminNotificationsRead } from '../utils/adminNotifications';
import { fetchPendingDemandes } from '../api/abonnement';
import { syncPlatformFormsCache } from '../api/platformForms';
import {
  getItem,
  exportAllData,
  resetAllData,
  getTotalProfileReviews,
  getEvaluations,
  KEYS,
} from '../utils/storage';
import {
  isAdminSessionValid,
  clearAdminSession,
  setAdminSession,
  formatCountdown,
} from '../utils/adminAuth';
import DateRangePicker, { defaultDateRange } from '../components/dashboard/DateRangePicker';
import ThemeToggle from '../components/ThemeToggle';
import SidebarCollapseToggle from '../components/dashboard/SidebarCollapseToggle';
import { useSidebar } from '../context/SidebarContext';
import GlistBot, { GlistBotAdminTrigger } from '../components/GlistBot';
import PasswordInput from '../components/PasswordInput';
import { filterByDateRange } from '../utils/dateRange';
import styles from './Admin.module.css';
import AdminAbonnements from './AdminAbonnements';
import {
  AdminOverview, AdminProfessionals, AdminUsers, AdminAnalytics,
  AdminMap, AdminOpportunities, AdminContent, AdminModeration,
  AdminIAInsights, AdminRevenue, AdminReports, AdminSubscriptionPlans, AdminFeedback,
  AdminNotifications, AdminAuditLog,
} from './AdminDashboardExtras';

const ADMIN_SIDEBAR_SECTIONS = [
  { key: 'menu', label: 'Menu' },
  { key: 'analyse', label: 'Analyse' },
  { key: 'gestion', label: 'Gestion' },
  { key: 'compte', label: null },
];

const ADMIN_TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard, section: 'menu' },
  { id: 'pros', label: 'Professionnels', icon: Users, section: 'menu' },
  { id: 'users', label: 'Utilisateurs', icon: UserCircle, section: 'menu' },
  { id: 'abonnements', label: 'Abonnements', icon: Crown, section: 'menu' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'analyse' },
  { id: 'map', label: 'Carte Guinée', icon: Map, section: 'analyse' },
  { id: 'opportunities', label: 'Opportunités', icon: Lightbulb, section: 'analyse' },
  { id: 'ia', label: 'IA Insights', icon: Sparkles, section: 'analyse' },
  { id: 'revenue', label: 'Revenus', icon: Wallet, section: 'analyse' },
  { id: 'reports', label: 'Rapports', icon: FileBarChart, section: 'analyse' },
  { id: 'content', label: 'Contenu', icon: FileText, section: 'gestion' },
  { id: 'moderation', label: 'Modération', icon: ShieldAlert, section: 'gestion' },
  { id: 'notifications', label: 'Notifications', icon: Bell, section: 'gestion' },
  { id: 'audit', label: 'Journal d\'audit', icon: ScrollText, section: 'gestion' },
  { id: 'plans', label: 'Offres', icon: Crown, section: 'gestion' },
  { id: 'legacy', label: 'Feedback', icon: MessageSquare, section: 'compte' },
];

const ADMIN_TAB_SUBTITLES = {
  overview: 'Indicateurs clés de la plateforme G-List',
  pros: 'Gérez les fiches, plans et statuts de vérification',
  users: 'Comptes visiteurs, professionnels et liste d\'attente',
  abonnements: 'Demandes de paiement et activation manuelle',
  analytics: 'Répartition du trafic et tendances',
  map: 'Densité des professionnels par région',
  opportunities: 'Zones à fort potentiel commercial',
  content: 'Générateur de contenu et planning réseaux',
  moderation: 'Signalements, suspects et doublons',
  notifications: 'Messages diffusés aux utilisateurs',
  audit: 'Traçabilité des actions administrateur',
  ia: 'Tendances automatiques et recommandations',
  revenue: 'Estimation MRR / ARR et répartition',
  reports: 'Export PDF, Word, Excel ou CSV',
  plans: 'Prix et descriptions des abonnements',
  legacy: 'Évaluations et suggestions utilisateurs',
};

const ADMIN_DATE_TABS = new Set([
  'overview', 'pros', 'users', 'analytics', 'opportunities',
  'moderation', 'audit', 'ia', 'revenue', 'reports', 'legacy',
]);

/** Bcrypt hash from .env — quotes required in .env so $ chars are not stripped */
function getAdminHash() {
  const raw = import.meta.env.VITE_ADMIN_HASH;
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().replace(/^["']|["']$/g, '');
}

/** Mot de passe prototype si VITE_ADMIN_HASH absent (défaut : glist2026) */
function getAdminFallbackPassword() {
  const raw = import.meta.env.VITE_ADMIN_PASSWORD;
  if (raw && typeof raw === 'string') return raw.trim();
  return 'glist2026';
}

async function verifyAdminPassword(password) {
  const trimmed = password.trim();
  const hash = getAdminHash();
  if (hash) return bcrypt.compare(trimmed, hash);
  return trimmed === getAdminFallbackPassword();
}

function buildEvaluationStats(evaluations) {
  const total = evaluations.length;
  const utileCounts = {
    'Oui, absolument': 0,
    'Peut-être': 0,
    'Non': 0,
  };
  let noteSum = 0;
  let withComments = 0;

  evaluations.forEach((entry) => {
    if (utileCounts[entry.utile] !== undefined) {
      utileCounts[entry.utile] += 1;
    }
    noteSum += entry.note || 0;
    if (entry.plusPlu?.trim() || entry.ameliorer?.trim()) {
      withComments += 1;
    }
  });

  const pct = (key) => (total ? Math.round((utileCounts[key] / total) * 100) : 0);

  return {
    total,
    utileCounts,
    pctOui: pct('Oui, absolument'),
    pctPeutEtre: pct('Peut-être'),
    pctNon: pct('Non'),
    avgNote: total ? (noteSum / total).toFixed(1) : '—',
    withComments,
  };
}

function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [blockRemaining, setBlockRemaining] = useState(0);

  const attemptsRef = useRef(0);
  const blockedUntilRef = useRef(null);

  const isBlocked = blockRemaining > 0;

  const tick = useCallback(() => {
    if (blockedUntilRef.current && Date.now() < blockedUntilRef.current) {
      setBlockRemaining(blockedUntilRef.current - Date.now());
    } else if (blockedUntilRef.current) {
      blockedUntilRef.current = null;
      setBlockRemaining(0);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const shakeButton = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleLogin = async (e) => {
    e?.preventDefault();

    if (blockedUntilRef.current && Date.now() < blockedUntilRef.current) {
      const remaining = Math.ceil((blockedUntilRef.current - Date.now()) / 1000);
      setError(`Trop de tentatives. Réessayez dans ${remaining}s`);
      return;
    }

    if (!getAdminHash() && !getAdminFallbackPassword()) {
      setError('Configuration manquante. Contactez l\'administrateur.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const match = await verifyAdminPassword(password);

      if (match) {
        attemptsRef.current = 0;
        blockedUntilRef.current = null;
        setBlockRemaining(0);
        setAdminSession();
        onSuccess();
      } else {
        attemptsRef.current += 1;

        if (attemptsRef.current >= 3) {
          blockedUntilRef.current = Date.now() + 120000;
          attemptsRef.current = 0;
          setBlockRemaining(120000);
          setError('3 tentatives échouées. Bloqué 2 minutes.');
        } else {
          setError(`Mot de passe incorrect. ${3 - attemptsRef.current} essai(s) restant(s).`);
          shakeButton();
        }
      }
    } catch {
      setError('Erreur de vérification. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <ThemeToggle onDark className={styles.loginThemeToggle} />
      <div className={styles.loginBgImage} aria-hidden="true" />
      <div className={styles.loginBgOverlay} aria-hidden="true" />
      <div className={styles.loginBgFx} aria-hidden="true">
        <div className={`${styles.loginBgRing} ${styles.loginBgRingTop}`} />
        <div className={`${styles.loginBgRing} ${styles.loginBgRingBottom}`} />
        <div className={styles.loginBgParticles} />
        {[
          { left: 14, dur: 4.5, delay: 0 },
          { left: 26, dur: 5.8, delay: 1.4 },
          { left: 38, dur: 4.2, delay: 2.8 },
          { left: 52, dur: 6.2, delay: 0.6 },
          { left: 64, dur: 5.1, delay: 3.2 },
          { left: 76, dur: 4.8, delay: 1.9 },
          { left: 88, dur: 5.5, delay: 2.2 },
        ].map((s) => (
          <span
            key={s.left}
            className={styles.dataStreak}
            style={{
              left: `${s.left}%`,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.loginPanel}>
        <div className={styles.loginForm}>
          <div className={styles.glassIconWrap} aria-hidden="true">
            <Shield size={26} />
          </div>

          <h1>Accès Administration</h1>
          <p className={styles.loginSubtitle}>
            Connectez-vous avec le mot de passe administrateur G-List.
          </p>

          <form onSubmit={handleLogin} className={styles.loginFormInner}>
            <div className={`${styles.glassInputWrap} ${error ? styles.glassInputError : ''}`}>
              <Lock size={16} className={styles.fieldIcon} />
              <PasswordInput
                variant="glass"
                wrapClassName={styles.glassPasswordWrap}
                className={styles.passwordInput}
                toggleClassName={styles.eyeBtn}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin(e);
                }}
                placeholder="Mot de passe administrateur"
                autoComplete="current-password"
                disabled={loading || isBlocked}
              />
            </div>

            {error && <p className={styles.errorBox}>{error}</p>}

            <button
              type="submit"
              className={`${styles.primaryBtn} ${shake ? styles.shake : ''} ${isBlocked ? styles.primaryBtnBlocked : ''}`}
              disabled={loading || isBlocked || !password}
            >
              {loading ? (
                <>
                  <span className={styles.spinnerDark} aria-hidden="true" />
                  Vérification… (peut prendre quelques secondes)
                </>
              ) : isBlocked ? (
                `Bloqué — ${formatCountdown(blockRemaining)}`
              ) : (
                'Se connecter →'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(() => isAdminSessionValid());
  const [data, setData] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [adminTab, setAdminTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { collapsed } = useSidebar();
  const [botOpen, setBotOpen] = useState(false);
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [adminUnread, setAdminUnread] = useState(() => getAdminUnreadCount());
  const [pendingAbos, setPendingAbos] = useState(0);

  const refreshPendingAbos = useCallback(async () => {
    try {
      const pending = await fetchPendingDemandes();
      setPendingAbos((pending || []).filter((d) => d.statut === 'en_attente').length);
    } catch {
      setPendingAbos(0);
    }
  }, []);

  const filteredEvaluations = useMemo(
    () => filterByDateRange(evaluations, dateRange.startDate, dateRange.endDate, 'date'),
    [evaluations, dateRange.startDate, dateRange.endDate],
  );
  const evalStats = useMemo(() => buildEvaluationStats(filteredEvaluations), [filteredEvaluations]);

  const loadData = useCallback(async () => {
    await syncPlatformFormsCache();
    setEvaluations(getEvaluations());
    setAdminUnread(getAdminUnreadCount());
    refreshPendingAbos();
    setData({
      thumbsUp: getItem(KEYS.FEEDBACK_THUMBS_UP, 0),
      thumbsDown: getItem(KEYS.FEEDBACK_THUMBS_DOWN, 0),
      suggestions: getItem(KEYS.SUGGESTIONS, []),
      profileReviews: getTotalProfileReviews(),
      engagementFound: getItem(KEYS.ENGAGEMENT_FOUND, 0),
      engagementSearching: getItem(KEYS.ENGAGEMENT_SEARCHING, 0),
      engagementTesting: getItem(KEYS.ENGAGEMENT_TESTING, 0),
    });
  }, [refreshPendingAbos]);

  useEffect(() => {
    if (!authenticated) return undefined;
    refreshPendingAbos();
    const timer = window.setInterval(refreshPendingAbos, 45000);
    return () => window.clearInterval(timer);
  }, [authenticated, refreshPendingAbos, adminTab]);

  useEffect(() => {
    if (!isAdminSessionValid()) {
      setAuthenticated(false);
      setData(null);
      return;
    }
    if (authenticated) {
      loadData();
    }
  }, [authenticated, loadData]);

  useEffect(() => {
    const checkSession = setInterval(() => {
      if (authenticated && !isAdminSessionValid()) {
        setAuthenticated(false);
        setData(null);
      }
    }, 30000);
    return () => clearInterval(checkSession);
  }, [authenticated]);

  const handleLogout = () => {
    clearAdminSession();
    setAuthenticated(false);
    setData(null);
  };

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glist-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirmReset) {
      resetAllData();
      setConfirmReset(false);
      loadData();
    } else {
      setConfirmReset(true);
    }
  };

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  const activeTab = ADMIN_TABS.find((t) => t.id === adminTab) || ADMIN_TABS[0];

  return (
    <div className={styles.dashLayout}>
      {sidebarOpen && (
        <button
          type="button"
          className={styles.sidebarBackdrop}
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <SidebarCollapseToggle />
        <div className={styles.sidebarProfile}>
          <button
            type="button"
            className={styles.sidebarClose}
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
          <div className={styles.sidebarAvatar}>
            <Shield size={20} aria-hidden />
          </div>
          <div className={styles.sidebarUserInfo}>
            <div className={styles.sidebarNameRow}>
              <strong>G-List Admin</strong>
            </div>
            <span>Console d&apos;administration</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.sidebarGroup}>
            <Link to="/" className={styles.sidebarItem} data-label="Accueil" onClick={() => setSidebarOpen(false)}>
              <Home size={18} className={styles.navIcon} aria-hidden="true" />
              <span className={styles.navLabel}>Accueil</span>
            </Link>
          </div>
          {ADMIN_SIDEBAR_SECTIONS.map(({ key, label }) => {
            const items = ADMIN_TABS.filter((t) => t.section === key);
            if (!items.length) return null;
            return (
              <div key={key} className={styles.sidebarGroup}>
                {label && <span className={styles.sidebarGroupLabel}>{label}</span>}
                {items.map((t) => {
                  const Icon = t.icon;
                  const badge = t.id === 'abonnements' && (pendingAbos > 0 || adminUnread > 0)
                    ? Math.max(pendingAbos, adminUnread)
                    : null;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`${styles.sidebarItem} ${adminTab === t.id ? styles.sidebarItemActive : ''}`}
                      data-label={t.label}
                      onClick={() => {
                        setAdminTab(t.id);
                        setSidebarOpen(false);
                        if (t.id === 'abonnements') {
                          markAllAdminNotificationsRead();
                          setAdminUnread(0);
                          refreshPendingAbos();
                        }
                      }}
                    >
                      <Icon size={18} className={styles.navIcon} aria-hidden="true" />
                      <span className={styles.navLabel}>{t.label}</span>
                      {badge != null && (
                        <span className={styles.sidebarBadge} aria-label={`${badge} notification(s)`}>{badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarPremium}>
          <Sparkles size={18} aria-hidden />
          <div>
            <strong>G-Bot Admin</strong>
            <p>Copilote IA — stats live et navigation rapide.</p>
          </div>
          <button type="button" onClick={() => setBotOpen(true)}>Ouvrir G-Bot</button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.mainHeader}>
          <div className={styles.mainHeaderLeft}>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setSidebarOpen(true)}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className={styles.mainTitle}>{activeTab.label}</h1>
              <p className={styles.mainSubtitle}>{ADMIN_TAB_SUBTITLES[adminTab] || ''}</p>
            </div>
          </div>
          <div className={styles.mainHeaderRight}>
            <GlistBotAdminTrigger onClick={() => setBotOpen((v) => !v)} active={botOpen} />
            <ThemeToggle className={styles.headerThemeToggle} />
            <button type="button" className={styles.headerActionBtn} onClick={loadData}>
              <RotateCw size={16} aria-hidden />
              <span>Actualiser</span>
            </button>
            <button type="button" className={styles.headerIconBtn} onClick={handleLogout} title="Se déconnecter">
              <LogOut size={18} aria-hidden />
            </button>
          </div>
        </header>

        <div className={styles.mainContent}>
        {ADMIN_DATE_TABS.has(adminTab) && (
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        )}

      {adminTab === 'overview' && (
        <AdminOverview
          evalStats={evalStats}
          dateRange={dateRange}
          onNavigateTab={(tab) => setAdminTab(tab)}
        />
      )}

      {adminTab === 'pros' && <AdminProfessionals />}
      {adminTab === 'users' && <AdminUsers dateRange={dateRange} />}
      {adminTab === 'abonnements' && <AdminAbonnements />}
      {adminTab === 'analytics' && <AdminAnalytics dateRange={dateRange} />}
      {adminTab === 'map' && <AdminMap />}
      {adminTab === 'opportunities' && <AdminOpportunities dateRange={dateRange} />}
      {adminTab === 'content' && <AdminContent />}
      {adminTab === 'moderation' && <AdminModeration dateRange={dateRange} />}
      {adminTab === 'notifications' && <AdminNotifications />}
      {adminTab === 'audit' && <AdminAuditLog dateRange={dateRange} />}
      {adminTab === 'ia' && <AdminIAInsights dateRange={dateRange} />}
      {adminTab === 'revenue' && <AdminRevenue dateRange={dateRange} />}
      {adminTab === 'reports' && <AdminReports dateRange={dateRange} />}
      {adminTab === 'plans' && <AdminSubscriptionPlans />}

      {adminTab === 'legacy' && (
        <AdminFeedback
          data={data}
          evalStats={evalStats}
          evaluations={filteredEvaluations}
          dateRange={dateRange}
          confirmReset={confirmReset}
          onExport={handleExport}
          onReset={handleReset}
        />
      )}
        </div>
      </div>

      <GlistBot
        mode="admin"
        open={botOpen}
        onOpenChange={setBotOpen}
        hideFab
        onAdminTab={(tabId) => {
          setAdminTab(tabId);
          setSidebarOpen(false);
        }}
        adminContext={{ dateRange }}
      />
    </div>
  );
}
