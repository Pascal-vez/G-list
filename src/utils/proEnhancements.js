import { getProStats, getAdminPlanForPro } from './storage';

const SERVICE_TEMPLATES = {
  default: [
    { nom: 'Consultation', description: 'Premier rendez-vous et évaluation de vos besoins.', prix: '50 000 GNF' },
    { nom: 'Intervention standard', description: 'Prestation complète sur site.', prix: '150 000 GNF' },
    { nom: 'Urgence', description: 'Intervention rapide sous 24h.', prix: '200 000 GNF' },
  ],
};

const LANGUES = ['Français', 'Soussou', 'Malinké', 'Peulh', 'Anglais'];

export function getProPlan(pro) {
  const adminPlan = getAdminPlanForPro(pro.id);
  if (adminPlan) return adminPlan;
  if (pro.plan) return pro.plan;
  if (pro.topGList) return 'top';
  if (pro.id % 7 === 0) return 'premium';
  if (pro.id % 4 === 0) return 'advanced';
  return 'free';
}

export function isTopGList(pro) {
  return pro.topGList || (pro.verifie && pro.note >= 4.8 && pro.id % 11 === 0);
}

export function enrichProfessional(pro) {
  const stats = getProStats(pro.id);
  const plan = getProPlan(pro);
  const topGList = isTopGList(pro);
  const services = pro.services || generateServices(pro);
  return {
    ...pro,
    plan,
    topGList,
    vues: stats.views ?? (80 + (pro.id * 17) % 450),
    favoris: stats.favorites ?? (5 + (pro.id * 3) % 80),
    whatsappClicks: stats.whatsappClicks ?? (10 + (pro.id * 5) % 120),
    services,
    experience: 2 + (pro.id % 18),
    langues: LANGUES.slice(0, 2 + (pro.id % 3)),
    photos: pro.photos || null,
  };
}

function generateServices(pro) {
  const specs = pro.specialites || [];
  return (SERVICE_TEMPLATES.default.slice(0, 3)).map((s, i) => ({
    ...s,
    nom: specs[i] || s.nom,
    description: `${s.description} — ${pro.profession} à ${pro.quartier}.`,
    prix: `${(50 + i * 50 + (pro.id % 10) * 10) * 1000} GNF`,
  }));
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
