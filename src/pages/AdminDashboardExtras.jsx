import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, ThumbsUp, ThumbsDown, MessageSquare, Lightbulb,
  CheckCircle, HelpCircle, XCircle, Download, Trash2, Search,
  Send, Power, PowerOff, ScrollText,
  UserCircle, Users, UserPlus, Mail, MapPin, TrendingUp,
  AlertTriangle, Target, Sparkles, Globe, Copy, Calendar,
  Shield, Zap, Eye, BarChart2, ClipboardList,
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
import { PLATFORM_MILESTONES } from '../utils/saasLevel100';
import { usePlatformAnalytics } from '../hooks/usePlatformAnalytics';
import { reloadProfessionalsAnnuaire } from '../api/professionals';
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

function AdminPageHeader({ children }) {
  if (!children) return null;
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeaderActions}>{children}</div>
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

function StatKpi({ icon: Icon, bg, color, value, label }) {
  return (
    <div className={styles.feedbackKpi}>
      <div className={styles.feedbackKpiIcon} style={{ background: bg, color }}>
        <Icon size={18} aria-hidden />
      </div>
      <div>
        <div className={styles.feedbackKpiValue}>{value}</div>
        <div className={styles.feedbackKpiLabel}>{label}</div>
      </div>
    </div>
  );
}

function getInitials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function UserAvatar({ name }) {
  return <span className={styles.userAvatar} aria-hidden>{getInitials(name)}</span>;
}

function RoleBadge({ role }) {
  const map = {
    visiteur: styles.roleVisitor,
    pro: styles.rolePro,
    admin: styles.roleAdmin,
  };
  return <span className={`${styles.roleBadge} ${map[role] || styles.roleVisitor}`}>{role}</span>;
}

function PriorityBadge({ score }) {
  const high = score > 15;
  return (
    <span className={`${styles.priorityBadge} ${high ? styles.priorityHigh : styles.priorityMed}`}>
      {high ? 'Haute' : 'Moyenne'}
    </span>
  );
}

export function AdminOverview({ evalStats, dateRange }) {
  const { kpis, activity, topCategories, loading } = usePlatformAnalytics(dateRange);
  const topCats = topCategories.map((c) => ({ label: c.name.split(' ')[0], value: c.count }));
  const periodLabel = formatPeriodLabel(dateRange.startDate, dateRange.endDate);

  if (loading || !kpis) {
    return <div className={styles.section}><p>Chargement des indicateurs…</p></div>;
  }

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
        <AdminCard title="Activité" subtitle="Période sélectionnée">
          <BarChart data={activity} height={160} />
        </AdminCard>
        <AdminCard title="Top catégories" subtitle="Les plus consultées">
          <BarChart data={topCats} color="#D4A800" height={160} />
        </AdminCard>
      </div>

      <AdminCard title="Synthèse rapide" subtitle="Signaux à surveiller">
        <div className={styles.quickStatsGrid}>
          <div className={styles.quickStat}>
            <Star size={16} aria-hidden />
            <div>
              <strong>{evalStats.total}</strong>
              <span>Évaluations plateforme</span>
            </div>
          </div>
          <div className={styles.quickStat}>
            <AlertTriangle size={16} aria-hidden />
            <div>
              <strong>{kpis.pendingReports}</strong>
              <span>Signalements en attente</span>
            </div>
          </div>
          <div className={styles.quickStat}>
            <Zap size={16} aria-hidden />
            <div>
              <strong>{kpis.premium} / {kpis.advanced}</strong>
              <span>Premium · Advanced</span>
            </div>
          </div>
          <div className={styles.quickStat}>
            <Sparkles size={16} aria-hidden />
            <div>
              <strong>{kpis.premium + kpis.advanced}</strong>
              <span>Abonnés payants</span>
            </div>
          </div>
        </div>
      </AdminCard>
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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    reloadProfessionalsAnnuaire().then(() => setRefreshKey((n) => n + 1)).catch(() => {});
  }, []);

  const pros = useMemo(() => getProsWithAdminState(), [refreshKey]);

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

  const visiblePros = pros.filter((p) => !p.hidden);

  const act = (label, fn) => {
    fn();
    reloadProfessionalsAnnuaire().then(() => setRefreshKey((n) => n + 1)).catch(() => {});
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

      <div className={styles.feedbackKpiGrid}>
        <StatKpi icon={Users} bg="#FFFBEB" color="#CA8A04" value={visiblePros.length} label="Fiches actives" />
        <StatKpi icon={CheckCircle} bg="#DCFCE7" color="#16A34A" value={visiblePros.filter((p) => p.verifie).length} label="Vérifiés" />
        <StatKpi icon={Zap} bg="#DBEAFE" color="#1D4ED8" value={visiblePros.filter((p) => (p.plan || 'free') === 'advanced').length} label="Advanced" />
        <StatKpi icon={Star} bg="#FEF9C3" color="#B45309" value={visiblePros.filter((p) => (p.plan || 'free') === 'premium').length} label="Premium" />
      </div>

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

      <AdminCard title="Liste des professionnels" subtitle="Actions rapides sur chaque fiche">
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
      </AdminCard>
    </div>
  );
}

