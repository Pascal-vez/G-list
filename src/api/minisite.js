import {
  getItem, getAllProAccountsList, getProPlanLevel,
  findProIdByPublishedMinisiteSlug, findMinisiteRecord,
} from '../utils/storage';
import { normalizeMinisite, slugify, syncSitePages } from '../utils/minisite';
import { getProfessionalById } from './professionals';

const MINISITE_KEY = 'glist_minisite';

function isPublishedFlag(value) {
  return value === true || value === 'true';
}

export function resolveMinisiteBySlug(slug) {
  const normalized = slugify(slug);
  const proId = findProIdByPublishedMinisiteSlug(normalized);
  if (!proId) return null;

  const all = getItem(MINISITE_KEY, {});
  const rawSite = all[proId] ?? all[String(proId)] ?? all[Number(proId)] ?? findMinisiteRecord(proId);
  if (!rawSite || !isPublishedFlag(rawSite.published)) return null;

  const pro = getProfessionalById(proId) ?? getProfessionalById(Number(proId));
  const account = getAllProAccountsList().find((a) => String(a.id) === String(proId));
  const owner = pro || account;
  const site = syncSitePages(normalizeMinisite(rawSite, account || owner));

  if (!isPublishedFlag(site?.published)) return null;
  if (getProPlanLevel(owner) !== 'premium') return null;

  return { proId, site, pro: owner };
}
