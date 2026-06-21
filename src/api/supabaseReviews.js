import { supabase, useSupabase } from '../lib/supabaseClient';

function rowToReview(row) {
  if (!row) return null;
  return {
    id: row.id,
    prenom: row.author_name,
    note: row.rating,
    commentaire: row.comment,
    date: row.created_at ? row.created_at.split('T')[0] : '',
    response: row.response_text
      ? { text: row.response_text, date: row.response_at }
      : null,
  };
}

export async function fetchReviewsByLegacy(legacyProId) {
  if (!useSupabase || !supabase) return [];
  const { data, error } = await supabase.rpc('get_reviews_by_legacy', {
    p_legacy_id: Number(legacyProId),
  });
  if (error) throw error;
  const rows = data?.reviews;
  if (!Array.isArray(rows)) return [];
  return rows.map(rowToReview).filter(Boolean);
}

export async function addReviewByLegacy(legacyProId, { prenom, note, commentaire }) {
  if (!useSupabase || !supabase) throw new Error('Supabase requis');
  const { data, error } = await supabase.rpc('add_review_by_legacy', {
    p_legacy_id: Number(legacyProId),
    p_author_name: prenom,
    p_rating: note,
    p_comment: commentaire,
  });
  if (error) throw error;
  return rowToReview(data?.review ? {
    id: data.review.id,
    author_name: data.review.author_name,
    rating: data.review.rating,
    comment: data.review.comment,
    created_at: data.review.created_at,
  } : null);
}

export async function saveReviewResponseByLegacy(legacyProId, reviewId, text) {
  if (!useSupabase || !supabase) throw new Error('Supabase requis');
  const { error } = await supabase.rpc('upsert_review_response_by_legacy', {
    p_legacy_id: Number(legacyProId),
    p_review_id: Number(reviewId),
    p_text: text,
  });
  if (error) throw error;
  return { ok: true };
}

export async function recordProfileEvent(legacyProId, eventType = 'profile_view') {
  if (!useSupabase || !supabase) return { ok: false };
  const { error } = await supabase.rpc('record_profile_event', {
    p_legacy_id: Number(legacyProId),
    p_event_type: eventType,
  });
  if (error) {
    console.warn('[events]', error.message);
    return { ok: false };
  }
  return { ok: true };
}
