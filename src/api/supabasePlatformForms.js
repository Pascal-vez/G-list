import { supabase, useSupabase } from '../lib/supabaseClient';

function parseRpcPayload(data) {
  if (data == null) return null;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return null; }
  }
  return data;
}

export async function submitContactSupabase(form) {
  if (!supabase) throw new Error('Supabase non configuré');
  const { data, error } = await supabase.rpc('submit_contact_message', {
    p_nom: form.nom,
    p_email: form.email,
    p_sujet: form.sujet || null,
    p_message: form.message,
  });
  if (error) throw new Error(error.message || 'Envoi contact impossible');
  const payload = parseRpcPayload(data);
  if (payload?.ok === false) throw new Error(payload.message || 'Envoi contact impossible');
  return payload;
}

export async function submitReportSupabase(report) {
  if (!supabase) throw new Error('Supabase non configuré');
  const legacyId = Number(report.proId);
  const { data, error } = await supabase.rpc('submit_platform_report', {
    p_legacy_pro_id: Number.isFinite(legacyId) ? legacyId : null,
    p_pro_nom: report.proNom || null,
    p_reason: report.reason,
    p_details: report.details || null,
    p_reporter_email: report.reporterEmail || null,
  });
  if (error) throw new Error(error.message || 'Signalement impossible');
  const payload = parseRpcPayload(data);
  if (payload?.ok === false) throw new Error(payload.message || 'Signalement impossible');
  return payload;
}

export async function fetchContactMessagesSupabase() {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('list_contact_messages');
  if (error) throw error;
  const payload = parseRpcPayload(data);
  return payload?.messages || [];
}

export async function fetchReportsSupabase() {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('list_platform_reports');
  if (error) throw error;
  const payload = parseRpcPayload(data);
  return payload?.reports || [];
}

export async function updateReportStatusSupabase(id, status) {
  if (!supabase) throw new Error('Supabase non configuré');
  const { data, error } = await supabase.rpc('update_platform_report_status', {
    p_report_id: Number(id),
    p_status: status,
  });
  if (error) throw new Error(error.message || 'Mise à jour impossible');
  return parseRpcPayload(data);
}

export { useSupabase };
