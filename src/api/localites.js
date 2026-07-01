import { supabase, useSupabase } from '../lib/supabaseClient';
import { estPrefectureOfficielle, titreLocalite } from '../utils/localite';

export async function fetchLocalitesPersonnalisees(limit = 50) {
  if (!useSupabase || !supabase) return [];
  const { data, error } = await supabase.rpc('list_localites_personnalisees', { p_limit: limit });
  if (error) {
    console.warn('[localites] list', error.message);
    return [];
  }
  return Array.isArray(data) ? data.map((row) => row.nom).filter(Boolean) : [];
}

export async function upsertLocalitePersonnalisee(nom) {
  const nomPropre = titreLocalite(nom);
  if (!nomPropre || estPrefectureOfficielle(nomPropre)) return { ok: true };

  if (!useSupabase || !supabase) return { ok: false, offline: true };

  const { data, error } = await supabase.rpc('upsert_localite_personnalisee', {
    p_nom: nomPropre,
  });
  if (error) {
    console.warn('[localites] upsert', error.message);
    return { ok: false, error: error.message };
  }
  return data || { ok: true };
}

export async function incrementerUtilisationLocalite(nomLocalite) {
  if (!nomLocalite || estPrefectureOfficielle(nomLocalite)) return;
  if (!useSupabase || !supabase) return;

  const { error } = await supabase.rpc('incrementer_utilisation_localite', {
    p_nom: nomLocalite,
  });
  if (error) console.warn('[localites] increment', error.message);
}
