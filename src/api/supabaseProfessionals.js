import { supabase, useSupabase } from '../lib/supabaseClient';
import { getCoordinates } from '../data/coordinates';
import { enrichProfessional } from '../utils/proEnhancements';

function resolvePlanFromAccount(account) {
  if (!account) return 'free';
  if (account.plan === 'premium' || account.premium) return 'premium';
  if (account.plan === 'advanced') return 'advanced';
  return 'free';
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Transforme une ligne Supabase en objet annuaire (id = legacy_local_id). */
export function rowToAnnuaireProfessional(row) {
  if (!row?.id) return null;

  const id = Number(row.id);
  const plan = row.plan || 'free';

  return enrichProfessional({
    id,
    nom: row.nom || 'Professionnel',
    profession: row.profession || '',
    categorie: row.categorie || 'Services',
    region: row.region || 'Conakry',
    quartier: row.quartier || 'Centre',
    telephone: row.telephone || '',
    whatsapp: row.whatsapp || row.telephone || '',
    description: row.description || '',
    slogan: row.slogan || '',
    verifie: Boolean(row.verifie),
    note: Number(row.note) || 0,
    nombreAvis: Number(row.nombre_avis) || 0,
    horaires: row.horaires || 'Lun-Sam 8h-18h',
    specialites: parseJsonArray(row.specialites),
    services: parseJsonArray(row.services),
    social: row.social && typeof row.social === 'object' ? row.social : {},
    avis: [],
    plan,
    premium: plan === 'premium',
    profileViews: row.profile_views ?? 0,
    whatsappClicks: row.whatsapp_clicks ?? 0,
    ...getCoordinates(row.region, row.quartier, id),
  });
}

export async function fetchAnnuaireFromSupabase({ includeHidden = false } = {}) {
  if (!useSupabase || !supabase) return [];

  const { data, error } = await supabase.rpc('list_annuaire_professionals', {
    p_include_hidden: includeHidden,
  });

  if (!error) {
    const rows = data?.professionals;
    if (Array.isArray(rows)) {
      return rows.map(rowToAnnuaireProfessional).filter(Boolean);
    }
  }

  if (error && error.code !== 'PGRST202' && !error.message?.includes('Could not find the function')) {
    console.warn('[annuaire] list_annuaire_professionals:', error.message);
  }

  return fetchAnnuaireDirectFromTable();
}

/** Fallback : lecture directe (RLS public select) si RPC pas encore déployée. */
async function fetchAnnuaireDirectFromTable() {
  const { data, error } = await supabase
    .from('professionals')
    .select(`
      legacy_local_id, nom, profession, categorie, region, quartier,
      telephone, whatsapp, description, slogan, plan, horaires,
      specialites, services, social, verifie, profile_views, updated_at
    `)
    .not('legacy_local_id', 'is', null)
    .order('updated_at', { ascending: false });

  if (error || !data?.length) return [];

  return data.map((row) => rowToAnnuaireProfessional({
    id: row.legacy_local_id,
    nom: row.nom,
    profession: row.profession,
    categorie: row.categorie,
    region: row.region,
    quartier: row.quartier,
    telephone: row.telephone,
    whatsapp: row.whatsapp,
    description: row.description,
    slogan: row.slogan,
    plan: row.plan,
    horaires: row.horaires,
    specialites: row.specialites,
    services: row.services,
    social: row.social,
    verifie: row.verifie,
    profile_views: row.profile_views,
    note: 0,
    nombre_avis: 0,
  })).filter(Boolean);
}

export async function fetchAnnuaireProfessionalById(legacyId) {
  if (!useSupabase || !supabase) return null;

  const id = Number(legacyId);
  if (!Number.isFinite(id)) return null;

  const { data, error } = await supabase.rpc('get_annuaire_professional', {
    p_legacy_id: id,
  });

  if (!error && data?.professional) {
    return rowToAnnuaireProfessional(data.professional);
  }

  const { data: row } = await supabase
    .from('professionals')
    .select(`
      legacy_local_id, nom, profession, categorie, region, quartier,
      telephone, whatsapp, description, slogan, plan, horaires,
      specialites, services, social, verifie, profile_views
    `)
    .eq('legacy_local_id', id)
    .maybeSingle();

  if (!row) return null;

  return rowToAnnuaireProfessional({
    id: row.legacy_local_id,
    nom: row.nom,
    profession: row.profession,
    categorie: row.categorie,
    region: row.region,
    quartier: row.quartier,
    telephone: row.telephone,
    whatsapp: row.whatsapp,
    description: row.description,
    slogan: row.slogan,
    plan: row.plan,
    horaires: row.horaires,
    specialites: row.specialites,
    services: row.services,
    social: row.social,
    verifie: row.verifie,
    profile_views: row.profile_views,
    note: 0,
    nombre_avis: 0,
  });
}

/** Publie / met à jour la fiche annuaire Supabase depuis un compte pro. */
export async function upsertProfessionalProfileToSupabase(account) {
  if (!useSupabase || !supabase || !account?.id) {
    return { ok: false, reason: 'NO_SUPABASE' };
  }

  const legacyId = Number(account.id);
  if (!Number.isFinite(legacyId)) return { ok: false, reason: 'INVALID_ID' };

  const services = Array.isArray(account.services)
    ? account.services
    : [];
  const specialites = Array.isArray(account.specialites)
    ? account.specialites
    : [];

  const { data, error } = await supabase.rpc('upsert_professional_by_legacy', {
    p_legacy_id: legacyId,
    p_nom: account.nom || 'Professionnel',
    p_profession: account.profession || 'Professionnel',
    p_categorie: account.categorie || 'Services',
    p_region: account.region || 'Conakry',
    p_quartier: account.quartier || 'Centre',
    p_telephone: account.telephone || '000000000',
    p_whatsapp: account.whatsapp || account.telephone || null,
    p_description: account.description || '',
    p_slogan: account.slogan || '',
    p_plan: resolvePlanFromAccount(account),
    p_horaires: account.horaires || 'Lun-Sam 8h-18h',
    p_social: account.social || {},
    p_services: services,
    p_specialites: specialites,
    p_verifie: Boolean(account.verifie),
  });

  if (error) {
    const outdated = error.code === 'PGRST202' || error.message?.includes('Could not find the function');
    if (outdated) {
      const fallback = await supabase.rpc('upsert_minisite_by_legacy', {
        p_legacy_id: legacyId,
        p_slug: `profil-${legacyId}`,
        p_published: false,
        p_nom: account.nom || 'Professionnel',
        p_profession: account.profession || 'Professionnel',
        p_categorie: account.categorie || 'Services',
        p_region: account.region || 'Conakry',
        p_quartier: account.quartier || 'Centre',
        p_telephone: account.telephone || '000000000',
        p_whatsapp: account.whatsapp || account.telephone || null,
        p_description: account.description || '',
        p_slogan: account.slogan || '',
        p_plan: resolvePlanFromAccount(account),
        p_horaires: account.horaires || 'Lun-Sam 8h-18h',
        p_social: account.social || {},
      });
      if (!fallback.error) return { ok: true, professionalId: null };
      return { ok: false, reason: fallback.error.message };
    }
    return { ok: false, reason: error.message };
  }

  if (data?.ok !== false && account.email) {
    await supabase.rpc('link_professional_email', {
      p_legacy_id: legacyId,
      p_email: account.email,
    }).catch(() => {});
  }

  return { ok: data?.ok !== false, professionalId: data?.professional_id };
}

/** Récupère le profil pro depuis Supabase par email (connexion multi-appareils). */
export async function fetchProProfileByEmailFromSupabase(email) {
  if (!useSupabase || !supabase || !email) return null;
  try {
    const { data, error } = await supabase.rpc('get_professional_by_email', {
      p_email: email,
    });
    if (error || !data?.found) return null;
    const plan = data.plan || 'free';
    return {
      id: data.id,
      nom: data.nom || '',
      prenom: '',
      profession: data.profession || '',
      categorie: data.categorie || 'Services',
      region: data.region || 'Conakry',
      quartier: data.quartier || 'Centre',
      telephone: data.telephone || '',
      whatsapp: data.whatsapp || data.telephone || '',
      description: data.description || '',
      slogan: data.slogan || '',
      plan,
      planActif: data.plan_actif === true,
      planDebut: data.premium_since || null,
      planFin: data.premium_expires || null,
      premium: plan === 'premium',
      premiumExpires: data.premium_expires || null,
      horaires: data.horaires || 'Lun-Sam 8h-18h',
      specialites: parseJsonArray(data.specialites),
      services: parseJsonArray(data.services),
      social: data.social && typeof data.social === 'object' ? data.social : {},
      verifie: Boolean(data.verifie),
      profileViews: data.profile_views || 0,
      whatsappClicks: 0,
    };
  } catch {
    return null;
  }
}
