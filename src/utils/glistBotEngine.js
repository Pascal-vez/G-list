import {
  BOT_KNOWLEDGE,
  BOT_QUICK_PROMPTS,
  BOT_SITE_PAGES,
  buildCategoryLinks,
  normalizeText,
  getCategoryQuickLinks,
} from '../data/glistBotKnowledge';

const STOP_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'a', 'à', 'au', 'aux', 'en', 'et', 'ou', 'je', 'tu', 'il',
  'elle', 'on', 'nous', 'vous', 'ils', 'me', 'te', 'se', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa',
  'ses', 'ce', 'cette', 'ces', 'qui', 'que', 'quoi', 'comment', 'pour', 'par', 'sur', 'dans', 'avec', 'sans',
  'est', 'sont', 'ai', 'as', 'avez', 'avoir', 'etre', 'être', 'faire', 'peux', 'peut', 'vouloir', 'veux', 'veut',
  'g', 'list', 'glist', 'site', 'page', 'aller', 'ouvrir', 'voir', 'montre', 'montrez', 'donne', 'donner', 'lien',
]);

function tokenize(text) {
  return normalizeText(text)
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function scoreEntry(entry, normalizedQuery, tokens) {
  let score = entry.priority || 0;

  for (const kw of entry.keywords) {
    const nkw = normalizeText(kw);
    if (!nkw) continue;

    if (normalizedQuery.includes(nkw)) {
      score += nkw.split(/\s+/).length * 4;
    }

    for (const token of tokens) {
      if (nkw === token) score += 3;
      else if (nkw.includes(token) || token.includes(nkw)) score += 1.5;
    }
  }

  return score;
}

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter((l) => {
    if (!l?.path || seen.has(l.path)) return false;
    seen.add(l.path);
    return true;
  });
}

function formatAnswer(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
}

function buildFallback(query, tokens) {
  const links = dedupeLinks([
    ...getCategoryQuickLinks(),
    { label: 'Annuaire complet', path: '/annuaire' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ]);

  const pageMatch = BOT_SITE_PAGES.find((p) =>
    p.keywords.some((kw) => normalizeText(query).includes(normalizeText(kw))),
  );

  if (pageMatch) {
    return {
      text: `Je pense que vous cherchez « ${pageMatch.label} ». Voici le lien direct :`,
      links: [{ label: pageMatch.label, path: pageMatch.path }],
      suggestions: BOT_QUICK_PROMPTS.slice(0, 3).map((p) => p.query),
    };
  }

  return {
    text: tokens.length
      ? `Je n'ai pas trouvé de réponse précise pour « ${query.trim()} ». Essayez de préciser un métier et une ville (ex. « électricien Kindia »), ou choisissez une suggestion ci-dessous.`
      : 'Posez-moi une question sur G-List : recherche de pros, inscription, tarifs, espace pro, confidentialité…',
    links,
    suggestions: BOT_QUICK_PROMPTS.map((p) => p.query),
  };
}

/**
 * @param {string} query
 * @returns {{ text: string, links: { label: string, path: string }[], suggestions?: string[] }}
 */
export function askGlistBot(query) {
  const trimmed = query?.trim();
  if (!trimmed) {
    return {
      text: 'Écrivez votre question ou choisissez une suggestion.',
      links: [],
      suggestions: BOT_QUICK_PROMPTS.map((p) => p.query),
    };
  }

  const normalizedQuery = normalizeText(trimmed);
  const tokens = tokenize(trimmed);

  const categoryResult = buildCategoryLinks(trimmed);
  if (categoryResult?.links?.length) {
    const bestKnowledge = [...BOT_KNOWLEDGE]
      .map((e) => ({ entry: e, score: scoreEntry(e, normalizedQuery, tokens) }))
      .sort((a, b) => b.score - a.score)[0];

    const extraLinks = bestKnowledge?.score > 4 ? (bestKnowledge.entry.links || []) : [];

    return {
      text: categoryResult.answer,
      links: dedupeLinks([...categoryResult.links, ...extraLinks]),
      suggestions: [
        categoryResult.region ? `Autre métier à ${categoryResult.region}` : 'Plombier à Conakry',
        'Profils vérifiés',
        'Tarifs espace pro',
      ],
    };
  }

  const ranked = BOT_KNOWLEDGE
    .map((entry) => ({ entry, score: scoreEntry(entry, normalizedQuery, tokens) }))
    .filter(({ score }) => score > 3)
    .sort((a, b) => b.score - a.score);

  if (ranked.length > 0) {
    const { entry } = ranked[0];
    const links = typeof entry.links === 'function'
      ? entry.links({ query: trimmed })
      : (entry.links || []);

    const related = ranked.slice(1, 3)
      .flatMap(({ entry: e }) => e.links || [])
      .slice(0, 2);

    return {
      text: formatAnswer(typeof entry.answer === 'function' ? entry.answer({ query: trimmed }) : entry.answer),
      links: dedupeLinks([...links, ...related]),
      suggestions: ranked.length > 1
        ? ranked.slice(1, 4).map(({ entry: e }) => e.keywords[0]).filter(Boolean)
        : BOT_QUICK_PROMPTS.slice(0, 3).map((p) => p.query),
    };
  }

  return buildFallback(trimmed, tokens);
}

export function getBotWelcomeMessage() {
  return {
    text: 'Bonjour ! Je suis **G-Bot**, l\'assistant G-List. Je connais l\'annuaire, les offres pro, la FAQ et je peux vous envoyer directement au bon endroit du site. Comment puis-je vous aider ?',
    links: [
      { label: 'Annuaire', path: '/annuaire' },
      { label: 'Espace pro', path: '/espace-pro' },
      { label: 'FAQ', path: '/faq' },
    ],
    suggestions: BOT_QUICK_PROMPTS.map((p) => p.query),
  };
}

export { BOT_QUICK_PROMPTS };
