import { TOUTES_PREFECTURES } from '../data/regionsGuinee';

export function normaliserLocalite(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function estPrefectureOfficielle(nom) {
  const n = normaliserLocalite(nom);
  return TOUTES_PREFECTURES.some((p) => normaliserLocalite(p) === n);
}

export function localiteCorrespond(valeur, filtre) {
  if (!valeur || !filtre) return false;
  const a = normaliserLocalite(valeur);
  const b = normaliserLocalite(filtre);
  return a === b || a.includes(b) || b.includes(a);
}

export function titreLocalite(nom) {
  const trimmed = String(nom || '').trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
