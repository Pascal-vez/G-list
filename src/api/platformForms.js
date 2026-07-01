import { apiConfig } from './config';
import { apiRequest } from './client';
import { useSupabase } from '../lib/supabaseClient';
import {
  addContactMessage, addReport, getReports,
  getContactMessages, updateReportStatus,
  setItem, KEYS,
} from '../utils/storage';
import {
  submitContactSupabase,
  submitReportSupabase,
  fetchContactMessagesSupabase,
  fetchReportsSupabase,
  updateReportStatusSupabase,
} from './supabasePlatformForms';

/** Synchronise contact / signalements Supabase → cache local admin. */
export async function syncPlatformFormsCache() {
  if (!useSupabase) return;
  try {
    const [contacts, reports] = await Promise.all([
      fetchContactMessagesSupabase(),
      fetchReportsSupabase(),
    ]);
    setItem(KEYS.CONTACT_MESSAGES, contacts);
    setItem(KEYS.REPORTS, reports);
  } catch (err) {
    console.warn('[platformForms] Sync Supabase échouée:', err?.message || err);
  }
}

export async function submitContact(form) {
  if (useSupabase) {
    await submitContactSupabase(form);
    return form;
  }
  if (apiConfig.useRemoteApi) {
    return apiRequest('/contact', { method: 'POST', body: JSON.stringify(form) });
  }
  return addContactMessage(form);
}

export async function submitReport(payload) {
  if (useSupabase) {
    await submitReportSupabase(payload);
    return payload;
  }
  if (apiConfig.useRemoteApi) {
    return apiRequest('/reports', { method: 'POST', body: JSON.stringify(payload) });
  }
  return addReport(payload);
}

export async function fetchReports() {
  if (useSupabase) {
    try {
      return await fetchReportsSupabase();
    } catch {
      return getReports();
    }
  }
  if (apiConfig.useRemoteApi) {
    return apiRequest('/reports');
  }
  return getReports();
}

export async function resolveReportStatus(id, status) {
  if (useSupabase) {
    await updateReportStatusSupabase(id, status);
    const reports = await fetchReportsSupabase();
    setItem(KEYS.REPORTS, reports);
    return reports;
  }
  return updateReportStatus(id, status);
}

export function getCachedContactMessages() {
  return getContactMessages();
}

export function getCachedReports() {
  return getReports();
}
