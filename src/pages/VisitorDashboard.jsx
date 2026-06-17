import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, Heart, History, Search, Sparkles, Send, Settings, LogOut, KeyRound, Bell, Download,
} from 'lucide-react';
import ProCard from '../components/ProCard';
import { getAllProfessionals, getProfessionalById } from '../api/professionals';
import {
  getVisitorAccount, createVisitorAccount, loginVisitorAccount, logoutVisitorAccount,
  getFavorites, toggleFavorite, getViewHistory, getSearchHistory, clearSearchHistory,
  getVisitorQuoteRequests, getVisitorSettings, saveVisitorSettings, setDarkMode, isDarkMode,
} from '../utils/storage';
import { getInitials } from '../utils/helpers';
import { getActiveBroadcastsForUser, dismissBroadcast } from '../utils/adminBroadcasts';
import { exportVisitorGdprData } from '../utils/platformEvents';
import NotificationInbox from '../components/NotificationInbox';
import SeoHead from '../components/SEO/SeoHead';
import styles from './VisitorDashboard.module.css';

const TABS = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'favorites', label: 'Favoris', icon: Heart },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'searches', label: 'Recherches', icon: Search },
  { id: 'recommendations', label: 'Recommandations', icon: Sparkles },
  { id: 'requests', label: 'Demandes', icon: Send },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

function getRecommendations(history) {
  const pros = getAllProfessionals();
  const cats = {};
  history.forEach((h) => { cats[h.categorie] = (cats[h.categorie] || 0) + 1; });
  const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!topCat) return pros.slice(0, 6);
  return pros.filter((p) => p.categorie === topCat).slice(0, 6);
}

