import { useState, useEffect } from 'react';
import { useSupabase } from '../lib/supabaseClient';
import { fetchPlatformAnalytics } from '../api/supabaseAnalytics';
import { getPlatformKPIs, getActivitySeries, getTopCategories, getTopRegions } from '../utils/adminAnalytics';

export function usePlatformAnalytics(dateRange) {
  const [kpis, setKpis] = useState(null);
  const [activity, setActivity] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [topRegions, setTopRegions] = useState([]);
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
            totalUsers: remote.totalUsers ?? remote.totalPros,
            verified: remote.verified,
            premium: remote.premium,
            advanced: remote.advanced,
            totalViews: remote.totalViews,
            totalSearches: remote.totalSearches ?? 0,
            pendingReports: remote.pendingReports ?? 0,
            waitlistCount: remote.waitlistCount ?? 0,
            whatsappClicks: remote.whatsappClicks,
            evalCount: 0,
            growthPct: remote.newPros > 0 ? Math.min(100, remote.newPros * 5) : 0,
            periodDays: Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1),
            totalReviews: remote.totalReviews,
            platformReviews: remote.platformReviews ?? 0,
            newPros: remote.newPros,
          });
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
          setTopCategories(getTopCategories(range));
          setTopRegions(getTopRegions(range));
        }
      } catch {
        if (!cancelled) {
          setKpis(null);
          setActivity([]);
          setTopCategories([]);
          setTopRegions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [startDate, endDate]);

  return { kpis, activity, topCategories, topRegions, loading };
}
