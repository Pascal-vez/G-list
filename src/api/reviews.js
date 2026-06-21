import { useSupabase } from '../lib/supabaseClient';
import {
  fetchReviewsByLegacy,
  addReviewByLegacy,
  saveReviewResponseByLegacy,
  recordProfileEvent,
} from './supabaseReviews';
import { getProReviews, addProReview as addLocalReview } from '../utils/storage';

export async function fetchReviews(proId) {
  if (useSupabase) return fetchReviewsByLegacy(proId);
  return getProReviews(proId);
}

export async function postReview(proId, review) {
  if (useSupabase) {
    const saved = await addReviewByLegacy(proId, review);
    return saved || review;
  }
  addLocalReview(proId, review);
  return review;
}

export async function postReviewResponse(proId, reviewId, text) {
  if (useSupabase) return saveReviewResponseByLegacy(proId, reviewId, text);
  const { setReviewResponse } = await import('../utils/storage');
  setReviewResponse(proId, reviewId, text);
  return { ok: true };
}

export async function trackProfileView(proId) {
  if (useSupabase) return recordProfileEvent(proId, 'profile_view');
  const { incrementProView } = await import('../utils/storage');
  incrementProView(proId);
}

export async function trackWhatsAppClick(proId) {
  if (useSupabase) return recordProfileEvent(proId, 'whatsapp_click');
  const { incrementWhatsAppClick } = await import('../utils/storage');
  incrementWhatsAppClick(proId);
}
