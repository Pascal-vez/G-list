import { getProStats, getAdminPlanForPro, getProPlanLevel } from './storage';

export function getProPlan(pro) {
  const adminPlan = getAdminPlanForPro(pro.id);
  if (adminPlan) return adminPlan;
  const accountLevel = getProPlanLevel(pro);
  if (accountLevel !== 'free') return accountLevel;
  return pro.plan || 'free';
}

export function isTopGList(pro) {
  return Boolean(pro.topGList || (pro.verifie && (pro.note || 0) >= 4.8 && (pro.nombreAvis || 0) >= 5));
}

export function normalizeServiceItems(services) {
  if (!Array.isArray(services) || services.length === 0) return [];
  return services.map((s, i) => {
    if (typeof s === 'string') {
      return { nom: s, description: s, prix: '' };
    }
    return s;
  });
}

export function enrichProfessional(pro) {
  const stats = getProStats(pro.id);
  const plan = getProPlan(pro);
  const topGList = isTopGList(pro);
  const services = normalizeServiceItems(
    Array.isArray(pro.services) && pro.services.length > 0 ? pro.services : [],
  );
  return {
    ...pro,
    plan,
    topGList,
    vues: stats.views ?? pro.profileViews ?? 0,
    favoris: stats.favorites ?? 0,
    whatsappClicks: stats.whatsappClicks ?? pro.whatsappClicks ?? 0,
    services,
    avis: [],
    experience: pro.experience ?? null,
    langues: pro.langues || [],
    photos: pro.photos || null,
  };
}

export function getPlanBadgeLabel(plan, topGList) {
  if (topGList) return 'Top G-List';
  if (plan === 'premium') return 'Premium';
  if (plan === 'advanced') return 'Advanced';
  return 'Free';
}

export function getGalleryLimit(plan) {
  if (plan === 'premium') return 12;
  if (plan === 'advanced') return 6;
  return 2;
}

export function getServicesLimit(plan) {
  if (plan === 'free') return 3;
  return Infinity;
}

export function generatePlaceholderPhotos(pro, count) {
  const base = pro.categorie || pro.profession;
  const colors = ['#F5C518', '#D4A800', '#0E1208', '#25D366', '#1877F2', '#FF984C', '#4CAF50', '#9C27B0', '#E91E63', '#607D8B', '#795548', '#009688'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[(pro.id + i) % colors.length],
    label: `${base} — ${i + 1}`,
  }));
}
