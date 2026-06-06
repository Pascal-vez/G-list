import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import bcrypt from 'bcryptjs';
import {
  Shield, Lock, Eye, EyeOff,
  RotateCw, Download, Trash2, LogOut,
  Star, ThumbsUp, ThumbsDown, MessageSquare,
  Users, Lightbulb, BarChart2, CheckCircle, HelpCircle, XCircle,
  ClipboardList, UserPlus,
} from 'lucide-react';
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
import styles from './Admin.module.css';

/** Bcrypt hash from .env — quotes required in .env so $ chars are not stripped */
function getAdminHash() {
  const raw = import.meta.env.VITE_ADMIN_HASH;
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().replace(/^["']|["']$/g, '');
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

function renderStars(note) {
  return '★'.repeat(note) + '☆'.repeat(5 - note);
}

function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    document.body.style.overflow = 'hidden';
    document.body.style.background = '#060e18';
    const id = setInterval(tick, 1000);
    return () => {
      clearInterval(id);
      document.body.style.overflow = '';
      document.body.style.background = '';
    };
  }, [tick]);

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

    if (!getAdminHash()) {
      setError('Configuration manquante. Contactez l\'administrateur.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const match = await bcrypt.compare(password.trim(), getAdminHash());

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
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin(e);
                }}
                className={styles.passwordInput}
                placeholder="Mot de passe administrateur"
                autoComplete="current-password"
                disabled={loading || isBlocked}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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

  const evalStats = useMemo(() => buildEvaluationStats(evaluations), [evaluations]);

  const loadData = useCallback(() => {
    setEvaluations(getEvaluations());
    setData({
      thumbsUp: getItem(KEYS.FEEDBACK_THUMBS_UP, 0),
      thumbsDown: getItem(KEYS.FEEDBACK_THUMBS_DOWN, 0),
      suggestions: getItem(KEYS.SUGGESTIONS, []),
      profileReviews: getTotalProfileReviews(),
      engagementFound: getItem(KEYS.ENGAGEMENT_FOUND, 0),
      engagementSearching: getItem(KEYS.ENGAGEMENT_SEARCHING, 0),
      engagementTesting: getItem(KEYS.ENGAGEMENT_TESTING, 0),
      waitlist: getItem(KEYS.WAITLIST, []),
    });
  }, []);

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

  const totalEngagement = (data?.engagementFound ?? 0) + (data?.engagementSearching ?? 0) + (data?.engagementTesting ?? 0);
  const engPct = (n) => totalEngagement ? Math.round((n / totalEngagement) * 100) : 0;

  return (
    <div className={styles.page}>
      {/* Dashboard header */}
      <div className={styles.dashTopBar}>
        <div className={styles.dashTopBarLeft}>
          <Shield size={20} className={styles.dashLogo} />
          <span className={styles.dashTitle}>G-List Admin</span>
          <span className={styles.dashBadge}>Dashboard</span>
        </div>
        <div className={styles.dashTopBarRight}>
          <button type="button" onClick={loadData} className={styles.refreshBtn}>
            <RotateCw size={14} /> Actualiser
          </button>
          <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={14} /> Se déconnecter
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#FEF9C3', color: '#CA8A04' }}><Star size={18} /></div>
          <div>
            <div className={styles.kpiValue}>{evalStats.avgNote}<span className={styles.kpiSub}>/5</span></div>
            <div className={styles.kpiLabel}>Note moyenne</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#DCFCE7', color: '#16A34A' }}><ThumbsUp size={18} /></div>
          <div>
            <div className={styles.kpiValue}>{data?.thumbsUp ?? 0}</div>
            <div className={styles.kpiLabel}>Votes positifs</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}><ThumbsDown size={18} /></div>
          <div>
            <div className={styles.kpiValue}>{data?.thumbsDown ?? 0}</div>
            <div className={styles.kpiLabel}>Votes négatifs</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#EDE9FE', color: '#7C3AED' }}><MessageSquare size={18} /></div>
          <div>
            <div className={styles.kpiValue}>{data?.profileReviews ?? 0}</div>
            <div className={styles.kpiLabel}>Avis sur profils</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#DBEAFE', color: '#2563EB' }}><UserPlus size={18} /></div>
          <div>
            <div className={styles.kpiValue}>{data?.waitlist?.length ?? 0}</div>
            <div className={styles.kpiLabel}>Inscrits liste d'attente</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#FFF7ED', color: '#EA580C' }}><Lightbulb size={18} /></div>
          <div>
            <div className={styles.kpiValue}>{data?.suggestions?.length ?? 0}</div>
            <div className={styles.kpiLabel}>Suggestions reçues</div>
          </div>
        </div>
      </div>

      {/* Engagement utilisateurs */}
      <section className={styles.card}>
        <h2><BarChart2 size={18} className={styles.sectionIcon} /> Engagement utilisateurs</h2>
        <div className={styles.engagementRows}>
          {[
            { label: 'J\'ai trouvé ce que je cherche', value: data?.engagementFound ?? 0, icon: <CheckCircle size={15} />, color: '#16A34A' },
            { label: 'Je cherche encore', value: data?.engagementSearching ?? 0, icon: <HelpCircle size={15} />, color: '#D97706' },
            { label: 'Je teste juste la plateforme', value: data?.engagementTesting ?? 0, icon: <XCircle size={15} />, color: '#6B7280' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className={styles.engRow}>
              <div className={styles.engRowHead}>
                <span style={{ color }} className={styles.engIcon}>{icon}</span>
                <span className={styles.engLabel}>{label}</span>
                <span className={styles.engCount}>{value}</span>
                <span className={styles.engPct}>{engPct(value)}%</span>
              </div>
              <div className={styles.engBarTrack}>
                <div className={styles.engBarFill} style={{ width: `${engPct(value)}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Évaluations */}
      <section className={styles.card}>
        <h2><ClipboardList size={18} className={styles.sectionIcon} /> Évaluations reçues</h2>
        <div className={styles.evalMetrics}>
          <div className={styles.evalMetric}>
            <span className={styles.evalMetricLabel}>Total évaluations</span>
            <strong className={styles.evalMetricValue}>{evalStats.total}</strong>
          </div>
          <div className={styles.evalMetric}>
            <span className={styles.evalMetricLabel}>Oui, absolument</span>
            <strong className={styles.evalMetricValue}>{evalStats.pctOui}%</strong>
          </div>
          <div className={styles.evalMetric}>
            <span className={styles.evalMetricLabel}>Peut-être</span>
            <strong className={styles.evalMetricValue}>{evalStats.pctPeutEtre}%</strong>
          </div>
          <div className={styles.evalMetric}>
            <span className={styles.evalMetricLabel}>Avec commentaires</span>
            <strong className={styles.evalMetricValue}>{evalStats.withComments}</strong>
          </div>
        </div>

        {evaluations.length > 0 ? (
          <div className={styles.evalList}>
            {[...evaluations].reverse().map((entry, index) => (
              <div key={`${entry.date}-${index}`} className={styles.evalRow}>
                <div className={styles.evalRowHead}>
                  <span className={styles.evalStars}>{renderStars(entry.note)}</span>
                  <span className={styles.evalUtile}>{entry.utile}</span>
                  <span className={styles.evalDate}>
                    {new Date(entry.date).toLocaleString('fr-FR')}
                  </span>
                </div>
                {entry.plusPlu?.trim() && (
                  <p className={styles.evalExcerpt}>
                    <strong>Plu :</strong> {entry.plusPlu}
                  </p>
                )}
                {entry.ameliorer?.trim() && (
                  <p className={styles.evalExcerpt}>
                    <strong>À améliorer :</strong> {entry.ameliorer}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Aucune évaluation pour le moment.</p>
        )}
      </section>

      {/* Liste d'attente */}
      <section className={styles.card}>
        <h2>
          <Users size={18} className={styles.sectionIcon} />
          Inscriptions liste d&apos;attente
          <span className={styles.sectionCount}>{data?.waitlist?.length ?? 0}</span>
        </h2>
        {data?.waitlist?.length > 0 ? (
          <div className={styles.table}>
            <div className={`${styles.tableRow} ${styles.tableHeader}`}>
              <span>Nom</span>
              <span>Profession</span>
              <span>Région</span>
              <span>WhatsApp</span>
            </div>
            {data.waitlist.map((entry, i) => (
              <div key={i} className={styles.tableRow}>
                <span className={styles.tableName}>{entry.nom}</span>
                <span>{entry.profession}</span>
                <span>{entry.region}</span>
                <span>{entry.whatsapp}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Aucune inscription pour le moment.</p>
        )}
      </section>

      {/* Suggestions */}
      <section className={styles.card}>
        <h2><Lightbulb size={18} className={styles.sectionIcon} /> Suggestions</h2>
        {data?.suggestions?.length > 0 ? (
          <ul className={styles.suggestionList}>
            {data.suggestions.map((s, i) => (
              <li key={i}>
                <p>{s.text}</p>
                <span>{new Date(s.timestamp).toLocaleString('fr-FR')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Aucune suggestion pour le moment.</p>
        )}
      </section>

      {/* Actions */}
      <div className={styles.actions}>
        <button type="button" onClick={handleExport} className={styles.exportBtn}>
          <Download size={16} /> Exporter en JSON
        </button>
        <button
          type="button"
          onClick={handleReset}
          className={`${styles.resetBtn} ${confirmReset ? styles.confirmReset : ''}`}
        >
          <Trash2 size={16} />
          {confirmReset ? 'Confirmer la réinitialisation ?' : 'Réinitialiser les données'}
        </button>
      </div>
    </div>
  );
}
