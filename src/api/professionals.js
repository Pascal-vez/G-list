import { getCoordinates } from '../data/coordinates';
import {
  getAllProAccountsList, getAdminOverrides, getProServices, getProPlanLevel,
  isAccountDeleted,
} from '../utils/storage';
import { enrichProfessional } from '../utils/proEnhancements';
import { useSupabase } from '../lib/supabaseClient';
import {
  getProfessionalsCache,
  getProfessionalsHiddenCache,
  refreshProfessionalsCache,
  fetchProfessionalFromCloudById,
  isProfessionalsCacheLoaded,
} from './professionalsStore';

function accountToProfessional(account) {
  const savedServices = getProServices(account.id);
  const services = savedServices.length > 0 ? savedServices : (account.services || []);

  return enrichProfessional({
    id: account.id,
    nom: account.nom,
    profession: account.profession,
    categorie: account.categorie,
    region: account.region,
    quartier: account.quartier || 'Centre',
    telephone: account.telephone,
    whatsapp: account.whatsapp || account.telephone,
    email: account.email,
    description: account.description || '',
    slogan: account.slogan || '',
    verifie: Boolean(account.verifie),
    note: 0,
    nombreAvis: 0,
    horaires: account.horaires || 'Lun-Sam 8h-18h',
    specialites: account.specialites || [],
    services,
    social: account.social || {},
    avis: [],
    plan: getProPlanLevel(account),
    premium: Boolean(account.premium),
    profileViews: account.profileViews || 0,
    ...getCoordinates(account.region, account.quartier, account.id),
  });
}

function getLocalRawProfessionals() {
  return getAllProAccountsList()
    .filter((account) => !isAccountDeleted(account.email))
    .map(accountToProfessional);
}

function applyLocalAdminOverrides(list, { includeHidden = false } = {}) {
  const overrides = getAdminOverrides();
  return list
    .map((p) => {
      const o = overrides[p.id] || {};
      return { ...p, verifie: o.verifie ?? p.verifie };
    })
    .filter((p) => {
      if (includeHidden) return true;
      const o = overrides[p.id] || {};
      return !o.hidden && !o.disabled;
    });
}

function getLocalProfessionals(includeHidden = false) {
  return applyLocalAdminOverrides(getLocalRawProfessionals(), { includeHidden });
}

/** Liste annuaire — Supabase en production, comptes inscrits sinon. */
export function getAllProfessionals() {
  if (useSupabase) return getProfessionalsCache();
  return getLocalProfessionals(false);
}

export function getAllProfessionalsIncludingHidden() {
  if (useSupabase) {
    const hidden = getProfessionalsHiddenCache();
    return hidden.length ? hidden : getProfessionalsCache();
  }
  return getLocalProfessionals(true);
}

export function getProfessionalById(id) {
  const numericId = Number(id);

  if (useSupabase) {
    return getProfessionalsCache().find((p) => p.id === numericId) ?? null;
  }

  const overrides = getAdminOverrides();
  const o = overrides[numericId];
  if (o?.hidden || o?.disabled) return null;
  const pro = getLocalRawProfessionals().find((p) => p.id === numericId) ?? null;
  if (!pro) return null;
  return { ...pro, verifie: o?.verifie ?? pro.verifie };
}

export async function loadProfessionalById(id) {
  if (useSupabase) return fetchProfessionalFromCloudById(id);
  return getProfessionalById(id);
}

export async function ensureProfessionalsLoaded() {
  if (useSupabase && !isProfessionalsCacheLoaded()) {
    await refreshProfessionalsCache();
  }
}

export async function reloadProfessionalsAnnuaire() {
  if (useSupabase) {
    await refreshProfessionalsCache({ includeHidden: true });
    return getProfessionalsCache();
  }
  return getAllProfessionals();
}

export { refreshProfessionalsCache, invalidateProfessionalsCache } from './professionalsStore';

export default getAllProfessionals();
