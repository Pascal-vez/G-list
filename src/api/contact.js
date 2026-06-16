import { apiConfig } from './config';
import { apiRequest } from './client';
import { addContactMessage } from '../utils/storage';

export async function submitContact(form) {
  if (apiConfig.useRemoteApi) {
    return apiRequest('/contact', { method: 'POST', body: JSON.stringify(form) });
  }
  return addContactMessage(form);
}
