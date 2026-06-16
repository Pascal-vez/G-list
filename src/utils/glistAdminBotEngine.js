import { normalizeText } from '../data/glistBotKnowledge';
import {
  ADMIN_BOT_KNOWLEDGE,
  ADMIN_BOT_QUICK_PROMPTS,
  detectAdminTab,
} from '../data/glistAdminBotKnowledge';
import { getPlatformKPIs } from './adminAnalytics';
import { askGlistBot } from './glistBotEngine';

const ADMIN_STOP = new Set(['admin', 'dashboard', 'onglet', 'tab', 'menu', 'ouvrir', 'aller', 'voir', 'afficher', 'montre']);

function tokenizeAdmin(text) {
  return normalizeText(text)
    .split(/\s+/)
    .filter((t) => t.length > 1 && !ADMIN_STOP.has(t));
}

function scoreEntry(entry, normalizedQuery, tokens) {
  let score = (entry.priority || 0) * 1.5;

  for (const kw of entry.keywords) {
    const nkw = normalizeText(kw);
    if (!nkw) continue;
    if (normalizedQuery.includes(nkw)) score += nkw.split(/\s+/).length * 5;
    for (const token of tokens) {
      if (nkw === token) score += 4;
      else if (nkw.includes(token) || token.includes(nkw)) score += 2;
    }
  }
  return score;
}

function dedupeLinks(links) {
  const seen = new Set();
  return (links || []).filter((l) => {
    const key = l.adminTab || l.path || l.label;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function resolveAnswer(entry, ctx) {
  const raw = typeof entry.answer === 'function' ? entry.answer(ctx) : entry.answer;
  return String(raw || '').replace(/\*\*(.+?)\*\*/g, '$1');
}

function resolveLinks(entry) {
  return typeof entry.links === 'function' ? entry.links() : (entry.links || []);
}

/**
 * @param {string} query
 * @param {{ dateRange?: object }} adminContext
 */
export function askAdminGlistBot(query, adminContext = {}) {
  const trimmed = query?.trim();
  if (!trimmed) {
    return {
      text: 'Commande admin ou question sur G-List…',
      links: [],
      suggestions: ADMIN_BOT_QUICK_PROMPTS.map((p) => p.query),
    };
  }

  const normalizedQuery = normalizeText(trimmed);
  const tokens = tokenizeAdmin(trimmed);

  const tabHit = detectAdminTab(trimmed);
  if (tabHit && (normalizedQuery.includes('ouvr') || normalizedQuery.includes('aller') || normalizedQuery.includes('affich') || tokens.length <= 3)) {
    return {
      text: `Navigation → ${tabHit.label}`,
      links: [{ label: `Ouvrir ${tabHit.label}`, adminTab: tabHit.id }],
      suggestions: ADMIN_BOT_QUICK_PROMPTS.slice(0, 4).map((p) => p.query),
    };
  }

  const ranked = ADMIN_BOT_KNOWLEDGE
    .map((entry) => ({ entry, score: scoreEntry(entry, normalizedQuery, tokens) }))
    .filter(({ score }) => score > 8)
    .sort((a, b) => b.score - a.score);

  if (ranked.length > 0) {
    const { entry } = ranked[0];
    const related = ranked.slice(1, 3).flatMap(({ entry: e }) => resolveLinks(e)).slice(0, 2);
    return {
      text: resolveAnswer(entry, adminContext),
      links: dedupeLinks([...resolveLinks(entry), ...related]),
      suggestions: ranked.length > 1
        ? ranked.slice(1, 5).map(({ entry: e }) => e.keywords[0]).filter(Boolean)
        : ADMIN_BOT_QUICK_PROMPTS.map((p) => p.query),
    };
  }

  const publicReply = askGlistBot(trimmed);
  return {
    text: `${publicReply.text}\n\n— Mode admin : raccourcis dashboard ci-dessous.`,
    links: dedupeLinks([
      ...(publicReply.links || []),
      { label: 'Overview admin', adminTab: 'overview' },
      { label: 'Professionnels', adminTab: 'pros' },
      { label: 'Modération', adminTab: 'moderation' },
    ]),
    suggestions: ADMIN_BOT_QUICK_PROMPTS.map((p) => p.query),
  };
}

export function getAdminBotWelcomeMessage(adminContext = {}) {
  const k = getPlatformKPIs(adminContext.dateRange);
  return {
    text: [
      'Bonjour ! Je suis G-Bot Admin — copilote avec données live, navigation vers les 15 onglets et doc complète G-List.',
      '',
      `Live : ${k.totalPros} pros actifs · ${k.verified} vérifiés · ${k.pendingReports} signalement(s) · ${k.premium} Premium / ${k.advanced} Advanced`,
      '',
      'Demandez stats, MRR, modération, doublons, ou « ouvrir Professionnels ».',
    ].join('\n'),
    links: [
      { label: 'Overview', adminTab: 'overview' },
      { label: 'Professionnels', adminTab: 'pros' },
      { label: 'Revenus', adminTab: 'revenue' },
      { label: 'Site public', path: '/', external: true },
    ],
    suggestions: ADMIN_BOT_QUICK_PROMPTS.map((p) => p.query),
  };
}

export { ADMIN_BOT_QUICK_PROMPTS };