export function AdminUsers({ dateRange }) {
  const { show, Toast } = useToast();
  const [roles, setRoles] = useState({});
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const visitors = getAllVisitorAccounts();
  const pros = getAllProAccountsList();
  const waitlist = getWaitlistEntries();

  const allUsers = useMemo(() => [
    ...visitors.map((v) => ({ ...v, role: roles[v.email] || 'visiteur', name: `${v.prenom} ${v.nom}` })),
    ...pros.map((p) => ({ ...p, role: roles[p.email] || 'pro', name: p.nom })),
  ], [visitors, pros, roles]);

  const periodUsers = useMemo(() => allUsers.filter((u) => {
    if (!u.createdAt) return false;
    return filterByDateRange([u], dateRange.startDate, dateRange.endDate, 'createdAt').length > 0;
  }), [allUsers, dateRange]);

  const filtered = useMemo(() => {
    let list = periodUsers;
    if (roleFilter !== 'all') list = list.filter((u) => u.role === roleFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((u) => [u.name, u.email].filter(Boolean).join(' ').toLowerCase().includes(q));
    }
    return list;
  }, [periodUsers, roleFilter, search]);

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
        subtitle={`Comptes inscrits — ${formatPeriodLabel(dateRange.startDate, dateRange.endDate)}`}
      />

      <div className={styles.feedbackKpiGrid}>
        <StatKpi icon={Users} bg="#EDE9FE" color="#7C3AED" value={allUsers.length} label="Comptes totaux" />
        <StatKpi icon={UserCircle} bg="#DBEAFE" color="#1D4ED8" value={visitors.length} label="Visiteurs" />
        <StatKpi icon={UserPlus} bg="#DCFCE7" color="#16A34A" value={pros.length} label="Professionnels" />
        <StatKpi icon={Mail} bg="#FEF9C3" color="#CA8A04" value={waitlist.length} label="Liste d'attente" />
      </div>

      <div className={styles.filters}>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">Tous les rôles</option>
          <option value="visiteur">Visiteurs</option>
          <option value="pro">Professionnels</option>
        </select>
        <label className={styles.searchWrap}>
          <Search size={16} aria-hidden />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher un utilisateur"
          />
        </label>
        <span className={styles.filterCount}>{filtered.length} sur {periodUsers.length} inscrit(s)</span>
      </div>

      <AdminCard title="Comptes inscrits" subtitle="Gestion des rôles et accès">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Inscription</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className={styles.emptyRow}>Aucun compte sur cette période.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.email}>
                  <td>
                    <div className={styles.userCell}>
                      <UserAvatar name={u.name} />
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>
                    <button type="button" className={styles.btnSecondary} onClick={() => toggleRole(u.email, u.role)}>
                      Passer {u.role === 'pro' ? 'visiteur' : 'pro'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {waitlist.length > 0 && (
        <AdminCard title="Liste d'attente" subtitle={`${waitlist.length} demande${waitlist.length > 1 ? 's' : ''} en attente`}>
          <div className={styles.waitlistGrid}>
            {waitlist.slice(0, 12).map((entry, i) => (
              <div key={entry.email || i} className={styles.waitlistItem}>
                <Mail size={14} aria-hidden />
                <div>
                  <strong>{entry.email || entry.nom || '—'}</strong>
                  {entry.metier && <span>{entry.metier}{entry.ville ? ` · ${entry.ville}` : ''}</span>}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}

export function AdminAnalytics({ dateRange }) {
  const { kpis, activity, topCategories, topRegions, loading } = usePlatformAnalytics(dateRange);
  const topCats = topCategories.map((c) => ({ label: c.name, value: c.count }));
  const topRegs = topRegions.map((r) => ({ label: r.name, value: r.count }));

  if (loading || !kpis) {
    return <div className={styles.section}><p>Chargement…</p></div>;
  }

  return (
    <div className={styles.section}>
      <AdminPageHeader
        title="Analytics"
        subtitle={`Répartition et tendances — ${formatPeriodLabel(dateRange.startDate, dateRange.endDate)}`}
      />

      <div className={styles.feedbackKpiGrid}>
        <StatKpi icon={Eye} bg="#DCFCE7" color="#16A34A" value={kpis.totalViews.toLocaleString('fr-FR')} label="Vues annuaire" />
        <StatKpi icon={Search} bg="#FFF7ED" color="#EA580C" value={kpis.totalSearches} label="Recherches" />
        <StatKpi icon={TrendingUp} bg="#FFFBEB" color="#CA8A04" value={`+${kpis.growthPct}%`} label="Croissance" />
        <StatKpi icon={BarChart2} bg="#EDE9FE" color="#7C3AED" value={kpis.whatsappClicks} label="Clics WhatsApp" />
      </div>

      <AdminCard title="Courbe d'activité" subtitle="Évolution sur la période">
        <BarChart data={activity} height={180} color="#F5C518" />
      </AdminCard>

      <div className={styles.splitGrid}>
        <AdminCard title="Top catégories" subtitle="Volume de consultations">
          <BarChart data={topCats} height={160} />
        </AdminCard>
        <AdminCard title="Top villes" subtitle="Activité géographique">
          <BarChart data={topRegs} color="#D4A800" height={160} />
        </AdminCard>
      </div>

      <AdminCard title="Tendances" subtitle="Synthèse des signaux de trafic">
        <ul className={styles.trendList}>
          <li><TrendingUp size={14} aria-hidden /> Recherches totales : <strong>{kpis.totalSearches}</strong></li>
          <li><Target size={14} aria-hidden /> {topCats[0] ? `${topCats[0].label} en tête avec ${topCats[0].value} pros` : 'Pas encore de données catégorie'}</li>
          <li><MapPin size={14} aria-hidden /> {topRegs[0] ? `${topRegs[0].label} — ville la plus active` : 'Pas encore de données ville'}</li>
          <li><Zap size={14} aria-hidden /> {kpis.whatsappClicks} clics WhatsApp sur la période</li>
        </ul>
      </AdminCard>
    </div>
  );
}

export function AdminMap() {
  const regionDensity = useMemo(() => getRegionDensity(), []);
  const totalPros = useMemo(() => Object.values(regionDensity).reduce((a, b) => a + b, 0), [regionDensity]);
  const max = Math.max(...Object.values(regionDensity), 1);
  const topRegion = useMemo(() => {
    const entries = Object.entries(regionDensity).sort((a, b) => b[1] - a[1]);
    return entries[0] || ['—', 0];
  }, [regionDensity]);

  return (
    <div className={styles.section}>
      <AdminPageHeader
        title="Carte Guinée"
        subtitle="Densité des professionnels par ville et région."
      />

      <div className={styles.feedbackKpiGrid}>
        <StatKpi icon={Globe} bg="#FFFBEB" color="#CA8A04" value={totalPros} label="Pros sur la carte" />
        <StatKpi icon={MapPin} bg="#DCFCE7" color="#16A34A" value={topRegion[0]} label="Région la plus dense" />
        <StatKpi icon={Users} bg="#DBEAFE" color="#1D4ED8" value={topRegion[1]} label="Pros dans cette région" />
        <StatKpi icon={MapPin} bg="#EDE9FE" color="#7C3AED" value={REGIONS.length} label="Régions couvertes" />
      </div>

      <div className={styles.mapCard}>
        <AdminCard title="Carte interactive" subtitle="Répartition géographique">
          <div className={styles.mapWrap}><GuineaMap /></div>
          <div className={styles.legend}>
            <span className={styles.legendHigh}>Dense ({'>'}{Math.round(max * 0.7)})</span>
            <span className={styles.legendMed}>Moyen</span>
            <span className={styles.legendLow}>Faible</span>
          </div>
        </AdminCard>
        <AdminCard title="Détail par région" subtitle="Classement par nombre de pros">
          <div className={styles.regionStats}>
            {[...REGIONS]
              .map((r) => ({ name: r, count: regionDensity[r] || 0 }))
              .sort((a, b) => b.count - a.count)
              .map(({ name, count }) => (
                <div key={name} className={styles.regionStat}>
                  <div className={styles.regionStatHead}>
                    <strong>{name}</strong>
                    <span>{count} pro{count > 1 ? 's' : ''}</span>
                  </div>
                  <div className={styles.regionBarTrack}>
                    <div className={styles.regionBar} style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

export function AdminOpportunities({ dateRange }) {
  const { show, Toast } = useToast();
  const { opportunities: opps, loading } = usePlatformAnalytics(dateRange);
  const highPriority = opps.filter((o) => o.score > 15).length;
  const maxScore = Math.max(...opps.map((o) => o.score), 1);

  if (loading) {
    return <div className={styles.section}><p>Chargement…</p></div>;
  }

  return (
    <div className={styles.section}>
      {Toast}
      <AdminPageHeader
        title="Opportunités"
        subtitle="Zones à fort potentiel — peu de pros pour une demande estimée élevée."
      />

      <div className={styles.feedbackKpiGrid}>
        <StatKpi icon={Target} bg="#FEF9C3" color="#CA8A04" value={opps.length} label="Zones identifiées" />
        <StatKpi icon={AlertTriangle} bg="#FEE2E2" color="#DC2626" value={highPriority} label="Priorité haute" />
        <StatKpi icon={TrendingUp} bg="#DCFCE7" color="#16A34A" value={opps.reduce((s, o) => s + o.searches, 0)} label="Recherches est." />
        <StatKpi icon={Users} bg="#DBEAFE" color="#1D4ED8" value={opps.reduce((s, o) => s + o.pros, 0)} label="Pros existants" />
      </div>

      <AdminCard title="Marchés à développer" subtitle="Classement par score d'opportunité">
        {opps.length === 0 ? (
          <p className={styles.empty}>Aucune opportunité détectée pour cette période.</p>
        ) : (
          <div className={styles.oppList}>
            {opps.map((o) => (
              <article key={`${o.cat}-${o.region}`} className={styles.oppCard}>
                <div className={styles.oppCardHead}>
                  <div>
                    <strong>{o.cat}</strong>
                    <span><MapPin size={12} aria-hidden /> {o.region}</span>
                  </div>
                  <PriorityBadge score={o.score} />
                </div>
                <div className={styles.oppMetrics}>
                  <span><Search size={12} aria-hidden /> {o.searches} recherches</span>
                  <span><Users size={12} aria-hidden /> {o.pros} pro{o.pros > 1 ? 's' : ''}</span>
                  <span>Score {o.score}</span>
                </div>
                <div className={styles.oppScoreTrack}>
                  <div className={styles.oppScoreFill} style={{ width: `${(o.score / maxScore) * 100}%` }} />
                </div>
                <button
                  type="button"
                  className={styles.oppActionBtn}
                  onClick={() => show(`Campagne d'invitation — ${o.cat} à ${o.region}`)}
                >
                  <Mail size={14} aria-hidden /> Inviter des pros
                </button>
              </article>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}

const CONTENT_TEMPLATES = [
  { id: 'medecins', label: 'Top 5 médecins Conakry', icon: ClipboardList, desc: 'Classement santé' },
  { id: 'restaurants', label: 'Top restaurants', icon: Star, desc: 'Gastronomie locale' },
  { id: 'regional', label: 'Classement par villes', icon: MapPin, desc: 'Vue régionale' },
];

const CALENDAR_PLAN = [
  { day: 'Lun', date: 12, type: 'Post réseaux', tone: 'post' },
  { day: 'Mar', date: 13, type: 'Story', tone: 'story' },
  { day: 'Mer', date: 14, type: 'Post réseaux', tone: 'post' },
  { day: 'Jeu', date: 15, type: 'Story', tone: 'story' },
  { day: 'Ven', date: 16, type: 'Post réseaux', tone: 'post' },
  { day: 'Sam', date: 17, type: 'Story', tone: 'story' },
  { day: 'Dim', date: 18, type: 'Repos', tone: 'rest' },
];

export function AdminContent() {
  const [preview, setPreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('');

  const generate = (type) => {
    setActiveTemplate(type);
    setPreview(generateContentPreview(type));
  };

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

      <AdminCard title="Générateur de contenu" subtitle="Textes prêts à publier sur les réseaux">
        <div className={styles.contentTemplateGrid}>
          {CONTENT_TEMPLATES.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              type="button"
              className={`${styles.contentTemplateBtn} ${activeTemplate === id ? styles.contentTemplateActive : ''}`}
              onClick={() => generate(id)}
            >
              <span className={styles.contentTemplateIcon}><Icon size={18} aria-hidden /></span>
              <strong>{label}</strong>
              <small>{desc}</small>
            </button>
          ))}
        </div>
        {preview ? (
          <div className={styles.previewBlock}>
            <pre className={styles.preview}>{preview}</pre>
            <button type="button" className={styles.copyBtn} onClick={copyPreview}>
              <Copy size={14} aria-hidden />
              {copied ? 'Copié !' : 'Copier le texte'}
            </button>
          </div>
        ) : (
          <p className={styles.empty}>Choisissez un modèle pour générer un aperçu.</p>
        )}
      </AdminCard>

      <AdminCard title="Planning publications" subtitle="Semaine type — réseaux sociaux">
        <div className={styles.calendar}>
          {CALENDAR_PLAN.map(({ day, date, type, tone }) => (
            <div key={day} className={`${styles.calDay} ${styles[`calDay${tone.charAt(0).toUpperCase() + tone.slice(1)}`]}`}>
              <span className={styles.calDayLabel}>{day}</span>
              <strong className={styles.calDayDate}>{date}</strong>
              <small>{type}</small>
            </div>
          ))}
        </div>
        <p className={styles.hint} style={{ marginTop: 14 }}>
          <Calendar size={13} aria-hidden style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Alternez posts longs et stories courtes pour maximiser l&apos;engagement.
        </p>
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

      <div className={styles.feedbackKpiGrid}>
        <StatKpi icon={AlertTriangle} bg="#FEE2E2" color="#DC2626" value={pending.length} label="En attente" />
        <StatKpi icon={Shield} bg="#FFF7ED" color="#EA580C" value={suspects.length} label="Profils suspects" />
        <StatKpi icon={Users} bg="#FEF9C3" color="#CA8A04" value={duplicateGroups.length} label="Groupes doublons" />
        <StatKpi icon={CheckCircle} bg="#DCFCE7" color="#16A34A" value={periodReports.filter((r) => r.status === 'resolved').length} label="Traités" />
      </div>

      <div className={styles.modGrid}>
        <AdminCard title={`Signalements (${pending.length})`} subtitle="À traiter en priorité">
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
        </AdminCard>

        <AdminCard title={`Profils suspects (${suspects.length})`} subtitle="Non vérifiés, sans avis">
          {suspects.length === 0 ? (
            <p className={styles.empty}>Aucun profil suspect détecté.</p>
          ) : (
            <ul className={styles.modList}>
              {suspects.map((p) => (
                <li key={p.id} className={styles.modCard}>
                  <div>
                    <strong>{p.nom}</strong>
                    <p><MapPin size={12} aria-hidden /> {p.region}</p>
                  </div>
                  <button type="button" onClick={() => { adminHideProfessional(p.id); setRefresh((n) => n + 1); show(`${p.nom} masqué`); }}>
                    Masquer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
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

  const insightPanels = [
    { title: 'Tendances', items: trends, icon: TrendingUp, accent: '#F5C518', bg: '#FFFBEB' },
    { title: 'Recommandations', items: recommendations, icon: Sparkles, accent: '#7C3AED', bg: '#EDE9FE' },
    { title: 'Alertes', items: alerts, icon: AlertTriangle, accent: '#DC2626', bg: '#FEE2E2' },
  ];

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
        {insightPanels.map(({ title, items, icon: Icon, accent, bg }) => (
          <AdminCard key={title} title={title} subtitle={`${items.length} élément${items.length > 1 ? 's' : ''}`}>
            <ul className={styles.insightList}>
              {items.length === 0 ? (
                <li className={styles.insightEmpty}>Rien à signaler pour le moment.</li>
              ) : items.map((t) => (
                <li key={t} className={styles.insightItem} style={{ borderLeftColor: accent, background: bg }}>
                  <Icon size={14} aria-hidden style={{ color: accent, flexShrink: 0 }} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </AdminCard>
        ))}
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

      <AdminCard title="Plan Free" subtitle="Offre de base — non modifiable ici">
        <div className={styles.freePlanSummary}>
          <strong>Gratuit</strong>
          <p>Fiche annuaire standard, visibilité de base, avis clients.</p>
        </div>
      </AdminCard>

      <div className={styles.planAdminGrid}>
        {paidIds.map((id) => {
          const plan = plans[id];
          return (
            <article key={id} className={`${styles.planAdminCard} ${styles[`planAdminCard${id.charAt(0).toUpperCase() + id.slice(1)}`]}`}>
              <div className={styles.planAdminCardHead}>
                <h3>{plan.name}</h3>
                <span className={styles.planTag}>{id}</span>
              </div>
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

      <div className={styles.planSaveBar}>
        <p>Les changements sont visibles immédiatement dans l&apos;espace pro.</p>
        <button type="button" className={styles.planAdminSave} onClick={handleSave}>
          Enregistrer les offres
        </button>
      </div>
    </div>
  );
}

export function AdminReports({ dateRange }) {
  return (
    <div className={styles.section}>
      <AdminPageHeader
        title="Rapports"
        subtitle={`Export PDF, Word, Excel ou CSV — ${formatPeriodLabel(dateRange.startDate, dateRange.endDate)}`}
      />
      <div className={styles.reportsShell}>
        <AdminReportGenerator dateRange={dateRange} />
      </div>
    </div>
  );
}

export function AdminRevenue({ dateRange }) {
  const [annual, setAnnual] = useState(false);
  const { revenue: rev, loading } = usePlatformAnalytics(dateRange);
  const advPrice = getPlanMonthlyPrice('advanced');
  const premPrice = getPlanMonthlyPrice('premium');
  const safeRev = rev || { free: 0, advanced: 0, premium: 0, mrr: 0, series: [] };
  const total = annual ? safeRev.mrr * 12 : safeRev.mrr;

  if (loading) {
    return <div className={styles.section}><p>Chargement…</p></div>;
  }

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
        <MetricCard value={safeRev.free} label="Comptes Free" accent="#8A8A7A" />
        <MetricCard value={safeRev.advanced} label={`Advanced × ${formatGNF(advPrice)}`} accent="#5C9EFF" />
        <MetricCard value={safeRev.premium} label={`Premium × ${formatGNF(premPrice)}`} accent="#F5C518" />
        <MetricCard value={`${formatGNF(total)} GNF`} label={annual ? 'Revenu annuel' : 'MRR'} accent="#4CAF50" />
      </div>
      <AdminCard title="Évolution revenus" subtitle="Période sélectionnée">
        <BarChart data={safeRev.series} height={160} color="#F5C518" />
        <p className={styles.hint} style={{ marginTop: 12 }}>Basé sur les abonnements Advanced et Premium actifs en base.</p>
      </AdminCard>

      <AdminCard title="Répartition par plan" subtitle="Détail des abonnements actifs">
        <div className={styles.revenueBreakdown}>
          {[
            { label: 'Free', count: safeRev.free, price: 0, color: '#9CA3AF' },
            { label: 'Advanced', count: safeRev.advanced, price: advPrice, color: '#3B82F6' },
            { label: 'Premium', count: safeRev.premium, price: premPrice, color: '#F5C518' },
          ].map(({ label, count, price, color }) => (
            <div key={label} className={styles.revenueRow}>
              <div className={styles.revenueRowHead}>
                <span className={styles.revenueDot} style={{ background: color }} />
                <strong>{label}</strong>
                <span>{count} compte{count > 1 ? 's' : ''}</span>
              </div>
              <div className={styles.revenueRowValue}>
                {price > 0 ? `${formatGNF(count * price)} GNF / mois` : 'Gratuit'}
              </div>
            </div>
          ))}
        </div>
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
        subtitle={`Traçabilité — ${formatPeriodLabel(dateRange.startDate, dateRange.endDate)}`}
      />

      <AdminCard title="Fonctionnalités plateforme" subtitle="Modules actifs">
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
        <div className={styles.filters} style={{ marginBottom: 16 }}>
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
          <div className={styles.auditTimeline}>
            {logs.map((entry) => (
              <article key={entry.id} className={styles.auditRow}>
                <div className={styles.auditTimelineDot} data-actor={entry.actorType} />
                <div className={styles.auditRowBody}>
                  <div className={styles.auditRowHead}>
                    <span className={`${styles.auditActor} ${styles[`auditActor${entry.actorType.charAt(0).toUpperCase() + entry.actorType.slice(1)}`]}`}>
                      {entry.actorType}
                    </span>
                    <strong>{getAuditActionLabel(entry.action)}</strong>
                    <time>{new Date(entry.timestamp).toLocaleString('fr-FR')}</time>
                  </div>
                  {entry.target && <p className={styles.auditTarget}>Cible : {entry.target}</p>}
                  {entry.details && <p className={styles.auditDetails}>{entry.details}</p>}
                  <small className={styles.auditActorName}>Par : {entry.actor}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
