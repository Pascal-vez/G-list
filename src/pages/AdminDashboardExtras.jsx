import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, ThumbsUp, ThumbsDown, MessageSquare, Lightbulb,
  CheckCircle, HelpCircle, XCircle, Download, Trash2, Search,
  Send, Power, PowerOff, ScrollText,
} from 'lucide-react';
import { REGIONS, CATEGORIES } from '../data/constants';
import {
  getAllProAccountsList, getAllVisitorAccounts, getReports,
  adminVerifyProfessional, adminDisableProfessional, adminFlagDuplicate,
  adminHideProfessional, adminMergeDuplicate, updateReportStatus,
  adminSetProfessionalPlan,
  getWaitlistEntries, getContactMessages,
  getSubscriptionPlans, saveSubscriptionPlans, getPlanMonthlyPrice,
} from '../utils/storage';
import {
  BROADCAST_TYPES, BROADCAST_AUDIENCES,
  getAdminBroadcasts, adminCreateBroadcast, adminToggleBroadcast, adminDeleteBroadcast,
  estimateBroadcastRecipients, getBroadcastTypeLabel, getBroadcastAudienceLabel,
} from '../utils/adminBroadcasts';
import { getAuditLog, getAuditActionLabel } from '../utils/auditLog';
import { SAAS_PLATFORM_LEVEL, PLATFORM_MILESTONES, getPlatformLevelLabel } from '../utils/saasLevel100';
import {
  getPlatformKPIs, getActivitySeries, getTopCategories, getTopRegions,
  getRegionDensity, getOpportunityGaps, getRevenueStats, generateContentPreview,
  getIAInsights, getProsWithAdminState, findDuplicateGroups,
} from '../utils/adminAnalytics';
import { filterByDateRange, formatPeriodLabel } from '../utils/dateRange';
import BarChart from '../components/dashboard/BarChart';
import MetricCard from '../components/dashboard/MetricCard';
import GuineaMap from '../components/hero/GuineaMap';
import AdminReportGenerator from '../components/admin/AdminReportGenerator';
import styles from './AdminDashboardExtras.module.css';

function formatGNF(n) {
  return new Intl.NumberFormat('fr-GN').format(n);
}

function AdminPageHeader({ title, subtitle, children }) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className={styles.pageHeaderActions}>{children}</div>}
    </header>
  );
}

