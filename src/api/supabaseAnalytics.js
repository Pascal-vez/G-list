import { supabase, useSupabase } from '../lib/supabaseClient';

const EMPTY_PRO_METRICS = {
  views: 0,
  whatsapp: 0,
  favorites: 0,
  reviews: 0,
  avgRating: 0,
  viewsTrend: 0,
  whatsappTrend: 0,
  daily: [],
};

const EMPTY_PLATFORM = {
  totalPros: 0,
  totalUsers: 0,
  verified: 0,
  premium: 0,
  advanced: 0,
  totalViews: 0,
  whatsappClicks: 0,
  totalReviews: 0,
  platformReviews: 0,
  newPros: 0,
  daily: [],
  byCategory: [],
  byRegion: [],
};

export async function fetchProAnalytics(legacyProId, startDate, endDate) {
  if (!useSupabase || !supabase) return EMPTY_PRO_METRICS;
  const { data, error } = await supabase.rpc('get_pro_analytics_by_legacy', {
    p_legacy_id: Number(legacyProId),
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) throw error;
  return { ...EMPTY_PRO_METRICS, ...(data?.metrics || {}) };
}

export async function fetchPlatformAnalytics(startDate, endDate) {
  if (!useSupabase || !supabase) return EMPTY_PLATFORM;
  const { data, error } = await supabase.rpc('get_platform_analytics', {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) throw error;
  return { ...EMPTY_PLATFORM, ...(data?.metrics || {}) };
}
