import { supabase, useSupabase } from '../lib/supabaseClient';
import { slugify, syncSitePages } from '../utils/minisite';

function resolvePlanFromAccount(account) {
  if (!account) return 'free';
  if (account.plan === 'premium' || account.premium) return 'premium';
  if (account.plan === 'advanced') return 'advanced';
  return 'free';
}

function accountToRpcPro(account) {
  if (!account) return {};
  return {
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
  };
}

function siteToRow(professionalId, site) {
  const synced = syncSitePages(site);
  return {
    professional_id: professionalId,
    slug: slugify(synced.slug || ''),
    published: synced.published === true,
    template_id: synced.templateId || 'artisan',
    theme: synced.theme || {},
    sections: synced.sections || [],
    pages: synced.pages || [],
    settings: synced.settings || {},
    seo: synced.seo || {},
    locale: synced.locale || {},
    integrations: synced.integrations || {},
    advanced: synced.advanced || {},
    security: synced.security || {},
    updated_at: new Date().toISOString(),
  };
}

/** Résout l'id bigint Supabase à partir de l'id local (timestamp) ou du compte. */
export async function resolveSupabaseProfessionalId(localProId, account = null) {
  if (!supabase) return null;

  const legacyId = Number(localProId);
  if (!Number.isFinite(legacyId)) return null;

  const { data: byLegacy } = await supabase
    .from('professionals')
    .select('id')
    .eq('legacy_local_id', legacyId)
    .maybeSingle();

  if (byLegacy?.id) return byLegacy.id;

  if (account?.supabaseProfessionalId) {
    return account.supabaseProfessionalId;
  }

  if (account?.email) {
    const email = account.email.trim().toLowerCase();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (profile?.id) {
      const { data: pro } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();
      if (pro?.id) return pro.id;
    }
  }

  return null;
}

export async function upsertMinisiteToSupabase(localProId, site, account = null) {
  if (!useSupabase || !supabase) return { ok: false, reason: 'NO_SUPABASE' };

  const legacyId = Number(localProId);
  if (!Number.isFinite(legacyId)) return { ok: false, reason: 'NO_PROFESSIONAL_ROW' };

  const synced = syncSitePages(site);
  const row = siteToRow(0, synced);
  if (!row.slug) return { ok: false, reason: 'NO_SLUG' };

  const { data, error } = await supabase.rpc('upsert_minisite_by_legacy', {
    p_legacy_id: legacyId,
    p_slug: row.slug,
    p_published: row.published,
    p_template_id: row.template_id,
    p_theme: row.theme,
    p_sections: row.sections,
    p_pages: row.pages,
    p_settings: row.settings,
    p_seo: row.seo,
    p_locale: row.locale,
    p_integrations: row.integrations,
    p_advanced: row.advanced,
    p_security: row.security,
    ...accountToRpcPro(account),
  });

  if (error) {
    if (error.message?.includes('PROFESSIONAL_NOT_FOUND')) {
      return { ok: false, reason: 'NO_PROFESSIONAL_ROW' };
    }
    if (error.code === 'PGRST202' || error.message?.includes('Could not find the function')) {
      return { ok: false, reason: 'RPC_OUTDATED' };
    }
    return { ok: false, reason: error.message };
  }

  const payload = typeof data === 'object' ? data : {};
  return {
    ok: true,
    slug: payload.slug || row.slug,
    published: payload.published === true || row.published,
  };
}

export async function fetchPublishedMinisiteSlug(localProId, account = null) {
  if (!useSupabase || !supabase) return null;

  const legacyId = Number(localProId);
  if (!Number.isFinite(legacyId)) return null;

  const { data: viewRow } = await supabase
    .from('published_minisites')
    .select('slug')
    .eq('legacy_local_id', legacyId)
    .maybeSingle();

  if (viewRow?.slug) return slugify(viewRow.slug);

  const professionalId = await resolveSupabaseProfessionalId(localProId, account);
  if (!professionalId) return null;

  const { data } = await supabase
    .from('minisites')
    .select('slug')
    .eq('professional_id', professionalId)
    .eq('published', true)
    .maybeSingle();

  return data?.slug ? slugify(data.slug) : null;
}

