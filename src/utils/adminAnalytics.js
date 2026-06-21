import { getAllProfessionalsIncludingHidden } from '../api/professionals';
import { useSupabase } from '../lib/supabaseClient';
import { CATEGORIES, REGIONS } from '../data/constants';
import {
  getItem, KEYS, getSearchHistory, getReports, getAllProAccountsList,
  getAllVisitorAccounts, getAdminOverrides, getEvaluations,
  getPlanMonthlyPrice, getViewHistory, getWaitlistEntries,
} from './storage';
import {
  filterByDateRange, daysBetween, defaultDateRange, parseISODate, downsampleChartData,
} from './dateRange';

function hashSeed(n) {
  let x = Math.abs(Number(n) || 1);
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

export function resolveAdminDateRange(dateRange) {
  if (dateRange?.startDate && dateRange?.endDate) return dateRange;
  return defaultDateRange();
}

function periodScale(dateRange) {
  const range = resolveAdminDateRange(dateRange);
  return daysBetween(range.startDate, range.endDate) / 30;
}

export function getProsWithAdminState() {
  const overrides = useSupabase ? {} : getAdminOverrides();
  return getAllProfessionalsIncludingHidden().map((p) => {
    const o = overrides[p.id] || {};
    const hidden = o.hidden ?? p.hidden ?? false;
    const disabled = o.disabled ?? p.disabled ?? false;
    const flaggedDuplicate = o.flaggedDuplicate ?? p.flagged_duplicate ?? false;
    const verifie = o.verifie ?? p.verifie;
    return {
      ...p,
      ...o,
      hidden,
      disabled,
      flaggedDuplicate,
      verifie,
      vues: p.vues ?? p.profileViews ?? 0,
      adminStatus: hidden ? 'masqué' : disabled ? 'désactivé' : flaggedDuplicate ? 'doublon' : verifie ? 'vérifié' : 'actif',
    };
  });
}

export function getPlatformKPIs(dateRange) {
  const range = resolveAdminDateRange(dateRange);
  const scale = periodScale(range);
  const pros = getProsWithAdminState();
  const active = pros.filter((p) => !p.hidden && !p.disabled);
  const catalogViews = active.reduce((s, p) => s + (p.vues || 0), 0);
  const viewHistory = filterByDateRange(getViewHistory(), range.startDate, range.endDate, 'viewedAt');
  const totalViews = viewHistory.length || Math.max(1, Math.round(catalogViews * Math.min(scale, 1)));
  const searches = getSearchHistory();
  const totalSearches = Math.max(searches.length ? 1 : 0, Math.round(searches.length * Math.min(scale, 1)));
  const reports = filterByDateRange(getReports(), range.startDate, range.endDate, 'date');
  const waitlist = filterByDateRange(getWaitlistEntries(), range.startDate, range.endDate, 'timestamp');
  const registeredPros = getAllProAccountsList();
  const visitors = getAllVisitorAccounts();
  const newUsers = [
    ...filterByDateRange(registeredPros, range.startDate, range.endDate, 'createdAt'),
    ...filterByDateRange(visitors, range.startDate, range.endDate, 'createdAt'),
  ].length;
  const premium = registeredPros.filter((p) => p.plan === 'premium' || p.premium).length
    + active.filter((p) => p.plan === 'premium').length;
  const advanced = registeredPros.filter((p) => p.plan === 'advanced').length
    + active.filter((p) => p.plan === 'advanced').length;
  const verified = active.filter((p) => p.verifie).length;
  const whatsappEst = Math.floor(totalViews * 0.31);
  const evalCount = filterByDateRange(getEvaluations(), range.startDate, range.endDate, 'date').length;

  return {
    totalPros: active.length,
    verified,
    premium,
    advanced,
    totalUsers: newUsers || visitors.length + registeredPros.length,
    totalViews,
    totalSearches,
    pendingReports: reports.filter((r) => r.status === 'pending').length,
    waitlistCount: waitlist.length,
    whatsappClicks: whatsappEst,
    evalCount,
    growthPct: active.length > 100 ? 12 : 8,
    periodDays: daysBetween(range.startDate, range.endDate),
  };
}

export function getActivitySeries(dateRange) {
  const range = resolveAdminDateRange(dateRange);
  const days = daysBetween(range.startDate, range.endDate);
  const kpis = getPlatformKPIs(range);
  const rand = hashSeed(kpis.totalViews + kpis.totalSearches);
  const base = Math.max(4, Math.floor(kpis.totalViews / days / 4) || 2);
  const start = parseISODate(range.startDate);
  const showYear = days > 60;

  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        ...(showYear ? { year: '2-digit' } : {}),
      }),
      value: base + Math.floor(rand() * base * 1.4) + (i > days - 7 ? 4 : 0),
    };
  });

  return downsampleChartData(series, 24);
}

function getActivePros() {
  return getProsWithAdminState().filter((p) => !p.hidden && !p.disabled);
}

