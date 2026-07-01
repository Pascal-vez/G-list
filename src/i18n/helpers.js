/** @param {string} locale */
export function formatLocaleNumber(n, locale) {
  return n.toLocaleString(locale === 'en' ? 'en-US' : 'fr-FR');
}

export function categoryLabel(t, cat) {
  if (!cat) return '';
  const key = `category.${cat.id}`;
  const translated = t(key);
  return translated === key ? cat.name : translated;
}

export function categoryDescription(t, catId, fallback) {
  const key = `category.desc.${catId}`;
  const translated = t(key);
  return translated === key ? fallback : translated;
}