function rowToSite(data) {
  return syncSitePages({
    slug: data.slug,
    published: data.published === true,
    templateId: data.template_id,
    theme: data.theme,
    sections: data.sections,
    pages: data.pages,
    settings: data.settings,
    seo: data.seo,
    locale: data.locale,
    integrations: data.integrations,
    advanced: data.advanced,
    security: data.security,
  });
}

function rowToPro(p) {
  if (!p) return null;
  return {
    id: p.legacy_local_id ?? p.id,
    nom: p.nom,
    profession: p.profession,
    categorie: p.categorie,
    region: p.region,
    quartier: p.quartier || 'Centre',
    telephone: p.telephone,
    whatsapp: p.whatsapp || p.telephone,
    description: p.description || '',
    slogan: p.slogan || '',
    plan: p.plan || 'free',
    social: p.social || {},
    horaires: p.horaires || 'Lun-Sam 8h-18h',
  };
}

function buildResolvedFromRpc(data) {
  const site = rowToSite({
    ...data.site,
    slug: data.site.slug,
    published: data.site.published,
    template_id: data.site.template_id,
  });
  const pro = rowToPro(data.pro);
  if (!site || !pro) return null;
  return { proId: pro.id, site, pro };
}

/** Lecture directe (RLS : mini-sites publiés lisibles en anon). */
async function fetchPublishedMinisiteBySlugDirect(normalizedSlug) {
  const { data, error } = await supabase
    .from('minisites')
    .select(`
      slug, published, template_id, theme, sections, pages, settings, seo,
      locale, integrations, advanced, security,
      professionals (
        id, legacy_local_id, nom, profession, categorie, region, quartier,
        telephone, whatsapp, description, slogan, plan, social, horaires
      )
    `)
    .eq('slug', normalizedSlug)
    .eq('published', true)
    .maybeSingle();

  if (error || !data?.professionals) return null;

  const site = rowToSite(data);
  const pro = rowToPro(data.professionals);
  if (!site || !pro) return null;

  return { proId: pro.id, site, pro };
}

/** Charge un mini-site publié par son slug (source Supabase — page publique /pro/:slug). */
export async function resolveMinisiteBySlugFromSupabase(slug) {
  if (!useSupabase || !supabase) return null;

  const normalizedSlug = slugify(slug || '');
  if (!normalizedSlug) return null;

  const { data, error } = await supabase.rpc('get_published_minisite_by_slug', {
    p_slug: normalizedSlug,
  });

  if (!error && data?.site && data?.pro) {
    return buildResolvedFromRpc(data);
  }

  return fetchPublishedMinisiteBySlugDirect(normalizedSlug);
}

const SAVE_ERROR_MESSAGES = {
  NO_SUPABASE: 'Supabase non configuré dans .env',
  NO_PROFESSIONAL_ROW: 'Impossible de créer votre fiche dans Supabase. Exécutez la migration 20250616150000_ensure_professional_legacy.sql.',
  NO_SLUG: 'Le lien du site (slug) est invalide.',
  RPC_OUTDATED: 'Fonction Supabase obsolète — exécutez la migration 20250616150000_ensure_professional_legacy.sql dans le SQL Editor.',
};

export function formatMinisiteSaveError(reason) {
  return SAVE_ERROR_MESSAGES[reason] || reason || 'Erreur lors de la sauvegarde Supabase';
}

/** Sauvegarde cloud (Supabase) — source de vérité en production. */
export async function saveMinisiteRemote(localProId, site, account = null) {
  if (!useSupabase || !supabase) {
    return { ok: false, reason: 'NO_SUPABASE' };
  }

  const res = await upsertMinisiteToSupabase(localProId, site, account);
  if (!res.ok) return res;
  return { ok: true, payload: syncSitePages({ ...site, published: site.published === true }) };
}

