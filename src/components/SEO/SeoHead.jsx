import { usePageMeta } from '../../hooks/usePageMeta';

/** Wrapper déclaratif autour de usePageMeta pour les pages info / auth. */
export default function SeoHead({ titre, description, url = '', noIndex = false }) {
  usePageMeta({
    title: titre,
    description,
    path: url,
    noIndex,
  });
  return null;
}