export function getTopCategories(limit = 5, dateRange) {
  const scale = periodScale(dateRange);
  const counts = {};
  getActivePros().forEach((p) => {
    counts[p.categorie] = (counts[p.categorie] || 0) + 1;
  });
  const searches = getSearchHistory();
  searches.forEach((q) => {
    const match = CATEGORIES.find((c) => q.toLowerCase().includes(c.name.split(' ')[0].toLowerCase()));
    if (match) counts[match.name] = (counts[match.name] || 0) + Math.max(1, Math.round(2 * Math.min(scale, 1)));
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label: label.split(' ')[0], value }));
}

export function getTopRegions(limit = 5) {
  const counts = {};
  REGIONS.forEach((r) => { counts[r] = 0; });
  getActivePros().forEach((p) => {
    counts[p.region] = (counts[p.region] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label: label.slice(0, 8), value }));
}

export function getRegionDensity() {
  const active = getActivePros();
  return REGIONS.reduce((acc, r) => {
    acc[r] = active.filter((p) => p.region === r).length;
    return acc;
  }, {});
}

export function getOpportunityGaps(limit = 8, dateRange) {
  const scale = periodScale(dateRange);
  const active = getActivePros();
  const gaps = [];
  CATEGORIES.forEach((cat) => {
    REGIONS.forEach((region) => {
      const pros = active.filter((p) => p.categorie === cat.name && p.region === region);
      const demand = Math.max(5, Math.round((25 - pros.length * 3 + cat.name.length) * Math.max(scale, 0.5)));
      if (pros.length <= 2 && demand > 10) {
        gaps.push({
          cat: cat.name,
          region,
          searches: demand,
          pros: pros.length,
          score: demand / Math.max(pros.length, 1),
        });
      }
    });
  });
  return gaps.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getRevenueStats(dateRange) {
  const range = resolveAdminDateRange(dateRange);
  const registered = getAllProAccountsList();
  const active = getActivePros();
  const staticPremium = active.filter((p) => p.plan === 'premium').length;
  const staticAdvanced = active.filter((p) => p.plan === 'advanced').length;
  const premium = registered.filter((p) => p.plan === 'premium' || p.premium).length + staticPremium;
  const advanced = registered.filter((p) => p.plan === 'advanced').length + staticAdvanced;
  const free = Math.max(0, active.length - premium - advanced);
  const mrr = advanced * getPlanMonthlyPrice('advanced') + premium * getPlanMonthlyPrice('premium');
  const span = daysBetween(range.startDate, range.endDate);
  const periodMrr = Math.round(mrr * (span / 30));
  const series = getActivitySeries(range).map((point) => ({
    label: point.label,
    value: Math.max(1, Math.round((periodMrr / 1000) * (0.6 + (point.value % 10) * 0.04))),
  }));
  return { free, advanced, premium, mrr: periodMrr, series, fullMrr: mrr };
}

export function generateContentPreview(type) {
  const active = getActivePros();
  const tops = (catName, regionFilter) => (
    active
      .filter((p) => (!catName || p.categorie === catName) && (!regionFilter || p.region === regionFilter))
      .sort((a, b) => b.note - a.note)
      .slice(0, 5)
  );

  if (type === 'medecins') {
    const list = tops('Santé & Médecine', 'Conakry');
    return `Top 5 médecins — Conakry\n${list.map((p, i) => `${i + 1}. ${p.nom} — ${p.note}★ (${p.nombreAvis} avis)`).join('\n')}`;
  }
  if (type === 'restaurants') {
    const list = tops('Restaurants & Maquis');
    return `Top restaurants Guinée\n${list.map((p, i) => `${i + 1}. ${p.nom} — ${p.region}`).join('\n')}`;
  }
  const region = 'Boké';
  const list = tops(null, region);
  return `Classement ${region}\n${list.map((p, i) => `${i + 1}. ${p.nom} — ${p.categorie}`).join('\n')}`;
}

export function getIAInsights(dateRange) {
  const gaps = getOpportunityGaps(3, dateRange);
  const topCats = getTopCategories(3, dateRange);
  const kpis = getPlatformKPIs(dateRange);
  const trends = topCats.map((c) => `Forte activité — ${c.label} (${c.value} pros / recherches)`);
  const recommendations = gaps.map((g) => `Recruter des ${g.cat.split(' ')[0]} à ${g.region} (${g.pros} pro(s) pour ${g.searches} recherches estimées)`);
  const alerts = [
    kpis.pendingReports > 0 ? `${kpis.pendingReports} signalement(s) en attente sur la période` : null,
    gaps[0] ? `Sous-représentation : ${gaps[0].cat} à ${gaps[0].region}` : null,
    `Croissance annuaire : +${kpis.growthPct}% sur ${kpis.periodDays} j`,
  ].filter(Boolean);
  return { trends, recommendations, alerts };
}

export function findDuplicateGroups() {
  const map = {};
  getProsWithAdminState().forEach((p) => {
    const key = `${p.nom.trim().toLowerCase()}|${p.region}`;
    if (!map[key]) map[key] = [];
    map[key].push(p);
  });
  return Object.values(map).filter((g) => g.length > 1);
}
