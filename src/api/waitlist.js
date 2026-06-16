import { apiConfig } from './config';
import { apiRequest } from './client';
import { addWaitlistEntry } from '../utils/storage';

export async function submitWaitlist(entry) {
  if (apiConfig.useRemoteApi) {
    return apiRequest('/waitlist', { method: 'POST', body: JSON.stringify(entry) });
  }
  return addWaitlistEntry(entry);
}
