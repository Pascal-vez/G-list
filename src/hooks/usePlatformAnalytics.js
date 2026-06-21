import { useState, useEffect } from 'react';
import { useSupabase } from '../lib/supabaseClient';
import { fetchPlatformAnalytics } from '../api/supabaseAnalytics';
import { getPlatformKPIs, getActivitySeries, getTopCategories, getTopRegions, getRevenueStats, getOpportunityGaps } from '../utils/adminAnalytics';

export function usePlatformAnalytics(dateRange) {
  const [kpis, setKpis] = useState(null);
  const [activity, setActivity] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [topRegions, setTopRegions] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const startDate = dateRange?.startDate;
  const endDate = dateRange?.endDate;

  useEffect(() => {
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        if (useSupabase) {
          const remote = await fetchPlatformAnalytics(startDate, endDate);
          if (cancelled) return;
          setKpis({
            totalPros: remote.totalPros,
            verified: remote.verified,
            premium: remote.premium,
            advanced: remote.advanced,
            totalUsers: remote.totalUsers,
            totalViews: remote.totalViews,
            totalSearches: remote.totalSearches,
            pendingReports: 0,
            waitlistCount: 0,
            whatsappClicks: remote.whatsappClicks,
            evalCount: 0,
            growthPct: remote.newPros > 0 ? Math.min(100, remote.newPros * 5) : 0,
            periodDays: Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1),
            totalReviews: remote.totalReviews,
            newPros: remote.newPros,
          });
          setRevenue({
            free: remote.free,
            advanced: remote.advanced,
            premium: remote.premium,
            mrr: remote.mrr,
            series: (remote.daily || []).map((d) => ({
              label: new Date(d.day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
              value: Math.round((remote.mrr || 0) / Math.max((remote.daily || []).length, 1)),
            })),
          });
          setOpportunities((remote.opportunities || []).map((o) => ({
            cat: o.cat,
            region: o.region,
            searches: o.searches || 0,
            pros: o.pros || 0,
            score: Math.round(Number(o.score) || 0),
          })));
          setActivity((remote.daily || []).map((d) => ({
            label: new Date(d.day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            value: d.views || 0,
          })));
          setTopCategories((remote.byCategory || []).map((c) => ({ name: c.name, count: c.count })));
          setTopRegions((remote.byRegion || []).map((r) => ({ name: r.name, count: r.count })));
        } else {
          const range = { startDate, endDate };
          if (cancelled) return;
          setKpis(getPlatformKPIs(range));
          setActivity(getActivitySeries(range));
          setTopCategories(getTopCategories(5, range).map((c) => ({ name: c.label, count: c.value })));
          setTopRegions(getTopRegions(5).map((r) => ({ name: r.label, count: r.value })));
          setRevenue(getRevenueStats(range));
          setOpportunities(getOpportunityGaps(10, range));
        }
      } catch {
        if (!cancelled) {
          setKpis(null);
          setActivity([]);
          setTopCategories([]);
          setTopRegions([]);
          setRevenue(null);
          setOpportunities([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [startDate, endDate]);

  return { kpis, activity, topCategories, topRegions, revenue, opportunities, loading };
}

export function useHomePlatformStats() {
  const [stats, setStats] = useState({ totalSearches: 0, totalReviews: 0 });

  useEffect(() => {
    if (!useSupabase) {
      setStats({ totalSearches: 0, totalReviews: 0 });
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];
    fetchPlatformAnalytics(startDate, endDate)
      .then((m) => setStats({
        totalSearches: m.totalSearches || 0,
        totalReviews: m.totalReviews || 0,
      }))
      .catch(() => setStats({ totalSearches: 0, totalReviews: 0 }));
  }, []);

  return stats;
}
