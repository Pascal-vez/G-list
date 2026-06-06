import {
  HeartPulse, Pill, Scale, HardHat, Wrench, Zap, Hammer, Boxes,
  Paintbrush, UtensilsCrossed, Scissors, Camera, Hotel, ShoppingBag,
  Car, Smartphone, GraduationCap, Landmark, Truck, Sprout, Briefcase, CircleEllipsis,
} from 'lucide-react';

const ICONS = {
  sante: HeartPulse,
  pharmacies: Pill,
  juridique: Scale,
  btp: HardHat,
  plomberie: Wrench,
  electricite: Zap,
  menuiserie: Hammer,
  maconnerie: Boxes,
  peinture: Paintbrush,
  restaurants: UtensilsCrossed,
  coiffure: Scissors,
  photo: Camera,
  hotels: Hotel,
  commerce: ShoppingBag,
  garage: Car,
  informatique: Smartphone,
  education: GraduationCap,
  banques: Landmark,
  transport: Truck,
  agriculture: Sprout,
  autre: CircleEllipsis,
};

/** Couleurs légères par concept — fond + icône */
export const CATEGORY_COLORS = {
  sante: { bg: 'rgba(239, 68, 68, 0.12)', color: '#DC2626' },
  pharmacies: { bg: 'rgba(34, 197, 94, 0.12)', color: '#16A34A' },
  juridique: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563EB' },
  btp: { bg: 'rgba(249, 115, 22, 0.12)', color: '#EA580C' },
  plomberie: { bg: 'rgba(14, 165, 233, 0.12)', color: '#0284C7' },
  electricite: { bg: 'rgba(234, 179, 8, 0.14)', color: '#CA8A04' },
  menuiserie: { bg: 'rgba(180, 83, 9, 0.12)', color: '#B45309' },
  maconnerie: { bg: 'rgba(120, 113, 108, 0.14)', color: '#78716C' },
  peinture: { bg: 'rgba(168, 85, 247, 0.12)', color: '#9333EA' },
  restaurants: { bg: 'rgba(244, 63, 94, 0.12)', color: '#E11D48' },
  coiffure: { bg: 'rgba(236, 72, 153, 0.12)', color: '#DB2777' },
  photo: { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366F1' },
  hotels: { bg: 'rgba(20, 184, 166, 0.12)', color: '#0D9488' },
  commerce: { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563EB' },
  garage: { bg: 'rgba(71, 85, 105, 0.12)', color: '#475569' },
  informatique: { bg: 'rgba(6, 182, 212, 0.12)', color: '#0891B2' },
  education: { bg: 'rgba(79, 70, 229, 0.12)', color: '#4F46E5' },
  banques: { bg: 'rgba(22, 163, 74, 0.12)', color: '#15803D' },
  transport: { bg: 'rgba(245, 158, 11, 0.14)', color: '#D97706' },
  agriculture: { bg: 'rgba(101, 163, 13, 0.12)', color: '#65A30D' },
  autre: { bg: 'rgba(107, 114, 128, 0.12)', color: '#6B7280' },
};

export default function CategoryIcon({ id, size = 28, className, strokeWidth = 1.75, style }) {
  const Icon = ICONS[id] || Briefcase;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} style={style} />;
}
