import { getItem, getAllProAccountsList } from '../utils/storage';
import { normalizeMinisite, slugify } from '../utils/minisite';
import { getProfessionalById } from './professionals';

const MINISITE_KEY = 'glist_minisite';

export function resolveMinisiteBySlug(slug) {
  const normalized = slugify(slug);
  const all = getItem(MINISITE_KEY, {});
  const entry = Object.entries(all).find(([, data]) => {
    const site = normalizeMinisite(data, null);
    return site?.slug === normalized;
  });
  if (!entry) return null;

  const [proId, rawSite] = entry;
  const pro = getProfessionalById(proId) ?? getProfessionalById(Number(proId));
  const account = getAllProAccountsList().find((a) => String(a.id) === String(proId));
  const owner = pro || account;
  const site = normalizeMinisite(rawSite, account || owner);

  if (!site.published) return null;
  if (owner?.plan !== 'premium') return null;

  return { proId, site, pro: owner };
}