export default function VisitorDashboard() {
  const [account, setAccount] = useState(() => getVisitorAccount());
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ prenom: '', nom: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('home');
  const [settings, setSettings] = useState(() => getVisitorSettings());
  const [adminMessages, setAdminMessages] = useState(() => getActiveBroadcastsForUser());

  if (!account) {
    const handleLogin = (e) => {
      e.preventDefault();
      const session = loginVisitorAccount(loginForm.email, loginForm.password);
      if (!session) { setAuthError('Email ou mot de passe incorrect.'); return; }
      setAccount(session);
    };
    const handleRegister = (e) => {
      e.preventDefault();
      try {
        const created = createVisitorAccount(registerForm);
        setAccount(created);
      } catch (err) {
        if (err.message === 'PASSWORD_TOO_SHORT') {
          setAuthError('Le mot de passe doit contenir au moins 6 caractères.');
        } else {
          setAuthError('Un compte existe déjà avec cet email.');
        }
      }
    };
    return (
      <>
        <SeoHead
          titre="Espace visiteur"
          description="Gérez vos favoris, votre historique et vos demandes de devis sur G-List."
          url="/dashboard/visiteur"
          noIndex
        />
      <div className={styles.authPage}>
        <div className={styles.authBox}>
          <h1>Espace visiteur</h1>
          <p>Connectez-vous pour gérer vos favoris et votre historique.</p>
          <div className={styles.authTabs}>
            <button type="button" className={authMode === 'login' ? styles.authTabActive : ''} onClick={() => setAuthMode('login')}>Connexion</button>
            <button type="button" className={authMode === 'register' ? styles.authTabActive : ''} onClick={() => setAuthMode('register')}>Créer un compte</button>
          </div>
          {authError && <p className={styles.authError}>{authError}</p>}
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className={styles.form}>
              <input type="email" placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required className={styles.input} />
              <input type="password" placeholder="Mot de passe" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required className={styles.input} />
              <button type="submit" className="btn-primary">Se connecter</button>
              <Link to="/mot-de-passe-oublie?type=visiteur" className={styles.forgotLink}>Mot de passe oublié ?</Link>
            </form>
          ) : (
            <form onSubmit={handleRegister} className={styles.form}>
              <input placeholder="Prénom" value={registerForm.prenom} onChange={(e) => setRegisterForm({ ...registerForm, prenom: e.target.value })} required className={styles.input} />
              <input placeholder="Nom" value={registerForm.nom} onChange={(e) => setRegisterForm({ ...registerForm, nom: e.target.value })} required className={styles.input} />
              <input type="email" placeholder="Email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required className={styles.input} />
              <input type="password" placeholder="Mot de passe (min. 6 caractères)" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required minLength={6} className={styles.input} />
              <button type="submit" className="btn-primary">Créer mon compte</button>
            </form>
          )}
          <Link to="/annuaire" className={styles.backLink}>← Retour à l&apos;annuaire</Link>
        </div>
      </div>
      </>
    );
  }

  const favorites = getFavorites().map(getProfessionalById).filter(Boolean);
  const history = getViewHistory().slice(0, 10);
  const searches = getSearchHistory().slice(0, 5);
  const requests = getVisitorQuoteRequests();
  const recommendations = getRecommendations(getViewHistory());

  const handleLogout = () => {
    logoutVisitorAccount();
    setAccount(null);
  };

  const handleSetting = (key, val) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveVisitorSettings(next);
    if (key === 'darkMode') setDarkMode(val);
  };

  const statusLabel = { pending: 'En attente', viewed: 'Vu', replied: 'Répondu' };

  return (
    <>
      <SeoHead
        titre="Espace visiteur"
        description="Gérez vos favoris, votre historique et vos demandes de devis sur G-List."
        url="/dashboard/visiteur"
        noIndex
      />
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.avatar}>{getInitials(`${account.prenom} ${account.nom}`)}</div>
        <div>
          <h1>{account.prenom} {account.nom}</h1>
          <p className={styles.email}>{account.email}</p>
          <p className={styles.sub}>Aucun contenu public associé à ce compte</p>
        </div>
      </header>

      <nav className={styles.tabs}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`} onClick={() => setTab(id)}>
            <Icon size={16} /><span>{label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {tab === 'home' && (
          <>
            {adminMessages.length > 0 && (
              <div className={styles.adminMessages}>
                {adminMessages.map((b) => (
                  <div key={b.id} className={`${styles.adminMessage} ${styles[`adminMessage${b.type}`] || ''}`}>
                    <Bell size={16} aria-hidden="true" />
                    <div>
                      <strong>{b.title}</strong>
                      <p>{b.message}</p>
                    </div>
                    {b.dismissible !== false && (
                      <button type="button" onClick={() => { dismissBroadcast(b.id); setAdminMessages(getActiveBroadcastsForUser()); }} aria-label="Masquer">×</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className={styles.summary}>
              <div className={styles.summaryCard}><strong>{favorites.length}</strong> favoris</div>
              <div className={styles.summaryCard}><strong>{history.length}</strong> consultés</div>
              <div className={styles.summaryCard}><strong>{searches.length}</strong> recherches</div>
            </div>
            <h2>Derniers profils consultés</h2>
            <div className={styles.compactGrid}>
              {history.slice(0, 3).map((h) => {
                const pro = getProfessionalById(h.id);
                return pro ? <ProCard key={h.id} pro={pro} compact /> : null;
              })}
            </div>
            <h2>Recommandations</h2>
            <div className={styles.compactGrid}>
              {recommendations.slice(0, 3).map((p) => <ProCard key={p.id} pro={p} compact />)}
            </div>
          </>
        )}

        {tab === 'favorites' && (
          favorites.length ? (
            <div className={styles.grid}>{favorites.map((p) => (
              <div key={p.id} className={styles.favWrap}>
                <ProCard pro={p} />
                <button type="button" className={styles.removeFav} onClick={() => toggleFavorite(p.id)}>Retirer</button>
              </div>
            ))}</div>
          ) : (
            <p className={styles.empty}>Aucun favori. <Link to="/annuaire">Parcourir l&apos;annuaire</Link></p>
          )
        )}

        {tab === 'history' && (
          <ul className={styles.historyList}>
            {history.map((h) => (
              <li key={`${h.id}-${h.viewedAt}`}>
                <div><strong>{h.nom}</strong><span>{h.categorie}</span></div>
                <span className={styles.date}>{new Date(h.viewedAt).toLocaleString('fr-FR')}</span>
                <Link to={`/profil/${h.id}`} className={styles.reviewBtn}>Revoir</Link>
              </li>
            ))}
          </ul>
        )}

        {tab === 'searches' && (
          <>
            <ul className={styles.searchList}>
              {searches.map((q) => (
                <li key={q}>
                  <span>{q}</span>
                  <Link to={`/annuaire?search=${encodeURIComponent(q)}`} className={styles.relaunchBtn}>Relancer</Link>
                </li>
              ))}
            </ul>
            {searches.length > 0 && (
              <button type="button" className={styles.clearBtn} onClick={() => { clearSearchHistory(); setTab('searches'); }}>Effacer l&apos;historique</button>
            )}
          </>
        )}

        {tab === 'recommendations' && (
          <>
            <h2>Basé sur vos consultations</h2>
            <div className={styles.grid}>{recommendations.map((p) => <ProCard key={p.id} pro={p} />)}</div>
          </>
        )}

        {tab === 'requests' && (
          <ul className={styles.requestList}>
            {requests.length ? requests.map((r) => {
              const pro = getProfessionalById(r.proId);
              return (
                <li key={r.id}>
                  <strong>{pro?.nom || 'Pro'}</strong>
                  <span>{r.service}</span>
                  <span className={styles.status}>{statusLabel[r.status] || r.status}</span>
                  <span className={styles.date}>{new Date(r.date).toLocaleDateString('fr-FR')}</span>
                </li>
              );
            }) : <p className={styles.empty}>Aucune demande de devis envoyée.</p>}
          </ul>
        )}

        {tab === 'notifications' && (
          <NotificationInbox onUpdate={() => setTab('notifications')} />
        )}

        {tab === 'settings' && (
          <div className={styles.settings}>
            <label className={styles.toggle}><span>Mode sombre</span><input type="checkbox" checked={settings.darkMode || isDarkMode()} onChange={(e) => handleSetting('darkMode', e.target.checked)} /></label>
            <label className={styles.toggle}><span>Notifications email</span><input type="checkbox" checked={settings.notifications} onChange={(e) => handleSetting('notifications', e.target.checked)} /></label>
            <div className={styles.settingRow}><span>Langue</span><span>Français</span></div>
            <section className={styles.security}>
              <h3>Sécurité & RGPD</h3>
              <Link to="/mot-de-passe-oublie?type=visiteur" className={styles.simBtn}>Changer mot de passe</Link>
              <button type="button" className={styles.simBtn} onClick={handleLogout}>Déconnexion de cet appareil</button>
              <button
                type="button"
                className={styles.exportBtn}
                onClick={() => {
                  const data = exportVisitorGdprData(account.email, account);
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `glist-visiteur-export.json`;
                  a.click();
                }}
              >
                <Download size={16} /> Exporter mes données (RGPD)
              </button>
            </section>
            <button type="button" className={styles.logoutBtn} onClick={handleLogout}><LogOut size={18} /> Se déconnecter</button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