function AdminCard({ title, subtitle, children, className }) {
  return (
    <section className={`${styles.card} ${className || ''}`}>
      {(title || subtitle) && (
        <div className={styles.cardHead}>
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

function useToast() {
  const [message, setMessage] = useState('');
  const show = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2800);
  };
  const Toast = message ? (
    <div className={styles.toast} role="status">{message}</div>
  ) : null;
  return { show, Toast };
}

function StatusBadge({ status }) {
  const map = {
    vérifié: styles.badgeVerified,
    actif: styles.badgeActive,
    désactivé: styles.badgeDisabled,
    doublon: styles.badgeWarn,
    masqué: styles.badgeMuted,
  };
  return <span className={`${styles.badge} ${map[status] || styles.badgeActive}`}>{status}</span>;
}

export function AdminOverview({ evalStats, dateRange }) {
  const kpis = useMemo(() => getPlatformKPIs(dateRange), [dateRange]);
  const activity = useMemo(() => getActivitySeries(dateRange), [dateRange]);
  const topCats = useMemo(() => getTopCategories(5, dateRange), [dateRange]);
  const periodLabel = formatPeriodLabel(dateRange.startDate, dateRange.endDate);

  return (
    <div className={styles.section}>
      <AdminPageHeader
        title="Vue d'ensemble"
        subtitle={`Indicateurs clés — ${periodLabel}`}
      />
      <div className={styles.kpiGrid}>
        <MetricCard value={kpis.totalPros} label="Professionnels actifs" accent="#F5C518" />
        <MetricCard value={kpis.verified} label="Profils vérifiés" accent="#5C9EFF" />
        <MetricCard value={kpis.totalUsers} label="Comptes inscrits" accent="#AB47BC" />
        <MetricCard value={kpis.totalViews} label="Vues annuaire" accent="#4CAF50" />
        <MetricCard value={kpis.totalSearches} label="Recherches" accent="#FF9800" />
        <MetricCard value={kpis.whatsappClicks} label="Clics WhatsApp est." accent="#25D366" />
        <MetricCard value={kpis.waitlistCount} label="Liste d'attente" accent="#F5C518" />
        <MetricCard value={`+${kpis.growthPct}%`} label="Croissance" accent="#D4A800" trend={kpis.growthPct} />
      </div>

      <div className={styles.splitGrid}>
        <div className={styles.panel}>
          <h3>Activité — période sélectionnée</h3>
          <BarChart data={activity} height={140} />
        </div>
        <div className={styles.panel}>
          <h3>Top catégories</h3>
          <BarChart data={topCats} color="#D4A800" height={140} />
        </div>
      </div>

      <div className={styles.miniStats}>
        <span className={styles.miniStat}>{evalStats.total} évaluations plateforme</span>
        <span className={styles.miniStat}>{kpis.pendingReports} signalements en attente</span>
        <span className={styles.miniStat}>{kpis.premium} premium · {kpis.advanced} advanced</span>
        <span className={styles.saasLevelBadge}>SaaS Niveau {SAAS_PLATFORM_LEVEL} — {getPlatformLevelLabel()}</span>
      </div>
    </div>
  );
}

const PLAN_LABELS = { free: 'Free', advanced: 'Advanced', premium: 'Premium' };

function matchesProSearch(pro, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    pro.nom,
    pro.profession,
    pro.categorie,
    pro.region,
    pro.quartier,
    pro.email,
    pro.telephone,
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(q);
}

export function AdminProfessionals() {
  const { show, Toast } = useToast();
  const [filter, setFilter] = useState({ plan: 'all', region: 'all', status: 'all' });
  const [search, setSearch] = useState('');
  const [, setRefresh] = useState(0);
  const pros = getProsWithAdminState();

  const filtered = useMemo(() => {
    let list = pros.filter((p) => {
      if (filter.plan !== 'all' && (p.plan || 'free') !== filter.plan) return false;
      if (filter.region !== 'all' && p.region !== filter.region) return false;
      if (filter.status !== 'all' && p.adminStatus !== filter.status) return false;
      return !p.hidden;
    });
    if (search.trim()) {
      list = list.filter((p) => matchesProSearch(p, search));
    } else {
      list = list.slice(0, 80);
    }
    return list;
  }, [pros, filter, search]);

  const act = (label, fn) => {
    fn();
    setRefresh((n) => n + 1);
    show(label);
  };

  const handlePlanChange = (pro, plan) => {
    if (plan === (pro.plan || 'free')) return;
    act(`Plan ${pro.nom} → ${PLAN_LABELS[plan]}`, () => adminSetProfessionalPlan(pro.id, plan));
  };

  return (
    <div className={styles.section}>
      {Toast}
      <AdminPageHeader
        title="Professionnels"
        subtitle="Gérez les fiches, plans et statuts de vérification."
      />
      <div className={styles.filters}>
        <select value={filter.plan} onChange={(e) => setFilter({ ...filter, plan: e.target.value })}>
          <option value="all">Tous plans</option>
          <option value="free">Free</option>
          <option value="advanced">Advanced</option>
          <option value="premium">Premium</option>
        </select>
        <select value={filter.region} onChange={(e) => setFilter({ ...filter, region: e.target.value })}>
          <option value="all">Toutes les villes</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="all">Tous statuts</option>
          <option value="vérifié">Vérifié</option>
          <option value="actif">Actif</option>
          <option value="désactivé">Désactivé</option>
          <option value="doublon">Doublon</option>
        </select>
        <label className={styles.searchWrap}>
          <Search size={16} aria-hidden />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Rechercher un nom, métier, ville…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher un professionnel"
          />
        </label>
        <span className={styles.filterCount}>{filtered.length} résultat(s)</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom</th><th>Catégorie</th><th>Villes</th><th>Plan</th>
              <th>Note</th><th>Vues</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyRow}>
                  Aucun professionnel ne correspond à votre recherche.
                </td>
              </tr>
            ) : filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/profil/${p.id}`} className={styles.proNameLink}>
                    {p.nom}
                  </Link>
                </td>
                <td>{p.categorie}</td>
                <td>{p.region}</td>
                <td>
                  <select
                    className={`${styles.planSelect} ${styles[`planSelect${(p.plan || 'free').charAt(0).toUpperCase() + (p.plan || 'free').slice(1)}`]}`}
                    value={p.plan || 'free'}
                    onChange={(e) => handlePlanChange(p, e.target.value)}
                    aria-label={`Plan de ${p.nom}`}
                  >
                    <option value="free">Free</option>
                    <option value="advanced">Advanced</option>
                    <option value="premium">Premium</option>
                  </select>
                </td>
                <td>{p.note} ★</td>
                <td>{p.vues || 0}</td>
                <td><StatusBadge status={p.adminStatus} /></td>
                <td className={styles.actions}>
                  <button type="button" onClick={() => act(`${p.nom} vérifié`, () => adminVerifyProfessional(p.id))}>Vérifier</button>
                  <button type="button" onClick={() => act('Doublon signalé', () => adminFlagDuplicate(p.id))}>Doublon</button>
                  <button type="button" onClick={() => act(`${p.nom} désactivé`, () => adminDisableProfessional(p.id))}>Désactiver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminUsers({ dateRange }) {
  const { show, Toast } = useToast();
  const [roles, setRoles] = useState({});
  const visitors = getAllVisitorAccounts();
  const pros = getAllProAccountsList();
  const users = [
    ...visitors.map((v) => ({ ...v, role: roles[v.email] || 'visiteur', name: `${v.prenom} ${v.nom}` })),
    ...pros.map((p) => ({ ...p, role: roles[p.email] || 'pro', name: p.nom })),
  ].filter((u) => {
    if (!u.createdAt) return false;
    return filterByDateRange([u], dateRange.startDate, dateRange.endDate, 'createdAt').length > 0;
  });

  const toggleRole = (email, current) => {
    const next = current === 'pro' ? 'visiteur' : 'pro';
    setRoles((r) => ({ ...r, [email]: next }));
    show(`Rôle mis à jour : ${next}`);
  };

  return (
    <div className={styles.section}>
      {Toast}
      <AdminPageHeader
        title="Utilisateurs"
        subtitle={`Inscriptions sur la période — ${formatPeriodLabel(dateRange.startDate, dateRange.endDate)}`}
      />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscription</th><th>Actions</th></tr></thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} className={styles.empty}>Aucun compte inscrit sur cette période.</td></tr>
            ) : users.map((u) => (
              <tr key={u.email}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={styles.planTag}>{u.role}</span></td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                <td>
                  <button type="button" onClick={() => toggleRole(u.email, u.role)}>
                    Passer {u.role === 'pro' ? 'visiteur' : 'pro'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminAnalytics({ dateRange }) {
  const topCats = useMemo(() => getTopCategories(5, dateRange), [dateRange]);
  const topRegions = useMemo(() => getTopRegions(5), []);
  const kpis = useMemo(() => getPlatformKPIs(dateRange), [dateRange]);

  return (
    <div className={styles.section}>
      <AdminPageHeader
        title="Analytics"
        subtitle={`Répartition et tendances — ${formatPeriodLabel(dateRange.startDate, dateRange.endDate)}`}
      />
      <div className={styles.splitGrid}>
        <div className={styles.panel}>
          <h3>Top catégories</h3>
          <BarChart data={topCats} height={140} />
        </div>
        <div className={styles.panel}>
          <h3>Top villes</h3>
          <BarChart data={topRegions} color="#D4A800" height={140} />
        </div>
      </div>
      <AdminCard title="Tendances cette semaine" subtitle="Synthèse des signaux de trafic">
        <ul className={styles.trendList}>
        <li>Recherches totales : {kpis.totalSearches} (+{Math.min(24, kpis.growthPct + 6)}%)</li>
        <li>{topCats[0] ? `${topCats[0].label} en tête avec ${topCats[0].value} entrées` : '—'}</li>
        <li>{topRegions[0] ? `${topRegions[0].label} — ville la plus active` : '—'}</li>
        <li>{kpis.whatsappClicks} contacts WhatsApp estimés</li>
        </ul>
      </AdminCard>
    </div>
  );
}

export function AdminMap() {
  const regionDensity = useMemo(() => getRegionDensity(), []);
  const max = Math.max(...Object.values(regionDensity), 1);

  return (
    <div className={styles.section}>
      <AdminPageHeader
        title="Carte Guinée"
        subtitle="Densité des professionnels par ville et région."
      />
      <div className={styles.mapCard}>
        <div>
          <div className={styles.mapWrap}><GuineaMap /></div>
          <div className={styles.legend}>
            <span className={styles.legendHigh}>Dense ({'>'}{Math.round(max * 0.7)})</span>
            <span className={styles.legendMed}>Moyen</span>
            <span className={styles.legendLow}>Faible</span>
          </div>
        </div>
        <div className={styles.regionStats}>
        {REGIONS.map((r) => (
          <div key={r} className={styles.regionStat}>
            <strong>{r}</strong>
            <span>{regionDensity[r]} pros</span>
            <div className={styles.regionBar} style={{ width: `${(regionDensity[r] / max) * 100}%` }} />
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export function AdminOpportunities({ dateRange }) {
  const { show, Toast } = useToast();
  const opps = useMemo(() => getOpportunityGaps(10, dateRange), [dateRange]);

  return (
    <div className={styles.section}>
      {Toast}
      <AdminPageHeader
        title="Opportunités"
        subtitle="Zones à fort potentiel — peu de pros pour une demande estimée élevée."
      />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Catégorie</th><th>Villes</th><th>Recherches est.</th><th>Pros</th><th>Priorité</th><th>Action</th></tr></thead>
          <tbody>
            {opps.map((o) => (
              <tr key={`${o.cat}-${o.region}`}>
                <td>{o.cat}</td>
                <td>{o.region}</td>
                <td>{o.searches}</td>
                <td>{o.pros}</td>
                <td><span className={o.score > 15 ? styles.badgeWarn : styles.badgeActive}>{o.score > 15 ? 'Haute' : 'Moyenne'}</span></td>
                <td>
                  <button type="button" onClick={() => show(`Invitation campagne — ${o.cat} à ${o.region}`)}>
                    Inviter des pros
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminContent() {
  const [preview, setPreview] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = (type) => setPreview(generateContentPreview(type));

  const copyPreview = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className={styles.section}>
      <AdminPageHeader
        title="Contenu"
        subtitle="Générez des classements et planifiez vos publications réseaux."
      />
      <AdminCard title="Générateur de contenu" subtitle="Textes prêts à publier">
        <div className={styles.genBtns}>
          <button type="button" onClick={() => generate('medecins')}>Top 5 médecins Conakry</button>
          <button type="button" onClick={() => generate('restaurants')}>Top restaurants</button>
          <button type="button" onClick={() => generate('regional')}>Classement par villes</button>
        </div>
        {preview && (
          <div style={{ marginTop: 16 }}>
            <pre className={styles.preview}>{preview}</pre>
            <button type="button" className={styles.copyBtn} onClick={copyPreview} style={{ marginTop: 12 }}>
              {copied ? 'Copié !' : 'Copier le texte'}
            </button>
          </div>
        )}
      </AdminCard>
      <AdminCard title="Planning publications" subtitle="Semaine type — réseaux sociaux">
        <div className={styles.calendar}>
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, i) => (
          <div key={d} className={styles.calDay}>
            <span>{d} {12 + i}</span>
            <small>{i % 2 === 0 ? 'Post réseaux' : 'Story'}</small>
          </div>
        ))}
        </div>
      </AdminCard>
    </div>
  );
}

export function AdminModeration({ dateRange }) {
  const { show, Toast } = useToast();
  const [reports, setReports] = useState(() => getReports());
  const [, setRefresh] = useState(0);
  const suspects = getProsWithAdminState()
    .filter((p) => !p.verifie && !p.hidden && p.nombreAvis === 0)
    .slice(0, 8);
  const duplicateGroups = findDuplicateGroups();

  const resolve = (id, status) => {
    setReports(updateReportStatus(id, status));
    show(status === 'resolved' ? 'Signalement traité' : 'Signalement rejeté');
  };

  const periodReports = filterByDateRange(reports, dateRange.startDate, dateRange.endDate, 'date');
  const pending = periodReports.filter((r) => r.status === 'pending');

  return (
    <div className={styles.section}>
      {Toast}
      <AdminPageHeader
        title="Modération"
        subtitle={`Signalements du ${formatPeriodLabel(dateRange.startDate, dateRange.endDate)}`}
      />
      <div className={styles.modGrid}>
        <div className={styles.panel}>
          <h3>Profils signalés ({pending.length})</h3>
          {pending.length === 0 ? (
            <p className={styles.empty}>Aucun signalement en attente.</p>
          ) : (
            <ul className={styles.modList}>
              {pending.map((r) => (
                <li key={r.id} className={styles.modCard}>
                  <div>
                    <strong>{r.proNom}</strong>
                    <p>{r.reason}{r.details ? ` — ${r.details}` : ''}</p>
                    <small>{new Date(r.date).toLocaleDateString('fr-FR')}</small>
                  </div>
                  <div className={styles.modActions}>
                    <button type="button" onClick={() => resolve(r.id, 'resolved')}>Traiter</button>
                    <button type="button" className={styles.btnMuted} onClick={() => resolve(r.id, 'rejected')}>Rejeter</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.panel}>
          <h3>Profils suspects ({suspects.length})</h3>
          <ul className={styles.modList}>
            {suspects.map((p) => (
              <li key={p.id} className={styles.modCard}>
                <span>{p.nom} — {p.region}</span>
                <button type="button" onClick={() => { adminHideProfessional(p.id); setRefresh((n) => n + 1); show(`${p.nom} masqué`); }}>
                  Masquer
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AdminCard title={`Doublons détectés (${duplicateGroups.length})`} subtitle="Fusionnez les entrées en double">
        {duplicateGroups.length === 0 ? (
          <p className={styles.empty}>Aucun doublon détecté.</p>
        ) : (
          <ul className={styles.modList}>
            {duplicateGroups.map((group) => (
              <li key={group[0].id} className={styles.modCard}>
                <div>
                  <strong>{group[0].nom}</strong> — {group[0].region}
                  <p>{group.length} entrées · IDs {group.map((p) => p.id).join(', ')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    adminMergeDuplicate(group[0].id, group[1].id);
                    setRefresh((n) => n + 1);
                    show('Doublons fusionnés');
                  }}
                >
                  Fusionner
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}

export function AdminIAInsights({ dateRange }) {
  const { trends, recommendations, alerts } = useMemo(() => getIAInsights(dateRange), [dateRange]);
  const kpis = useMemo(() => getPlatformKPIs(dateRange), [dateRange]);
  const waitlist = kpis.waitlistCount;
  const contacts = filterByDateRange(getContactMessages(), dateRange.startDate, dateRange.endDate, 'date').length;

  return (
    <div className={styles.section}>
      <AdminPageHeader
        title="IA Insights"
        subtitle="Tendances automatiques, recommandations et alertes plateforme."
      />
      <div className={styles.kpiGrid}>
        <MetricCard value={waitlist} label="Liste d'attente" accent="#F5C518" />
        <MetricCard value={contacts} label="Messages contact" accent="#5C9EFF" />
        <MetricCard value={recommendations.length} label="Recommandations IA" accent="#AB47BC" />
      </div>
      <div className={styles.insightGrid}>
        <div className={styles.panel}>
          <h3>Tendances</h3>
          <ul className={styles.insightList}>{trends.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <div className={styles.panel}>
          <h3>Recommandations</h3>
          <ul className={styles.insightList}>{recommendations.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <div className={styles.panel}>
          <h3>Alertes</h3>
          <ul className={styles.insightList}>{alerts.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

export function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState(() => getSubscriptionPlans());
  const [saved, setSaved] = useState(false);
  const paidIds = ['advanced', 'premium'];

  const updatePlan = (id, field, value) => {
    setPlans((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const updateFeatures = (id, text) => {
    const features = text.split('\n').map((line) => line.trim()).filter(Boolean);
    updatePlan(id, 'features', features);
  };

  const handleSave = () => {
    saveSubscriptionPlans({
      advanced: plans.advanced,
      premium: plans.premium,
    });
    setPlans(getSubscriptionPlans());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={styles.section}>
      <AdminPageHeader
        title="Offres d'abonnement"
        subtitle="Modifiez les prix et descriptions affichés aux professionnels."
      >
        {saved && <span className={styles.savedBadge}>Enregistré</span>}
      </AdminPageHeader>

      <div className={styles.planAdminGrid}>
        {paidIds.map((id) => {
          const plan = plans[id];
          return (
            <article key={id} className={styles.planAdminCard}>
              <h3>{plan.name}</h3>
              <label className={styles.planAdminField}>
                <span>Prix mensuel (GNF)</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={plan.priceMonthly}
                  onChange={(e) => updatePlan(id, 'priceMonthly', Number(e.target.value) || 0)}
                />
              </label>
              <label className={styles.planAdminField}>
                <span>Accroche</span>
                <input
                  type="text"
                  value={plan.tagline}
                  onChange={(e) => updatePlan(id, 'tagline', e.target.value)}
                />
              </label>
              <label className={styles.planAdminField}>
                <span>Description</span>
                <textarea
                  rows={3}
                  value={plan.description}
                  onChange={(e) => updatePlan(id, 'description', e.target.value)}
                />
              </label>
              <label className={styles.planAdminField}>
                <span>Fonctionnalités (une par ligne)</span>
                <textarea
                  rows={6}
                  value={(plan.features || []).join('\n')}
                  onChange={(e) => updateFeatures(id, e.target.value)}
                />
              </label>
              <p className={styles.planAdminHint}>
                Annuel : {formatGNF(plan.priceMonthly * 10)} GNF (2 mois offerts)
              </p>
            </article>
          );
        })}
      </div>

      <button type="button" className={styles.planAdminSave} onClick={handleSave}>
        Enregistrer les offres
      </button>
    </div>
  );
}

export function AdminReports({ dateRange }) {
  return (
    <div className={styles.section}>
      <AdminReportGenerator dateRange={dateRange} />
    </div>
  );
}

export function AdminRevenue({ dateRange }) {
  const [annual, setAnnual] = useState(false);
  const rev = useMemo(() => getRevenueStats(dateRange), [dateRange]);
  const advPrice = getPlanMonthlyPrice('advanced');
  const premPrice = getPlanMonthlyPrice('premium');
  const total = annual ? rev.mrr * 12 : rev.mrr;

  return (
    <div className={styles.section}>
      <AdminPageHeader
        title="Revenus"
        subtitle={`Estimation sur ${formatPeriodLabel(dateRange.startDate, dateRange.endDate)}`}
      >
        <div className={styles.toggleBar}>
          <button
            type="button"
            className={!annual ? styles.toggleActive : ''}
            onClick={() => setAnnual(false)}
          >
            Mensuel (MRR)
          </button>
          <button
            type="button"
            className={annual ? styles.toggleActive : ''}
            onClick={() => setAnnual(true)}
          >
            Annuel (ARR)
          </button>
        </div>
      </AdminPageHeader>
      <div className={styles.kpiGrid}>
        <MetricCard value={rev.free} label="Comptes Free" accent="#8A8A7A" />
        <MetricCard value={rev.advanced} label={`Advanced × ${formatGNF(advPrice)}`} accent="#5C9EFF" />
        <MetricCard value={rev.premium} label={`Premium × ${formatGNF(premPrice)}`} accent="#F5C518" />
        <MetricCard value={`${formatGNF(total)} GNF`} label={annual ? 'Revenu annuel' : 'MRR'} accent="#4CAF50" />
      </div>
      <AdminCard title="Évolution revenus" subtitle="Période sélectionnée (estimation)">
        <BarChart data={rev.series} height={160} color="#F5C518" />
        <p className={styles.hint} style={{ marginTop: 12 }}>Estimation basée sur les plans Advanced et Premium actifs.</p>
      </AdminCard>
    </div>
  );
}

function renderStars(note) {
  return '★'.repeat(note) + '☆'.repeat(5 - note);
}

export function AdminFeedback({
  data, evalStats, evaluations, dateRange, confirmReset, onExport, onReset,
}) {
  const totalEngagement = (data?.engagementFound ?? 0) + (data?.engagementSearching ?? 0) + (data?.engagementTesting ?? 0);
  const engPct = (n) => (totalEngagement ? Math.round((n / totalEngagement) * 100) : 0);
  const suggestions = (data?.suggestions || []).filter((s) => (
    !s.timestamp || filterByDateRange([s], dateRange.startDate, dateRange.endDate, 'timestamp').length > 0
  ));

  return (
    <div className={styles.section}>
      <AdminPageHeader
        title="Feedback utilisateurs"
        subtitle={`Évaluations et suggestions — ${formatPeriodLabel(dateRange.startDate, dateRange.endDate)}`}
      />

      <div className={styles.feedbackKpiGrid}>
        {[
          { icon: Star, bg: '#FEF9C3', color: '#CA8A04', value: <>{evalStats.avgNote}<span className={styles.feedbackKpiSub}>/5</span></>, label: 'Note moyenne' },
          { icon: ThumbsUp, bg: '#DCFCE7', color: '#16A34A', value: data?.thumbsUp ?? 0, label: 'Votes positifs' },
          { icon: ThumbsDown, bg: '#FEE2E2', color: '#DC2626', value: data?.thumbsDown ?? 0, label: 'Votes négatifs' },
          { icon: MessageSquare, bg: '#EDE9FE', color: '#7C3AED', value: data?.profileReviews ?? 0, label: 'Avis sur profils' },
          { icon: Lightbulb, bg: '#FFF7ED', color: '#EA580C', value: suggestions.length, label: 'Suggestions reçues' },
        ].map(({ icon: Icon, bg, color, value, label }) => (
          <div key={label} className={styles.feedbackKpi}>
            <div className={styles.feedbackKpiIcon} style={{ background: bg, color }}>
              <Icon size={18} />
            </div>
            <div>
              <div className={styles.feedbackKpiValue}>{value}</div>
              <div className={styles.feedbackKpiLabel}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <AdminCard title="Engagement utilisateurs" subtitle="Réponses au widget d'engagement">
        <div className={styles.engagementRows}>
          {[
            { label: 'J\'ai trouvé ce que je cherche', value: data?.engagementFound ?? 0, icon: CheckCircle, color: '#16A34A' },
            { label: 'Je cherche encore', value: data?.engagementSearching ?? 0, icon: HelpCircle, color: '#D97706' },
            { label: 'Je teste juste la plateforme', value: data?.engagementTesting ?? 0, icon: XCircle, color: '#6B7280' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label}>
              <div className={styles.engRowHead}>
                <Icon size={15} style={{ color }} />
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
      </AdminCard>

      <AdminCard title="Évaluations reçues" subtitle={`${evalStats.total} réponses au total`}>
        <div className={styles.evalMetrics}>
          <div className={styles.evalMetric}>
            <span className={styles.evalMetricLabel}>Total</span>
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
                  <span className={styles.evalDate}>{new Date(entry.date).toLocaleString('fr-FR')}</span>
                </div>
                {entry.plusPlu?.trim() && <p className={styles.evalExcerpt}><strong>Plu :</strong> {entry.plusPlu}</p>}
                {entry.ameliorer?.trim() && <p className={styles.evalExcerpt}><strong>À améliorer :</strong> {entry.ameliorer}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Aucune évaluation pour le moment.</p>
        )}
      </AdminCard>

      <AdminCard title="Suggestions" subtitle="Idées envoyées sur la période">
        {suggestions.length > 0 ? (
          <ul className={styles.suggestionList}>
            {suggestions.map((s, i) => (
              <li key={i}>
                <p>{s.text}</p>
                <span>{new Date(s.timestamp).toLocaleString('fr-FR')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Aucune suggestion pour le moment.</p>
        )}
      </AdminCard>

      <div className={styles.footerActions}>
        <button type="button" onClick={onExport} className={styles.exportBtn}>
          <Download size={16} /> Exporter en JSON
        </button>
        <button
          type="button"
          onClick={onReset}
          className={`${styles.resetBtn} ${confirmReset ? styles.confirmReset : ''}`}
        >
          <Trash2 size={16} />
          {confirmReset ? 'Confirmer la réinitialisation ?' : 'Réinitialiser les données'}
        </button>
      </div>
    </div>
  );
}

const BROADCAST_PRESETS = [
  { label: 'Maintenance planifiée', type: 'maintenance', title: 'Maintenance en cours', message: 'G-List est temporairement indisponible pour maintenance. Merci de votre patience.', audience: 'all' },
  { label: 'Avertissement sécurité', type: 'warning', title: 'Message important', message: 'Veuillez mettre à jour vos informations de connexion et ne jamais partager votre mot de passe.', audience: 'all' },
  { label: 'Nouveauté Premium', type: 'info', title: 'Nouveautés Premium', message: 'Découvrez le mini-site niveau 77 et les nouvelles fonctionnalités dans votre espace pro.', audience: 'pros_premium' },
  { label: 'Bienvenue visiteurs', type: 'success', title: 'Bienvenue sur G-List', message: 'Trouvez les meilleurs professionnels de Guinée près de chez vous.', audience: 'visitors' },
];

export function AdminNotifications() {
  const { show, Toast } = useToast();
  const [broadcasts, setBroadcasts] = useState(() => getAdminBroadcasts());
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info',
    audience: 'all',
    expiresAt: '',
    pinned: false,
  });

  const recipientEstimate = estimateBroadcastRecipients(form.audience);

  const refresh = () => setBroadcasts(getAdminBroadcasts());

  const handleSubmit = (e) => {
    e.preventDefault();
    const created = adminCreateBroadcast({
      ...form,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    });
    if (!created) {
      show('Titre et message requis.');
      return;
    }
    show(`Notification envoyée — ~${recipientEstimate} destinataire${recipientEstimate > 1 ? 's' : ''}`);
    setForm({ title: '', message: '', type: 'info', audience: 'all', expiresAt: '', pinned: false });
    refresh();
  };

  const applyPreset = (preset) => {
    setForm((f) => ({
      ...f,
      title: preset.title,
      message: preset.message,
      type: preset.type,
      audience: preset.audience,
    }));
  };

  const toggleActive = (id, active) => {
    adminToggleBroadcast(id, active);
    show(active ? 'Notification réactivée' : 'Notification désactivée');
    refresh();
  };

  const remove = (id) => {
    adminDeleteBroadcast(id);
    show('Notification supprimée');
    refresh();
  };

  return (
    <div className={styles.section}>
      {Toast}
      <AdminPageHeader
        title="Notifications"
        subtitle="Envoyez des messages à tous les utilisateurs ou à des groupes ciblés"
      />

      <div className={styles.broadcastGrid}>
        <AdminCard title="Nouvelle notification" subtitle="Maintenance, avertissement, info…">
          <div className={styles.presetRow}>
            {BROADCAST_PRESETS.map((p) => (
              <button key={p.label} type="button" className={styles.presetBtn} onClick={() => applyPreset(p)}>
                {p.label}
              </button>
            ))}
          </div>

          <form className={styles.broadcastForm} onSubmit={handleSubmit}>
            <label className={styles.planAdminField}>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {BROADCAST_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label} — {t.description}</option>
                ))}
              </select>
            </label>

            <label className={styles.planAdminField}>
              Destinataires
              <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                {BROADCAST_AUDIENCES.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
              <span className={styles.recipientHint}>
                ~{recipientEstimate} destinataire{recipientEstimate > 1 ? 's' : ''} estimé{recipientEstimate > 1 ? 's' : ''}
              </span>
            </label>

            <label className={styles.planAdminField}>
              Titre
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex. Maintenance ce soir 22h–00h"
                maxLength={120}
                required
              />
            </label>

            <label className={styles.planAdminField}>
              Message
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Détaillez le message visible par les utilisateurs…"
                rows={4}
                maxLength={500}
                required
              />
            </label>

            <label className={styles.planAdminField}>
              Expiration (optionnel)
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </label>

            <label className={styles.broadcastCheck}>
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              />
              Épingler en priorité
            </label>

            <button type="submit" className={styles.planAdminSave}>
              <Send size={16} /> Envoyer la notification
            </button>
          </form>
        </AdminCard>

        <AdminCard title="Historique" subtitle={`${broadcasts.length} notification${broadcasts.length > 1 ? 's' : ''}`}>
          {broadcasts.length === 0 ? (
            <p className={styles.empty}>Aucune notification envoyée pour le moment.</p>
          ) : (
            <div className={styles.broadcastList}>
              {broadcasts.map((b) => (
                <article key={b.id} className={`${styles.broadcastItem} ${styles[`broadcast${b.type}`]} ${!b.active ? styles.broadcastInactive : ''}`}>
                  <div className={styles.broadcastItemHead}>
                    <span className={`${styles.badge} ${b.active ? styles.badgeActive : styles.badgeMuted}`}>
                      {b.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={styles.planTag}>{getBroadcastTypeLabel(b.type)}</span>
                    <span className={styles.planTag}>{getBroadcastAudienceLabel(b.audience)}</span>
                  </div>
                  <strong>{b.title}</strong>
                  <p>{b.message}</p>
                  <small>
                    {new Date(b.createdAt).toLocaleString('fr-FR')}
                    {b.expiresAt && ` · expire le ${new Date(b.expiresAt).toLocaleString('fr-FR')}`}
                    {b.pinned && ' · épinglée'}
                  </small>
                  <div className={styles.broadcastItemActions}>
                    <button type="button" onClick={() => toggleActive(b.id, !b.active)}>
                      {b.active ? <><PowerOff size={14} /> Désactiver</> : <><Power size={14} /> Réactiver</>}
                    </button>
                    <button type="button" className={styles.broadcastDelete} onClick={() => remove(b.id)}>
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}

export function AdminAuditLog({ dateRange }) {
  const { show, Toast } = useToast();
  const [filter, setFilter] = useState('');
  const logs = useMemo(
    () => getAuditLog({
      limit: 200,
      actorType: filter || undefined,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    [filter, dateRange.startDate, dateRange.endDate],
  );

  return (
    <div className={styles.section}>
      {Toast}
      <AdminPageHeader
        title="Journal d'audit"
        subtitle={`Traçabilité niveau ${SAAS_PLATFORM_LEVEL} — ${formatPeriodLabel(dateRange.startDate, dateRange.endDate)}`}
      />

      <AdminCard title="Plateforme Enterprise" subtitle="Fonctionnalités actives">
        <div className={styles.milestoneGrid}>
          {Object.entries(PLATFORM_MILESTONES).filter(([lvl]) => Number(lvl) >= 77).map(([lvl, label]) => (
            <div key={lvl} className={styles.milestoneItem}>
              <span className={styles.milestoneLevel}>{lvl}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Événements" subtitle={`${logs.length} entrée${logs.length > 1 ? 's' : ''}`}>
        <div className={styles.filters}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tous les acteurs</option>
            <option value="admin">Admin</option>
            <option value="pro">Professionnels</option>
            <option value="visitor">Visiteurs</option>
            <option value="system">Système</option>
          </select>
        </div>
        {logs.length === 0 ? (
          <p className={styles.empty}>Aucun événement sur cette période.</p>
        ) : (
          <div className={styles.auditList}>
            {logs.map((entry) => (
              <div key={entry.id} className={styles.auditRow}>
                <div className={styles.auditRowHead}>
                  <span className={styles.planTag}>{entry.actorType}</span>
                  <strong>{getAuditActionLabel(entry.action)}</strong>
                  <time>{new Date(entry.timestamp).toLocaleString('fr-FR')}</time>
                </div>
                {entry.target && <p>Cible : {entry.target}</p>}
                {entry.details && <p>{entry.details}</p>}
                <small>Par : {entry.actor}</small>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
