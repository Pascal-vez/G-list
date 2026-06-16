import { apiConfig } from './config';
import { apiRequest } from './client';
import { addReport, getReports } from '../utils/storage';

export async function submitReport(payload) {
  if (apiConfig.useRemoteApi) {
    return apiRequest('/reports', { method: 'POST', body: JSON.stringify(payload) });
  }
  return addReport(payload);
}

export async function fetchReports() {
  if (apiConfig.useRemoteApi) {
    return apiRequest('/reports');
  }
  return getReports();
}
