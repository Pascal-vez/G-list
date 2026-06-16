import staticProfessionals from '../data/professionals';
import { getCoordinates } from '../data/coordinates';
import { getAllProAccountsList, getProReviews, getAdminOverrides } from '../utils/storage';
import { enrichProfessional } from '../utils/proEnhancements';
import { apiConfig } from './config';
import { apiRequest } from './client';

function accountToProfessional(account) {
  const reviews = getProReviews(account.id);
  const note = reviews.length
    ? reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length
    : 0;

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
    note: Math.round(note * 10) / 10,
    nombreAvis: reviews.length,
    horaires: account.horaires || 'Lun-Sam 8h-18h',
    specialites: account.specialites || [],
    services: account.services || [],
    social: account.social || {},
    avis: [],
    plan: account.plan || 'free',
    ...getCoordinates(account.region, account.quartier, account.id),
  });
}

function getRawProfessionals() {
  const staticIds = new Set(staticProfessionals.map((p) => p.id));
  const registered = getAllProAccountsList()
    .filter((account) => !staticIds.has(account.id))
    .map(accountToProfessional);

  return [...staticProfessionals, ...registered];
}

function applyAdminOverrides(list, { includeHidden = false } = {}) {
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

function getLocalProfessionals() {
  return applyAdminOverrides(getRawProfessionals());
}

export function getAllProfessionals() {
  return getLocalProfessionals();
}

export function getAllProfessionalsIncludingHidden() {
  return applyAdminOverrides(getRawProfessionals(), { includeHidden: true });
}

export function getProfessionalById(id) {
  const numericId = Number(id);
  const overrides = getAdminOverrides();
  const o = overrides[numericId];
  if (o?.hidden || o?.disabled) return null;
  const pro = getRawProfessionals().find((p) => p.id === numericId) ?? null;
  if (!pro) return null;
  return { ...pro, verifie: o?.verifie ?? pro.verifie };
}

export async function fetchProfessionals(filters = {}) {
  if (!apiConfig.useRemoteApi) {
    return getAllProfessionals();
  }

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value != null && value !== '' && value !== 'all') {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return apiRequest(`/professionals${query ? `?${query}` : ''}`);
}

export async function fetchProfessionalById(id) {
  if (!apiConfig.useRemoteApi) {
    return getProfessionalById(id);
  }

  return apiRequest(`/professionals/${id}`);
}

/** @deprecated Prefer getAllProfessionals() for fresh data with admin overrides */
export default getAllProfessionals();
