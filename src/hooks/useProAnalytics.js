import { useState, useEffect } from 'react';
import { useSupabase } from '../lib/supabaseClient';
import { fetchProAnalytics } from '../api/supabaseAnalytics';
import { getAccountMetricsForRange, getChartDataForRange } from '../utils/proAnalytics';

const EMPTY = {
  views: 0,
  whatsapp: 0,
  profileClicks: 0,
  engagement: '0',
  favorites: 0,
  quotes: 0,
  viewsTrend: 0,
  whatsappTrend: 0,
  favoritesTrend: 0,
  sources: { direct: 0, category: 0, region: 0 },
  visibilityScore: 0,
};

function metricsFromRemote(m) {
  const views = m.views || 0;
  const whatsapp = m.whatsapp || 0;
  return {
    views,
    whatsapp,
    profileClicks: views,
    engagement: views ? ((whatsapp / views) * 100).toFixed(1) : '0',
    favorites: m.favorites || 0,
    quotes: 0,
    viewsTrend: m.viewsTrend || 0,
    whatsappTrend: m.whatsappTrend || 0,
    favoritesTrend: 0,
    sources: { direct: 0, category: 0, region: 0 },
    visibilityScore: Math.min(100, Math.round((m.avgRating || 0) * 14 + (m.reviews || 0) * 2.5 + views * 0.04)),
    daily: m.daily || [],
  };
}

export function useProAnalytics(account, dateRange) {
  const [metrics, setMetrics] = useState(EMPTY);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const startDate = dateRange?.startDate;
  const endDate = dateRange?.endDate;

  useEffect(() => {
    if (!account?.id || !startDate || !endDate) {
      setMetrics(EMPTY);
      setChartData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        if (useSupabase) {
          const remote = await fetchProAnalytics(account.id, startDate, endDate);
          if (cancelled) return;
          const built = metricsFromRemote(remote);
          setMetrics(built);
          setChartData((remote.daily || []).map((d) => ({
            label: new Date(d.day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            value: d.views || 0,
            date: d.day,
          })));
        } else {
          const local = getAccountMetricsForRange(account, startDate, endDate);
          if (cancelled) return;
          setMetrics(local);
          setChartData(getChartDataForRange(account.id, startDate, endDate));
        }
      } catch {
        if (!cancelled) {
          setMetrics(EMPTY);
          setChartData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [account?.id, startDate, endDate]);

  return { metrics, chartData, loading };
}
