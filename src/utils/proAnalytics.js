import { getAllProfessionals } from '../api/professionals';
import { CATEGORIES } from '../data/constants';
import {
  getProStats, getProReviews, getProPhotos, getQuoteRequests, getCrmProspects,
  getReviewResponse,
} from './storage';
import {
  daysBetween, getPreviousPeriod, parseISODate, toISO, filterByDateRange, downsampleChartData,
} from './dateRange';

function hashSeed(n) {
  let x = Math.abs(Number(n) || 1);
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

export function getDailyViewsSeries(accountId, days = 30) {
  const stats = getProStats(accountId);
  const base = Math.max(2, Math.floor((stats.views || 0) / days) || 3);
  const rand = hashSeed(accountId);
  return Array.from({ length: days }, (_, i) => ({
    label: `${i + 1}`,
    value: Math.max(0, base + Math.floor(rand() * base * 1.2) - 1),
  }));
}

export function getDailyViewsSeriesForRange(accountId, startDate, endDate) {
  const days = daysBetween(startDate, endDate);
  const base = getDailyViewsSeries(accountId, days);
  const start = parseISODate(startDate);
  const showYear = days > 60;

  return base.map((point, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return {
      ...point,
      date: toISO(d),
      label: d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        ...(showYear ? { year: '2-digit' } : {}),
      }),
    };
  });
}

export function getChartDataForRange(accountId, startDate, endDate, maxPoints = 24) {
  return downsampleChartData(getDailyViewsSeriesForRange(accountId, startDate, endDate), maxPoints);
}

function sumSeries(series) {
  return series.reduce((sum, point) => sum + (point.value || 0), 0);
}

export function getAccountMetricsForRange(account, startDate, endDate) {
  const series = getDailyViewsSeriesForRange(account.id, startDate, endDate);
  const views = sumSeries(series);

  const prev = getPreviousPeriod(startDate, endDate);
  const prevViews = sumSeries(getDailyViewsSeriesForRange(account.id, prev.startDate, prev.endDate));
  const viewsTrend = prevViews ? Math.round(((views - prevViews) / prevViews) * 100) : (views ? 100 : 0);

  const whatsapp = Math.round(views * 0.28);
  const profileClicks = Math.floor(views * 0.62);
  const engagement = views ? ((whatsapp / views) * 100).toFixed(1) : '0';
  const base = getAccountMetrics(account);
  const span = daysBetween(startDate, endDate);
  const favorites = Math.max(0, Math.round((base.favorites || 0) * (span / 90)));
  const quotes = filterByDateRange(getQuoteRequests(account.id), startDate, endDate).length;

  return {
    views,
    whatsapp,
    profileClicks,
    engagement,
    favorites,
    quotes,
    viewsTrend,
    whatsappTrend: viewsTrend > 0 ? Math.round(viewsTrend * 0.7) : viewsTrend,
    favoritesTrend: favorites ? Math.min(viewsTrend, 15) : 0,
    sources: base.sources,
    visibilityScore: base.visibilityScore,
  };
}

export function getAccountMetrics(account) {
  const stats = getProStats(account.id);
  const views = stats.views || account.profileViews || 0;
  const whatsapp = stats.whatsappClicks || Math.floor(views * 0.28);
  const profileClicks = Math.floor(views * 0.62);
  const engagement = views ? ((whatsapp / views) * 100).toFixed(1) : '0';
  const favorites = stats.favorites || 0;
  const quotes = getQuoteRequests(account.id).length;

  const direct = 42 + (account.id % 12);
  const category = 28 + (account.id % 8);
  const region = 100 - direct - category;

  return {
    views,
    whatsapp,
    profileClicks,
    engagement,
    favorites,
    quotes,
    sources: { direct, category, region },
    visibilityScore: Math.min(100, Math.round(
      (account.note || 0) * 14
      + (account.nombreAvis || 0) * 2.5
      + views * 0.04
      + (account.verifie ? 8 : 0),
    )),
  };
}

export function computeReputationBreakdown(account, completionPct) {
  const reviews = getProReviews(account.id);
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.note, 0) / reviews.length
    : 0;
  const stats = getProStats(account.id);

  const completeness = Math.round((completionPct / 100) * 25);
  const quality = Math.min(25, Math.round(avg * 5));
  const activity = Math.min(25, Math.round((stats.views || account.profileViews || 0) / 8));
  const engagement = Math.min(25, Math.round((stats.whatsappClicks || 0) * 2 + reviews.length * 2));

  return [
    { label: 'Complétude profil', pts: completeness, max: 25 },
    { label: 'Qualité avis', pts: quality, max: 25 },
    { label: 'Activité récente', pts: activity, max: 25 },
    { label: 'Engagement visiteurs', pts: engagement, max: 25 },
  ];
}

