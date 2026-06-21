import { CATEGORY_COLORS, CATEGORIES, REGIONS } from '../data/constants';
import { getOpenStatus } from './horaires';

export function getInitials(name) {
  const parts = name.replace(/^(Dr\.|Pharmacie|Maquis|Restaurant|Salon|Garage|Centre|Prof)\s*/i, '').trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getAvatarColor(category) {
  return CATEGORY_COLORS[category] || '#F5C518';
}

export function formatWhatsAppLink(telephone) {
  if (!telephone) return '#';
  const digits = String(telephone).replace(/\D/g, '');
  if (!digits) return '#';
  return `https://wa.me/${digits}`;
}

export function formatPhone(telephone) {
  return telephone;
}

export function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let stars = '';
  for (let i = 0; i < full; i++) stars += '★';
  if (half) stars += '½';
  while (stars.length < 5) stars += '☆';
  return stars.slice(0, 5);
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function countByField(pros, field) {
  return pros.reduce((acc, pro) => {
    const key = pro[field];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export function getCategoryCounts(pros) {
  const counts = countByField(pros, 'categorie');
  return CATEGORIES.reduce((acc, cat) => {
    acc[cat.name] = counts[cat.name] || 0;
    return acc;
  }, {});
}

export function getRegionCounts(pros) {
  const counts = countByField(pros, 'region');
  return REGIONS.reduce((acc, region) => {
    acc[region] = counts[region] || 0;
    return acc;
  }, {});
}

export function getVerifiedCount(pros) {
  return pros.filter((p) => p.verifie).length;
}

export function filterProfessionals(pros, filters) {
  const {
    search, region, category, verified, minRating,
    categories = [], regions = [], tags = [], plans = [], minRatingSlider = 0,
  } = filters;

  return pros.filter((pro) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        pro.nom.toLowerCase().includes(q) ||
        pro.profession.toLowerCase().includes(q) ||
        pro.categorie.toLowerCase().includes(q) ||
        pro.region.toLowerCase().includes(q) ||
        pro.quartier.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (regions.length > 0 && !regions.includes(pro.region)) return false;
    if (region && region !== 'all' && pro.region !== region) return false;
    if (categories.length > 0 && !categories.includes(pro.categorie)) return false;
    if (category && category !== 'all' && pro.categorie !== category) return false;
    if (verified === 'verified' && !pro.verifie) return false;
    if (verified === 'unverified' && pro.verifie) return false;
    if (minRating === '4' && pro.note < 4) return false;
    if (minRating === '4.5' && pro.note < 4.5) return false;
    if (minRatingSlider > 0 && pro.note < minRatingSlider) return false;

    if (tags.includes('verified') && !pro.verifie) return false;
    if (tags.includes('top') && !pro.topGList) return false;
    if (tags.includes('available')) {
      if (getOpenStatus(pro.horaires)?.status !== 'open') return false;
    }
    if (tags.includes('new') && pro.id > 50) return false;
    if (tags.includes('rated') && pro.note < 4) return false;

    if (plans.length > 0) {
      const plan = pro.plan || 'free';
      const matchPlan = plans.includes(plan) || (plans.includes('top') && pro.topGList);
      if (!matchPlan) return false;
    }

    return true;
  });
}
