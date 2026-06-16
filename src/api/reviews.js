import { apiConfig } from './config';
import { apiRequest } from './client';
import { addProReview, getProReviews } from '../utils/storage';

export async function fetchReviews(proId) {
  if (apiConfig.useRemoteApi) {
    return apiRequest(`/professionals/${proId}/reviews`);
  }
  return getProReviews(proId);
}

export async function postReview(proId, review) {
  if (apiConfig.useRemoteApi) {
    return apiRequest(`/professionals/${proId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }
  addProReview(proId, review);
  return review;
}