/** Supprime la fiche Supabase liée à un id local (compte pro supprimé). */
export async function deleteProfessionalByLegacy(localProId) {
  if (!useSupabase || !supabase) return { ok: true, deleted: false };

  const legacyId = Number(localProId);
  if (!Number.isFinite(legacyId)) return { ok: false, reason: 'INVALID_ID' };

  const { data, error } = await supabase.rpc('delete_professional_by_legacy', {
    p_legacy_id: legacyId,
  });

  if (error) {
    if (error.code === 'PGRST202' || error.message?.includes('Could not find the function')) {
      return { ok: false, reason: 'RPC_OUTDATED' };
    }
    return { ok: false, reason: error.message };
  }

  const payload = typeof data === 'object' ? data : {};
  return { ok: payload.ok !== false, deleted: payload.deleted === true, reason: payload.error };
}

/** Supprime une fiche pro Supabase par slug mini-site (secours). */
export async function deleteProfessionalBySlug(slug) {
  if (!useSupabase || !supabase) return { ok: true, deleted: false };

  const normalizedSlug = slugify(slug || '');
  if (!normalizedSlug) return { ok: false, reason: 'INVALID_SLUG' };

  const { data, error } = await supabase.rpc('delete_professional_by_slug', {
    p_slug: normalizedSlug,
  });

  if (error) {
    if (error.code === 'PGRST202' || error.message?.includes('Could not find the function')) {
      return { ok: false, reason: 'RPC_OUTDATED' };
    }
    return { ok: false, reason: error.message };
  }

  const payload = typeof data === 'object' ? data : {};
  return { ok: payload.ok !== false, deleted: payload.deleted === true, reason: payload.error };
}

/** Supprime toutes les traces cloud d'un compte pro (appelé à la suppression). */
export async function purgeProfessionalCloudOnAccountDelete({ legacyProId, slug, email } = {}) {
  if (!useSupabase || !supabase) return { ok: true, deleted: false };

  const legacyId = legacyProId != null ? Number(legacyProId) : null;
  const normalizedSlug = slug ? slugify(slug) : null;
  const normalizedEmail = email?.trim().toLowerCase() || null;

  const attemptComplete = async () => {
    const { data, error } = await supabase.rpc('delete_professional_complete', {
      p_legacy_id: Number.isFinite(legacyId) ? legacyId : null,
      p_slug: normalizedSlug || null,
      p_email: normalizedEmail || null,
    });
    if (error) {
      if (error.code === 'PGRST202' || error.message?.includes('Could not find the function')) {
        return { ok: false, reason: 'RPC_OUTDATED' };
      }
      return { ok: false, reason: error.message };
    }
    const payload = typeof data === 'object' ? data : {};
    return { ok: payload.ok !== false, deleted: payload.deleted === true };
  };

  let result = await attemptComplete();
  if (result.deleted) return result;

  if (result.reason === 'RPC_OUTDATED') {
    if (Number.isFinite(legacyId)) {
      result = await deleteProfessionalByLegacy(legacyId);
      if (result.deleted) return result;
    }
    if (normalizedSlug) {
      result = await deleteProfessionalBySlug(normalizedSlug);
      if (result.deleted) return result;
    }
  }

  if (!result.ok && result.reason) return result;
  return { ok: true, deleted: result.deleted === true };
}

export async function fetchMinisiteFromSupabase(localProId, account = null) {
  if (!useSupabase || !supabase) return null;

  const legacyId = Number(localProId);
  if (!Number.isFinite(legacyId)) return null;

  const { data: proRow } = await supabase
    .from('professionals')
    .select('id')
    .eq('legacy_local_id', legacyId)
    .maybeSingle();

  if (!proRow?.id) return null;

  const { data, error } = await supabase
    .from('minisites')
    .select('*')
    .eq('professional_id', proRow.id)
    .maybeSingle();

  if (error || !data) return null;

  return rowToSite(data);
}
