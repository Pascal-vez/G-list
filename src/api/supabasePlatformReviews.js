import { supabase, useSupabase } from '../lib/supabaseClient';

export async function fetchPlatformReviewStats() {
  if (!useSupabase || !supabase) return { count: 0, avg: 0 };
  const { data, error } = await supabase.rpc('get_platform_review_stats');
  if (error) throw error;
  return { count: data?.count ?? 0, avg: data?.avg ?? 0 };
}

export async function fetchPlatformReviews({ offset = 0, limit = 4, includeHidden = false } = {}) {
  if (!useSupabase || !supabase) return { total: 0, reviews: [] };
  const { data, error } = await supabase.rpc('list_platform_reviews', {
    p_offset: offset,
    p_limit: limit,
    p_include_hidden: includeHidden,
  });
  if (error) throw error;
  return { total: data?.total ?? 0, reviews: data?.reviews ?? [] };
}

export async function addPlatformReview({ authorName, rating, comment }) {
  if (!useSupabase || !supabase) throw new Error('Supabase requis');
  const { data, error } = await supabase.rpc('add_platform_review', {
    p_author_name: authorName,
    p_rating: rating,
    p_comment: comment,
  });
  if (error) throw error;
  return data;
}

export async function hidePlatformReview(id, hidden = true) {
  if (!useSupabase || !supabase) return { ok: false };
  const { error } = await supabase.rpc('hide_platform_review', { p_id: id, p_hidden: hidden });
  if (error) throw error;
  return { ok: true };
}

export async function deletePlatformReview(id) {
  if (!useSupabase || !supabase) return { ok: false };
  const { error } = await supabase.rpc('delete_platform_review', { p_id: id });
  if (error) throw error;
  return { ok: true };
}