export function getCategoryRank(account) {
  const catName = CATEGORIES.find((c) => c.id === account.categorie)?.name || account.categorie;
  const all = getAllProfessionals();
  const peers = all
    .filter((p) => p.categorie === catName)
    .sort((a, b) => b.note - a.note || b.nombreAvis - a.nombreAvis);
  const idx = peers.findIndex((p) => p.id === account.id);
  const regionPeers = all
    .filter((p) => p.region === account.region)
    .sort((a, b) => b.note - a.note);
  const regionIdx = regionPeers.findIndex((p) => p.id === account.id);
  return {
    categoryLabel: catName,
    categoryRank: idx >= 0 ? idx + 1 : peers.length + 1,
    categoryTotal: peers.length,
    regionRank: regionIdx >= 0 ? regionIdx + 1 : regionPeers.length + 1,
    regionTotal: regionPeers.length,
    top5: peers.slice(0, 5),
  };
}

export function buildProSuggestions(account, completionPct) {
  const suggestions = [];
  const reviews = getProReviews(account.id);
  const photos = getProPhotos(account.id);

  if (completionPct < 80) {
    suggestions.push({ text: `Profil complété à ${completionPct}% — enrichissez votre fiche`, action: 'Modifier profil', tab: 'profile', priority: 'high' });
  }
  if (!account.description || account.description.length < 40) {
    suggestions.push({ text: 'Description trop courte — détaillez vos services', action: 'Modifier profil', tab: 'profile', priority: 'medium' });
  }
  if (!photos.length) {
    suggestions.push({ text: 'Ajoutez des photos pour +40% de visibilité estimée', action: 'Ajouter photos', tab: 'photos', priority: 'high' });
  }
  if (reviews.length && reviews.some((r) => !r.responded)) {
    suggestions.push({ text: 'Répondez aux avis pour renforcer la confiance', action: 'Voir avis', tab: 'reviews', priority: 'medium' });
  }
  if (!(account.services?.length)) {
    suggestions.push({ text: 'Listez vos services pour apparaître dans plus de recherches', action: 'Services', tab: 'services', priority: 'medium' });
  }
  if (!account.slogan) {
    suggestions.push({ text: 'Ajoutez un slogan accrocheur sur votre profil', action: 'Modifier profil', tab: 'profile', priority: 'low' });
  }
  return suggestions.slice(0, 5);
}

export function buildProAlerts(account) {
  const metrics = getAccountMetrics(account);
  const prospects = getCrmProspects(account.id);
  const reviews = getProReviews(account.id);
  const newProspects = prospects.filter((p) => p.column === 'nouveau').length;
  const unanswered = reviews.filter((r) => !getReviewResponse(account.id, r.id)).length;
  const today = new Date().toISOString().slice(0, 10);
  const alerts = [];

  if (reviews.length > 0) {
    alerts.push({
      eventId: 'new_review',
      text: `${reviews.length} avis sur votre fiche — dernier avis récent`,
      date: reviews[0]?.date || today,
      level: 'medium',
    });
  }
  if (unanswered > 0) {
    alerts.push({
      eventId: 'unanswered_reviews',
      text: `${unanswered} avis sans réponse — répondez pour renforcer la confiance`,
      date: today,
      level: 'medium',
    });
  }
  if (newProspects > 0) {
    alerts.push({
      eventId: 'new_crm_prospect',
      text: `${newProspects} nouveau(x) prospect(s) CRM en attente`,
      date: today,
      level: 'high',
    });
  }
  if (metrics.views < 20) {
    alerts.push({
      eventId: 'low_visibility',
      text: 'Visibilité faible — complétez votre profil et ajoutez des photos',
      date: today,
      level: 'medium',
    });
  }
  const rank = getCategoryRank(account);
  if (rank.categoryRank > 5) {
    alerts.push({
      eventId: 'ranking_drop',
      text: `Vous êtes #${rank.categoryRank} dans ${rank.categoryLabel} — optimisez votre fiche`,
      date: today,
      level: 'medium',
    });
  }
  alerts.push({
    eventId: 'high_demand_region',
    text: `Forte demande détectée à ${account.region} cette semaine`,
    date: today,
    level: 'high',
  });
  return alerts;
}
