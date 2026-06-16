import { CATEGORIES } from '../data/constants';
import { getAllProfessionals } from '../api/professionals';
import { getProReviews } from './storage';

export const REPORT_SECTIONS = [
  { id: 'summary', label: 'Résumé exécutif', description: 'Vue d\'ensemble des indicateurs clés' },
  { id: 'views', label: 'Vues & trafic', description: 'Visites du profil et tendances' },
  { id: 'whatsapp', label: 'Contacts WhatsApp', description: 'Clics et conversions' },
  { id: 'reviews', label: 'Avis clients', description: 'Notes et nouveaux avis' },
  { id: 'reputation', label: 'Score réputation', description: 'Complétude et engagement' },
  { id: 'ranking', label: 'Position concurrence', description: 'Classement dans votre catégorie' },
];

function resolveCategoryName(categorieIdOrName) {
  const byId = CATEGORIES.find((c) => c.id === categorieIdOrName);
  if (byId) return byId.name;
  const byName = CATEGORIES.find((c) => c.name === categorieIdOrName);
  return byName?.name || categorieIdOrName;
}

function visibilityScore(pro) {
  return Math.round((pro.note || 0) * 15 + (pro.nombreAvis || 0) * 3 + (pro.vues || 0) * 0.05);
}

function computeCategoryRank(account) {
  const categoryName = resolveCategoryName(account.categorie);
  const reviews = getProReviews(account.id);
  const accountNote = reviews.length
    ? reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length
    : 4.2;

  const peers = getAllProfessionals().filter((p) => p.categorie === categoryName);
  const hasSelf = peers.some((p) => p.id === account.id);
  const list = hasSelf
    ? peers
    : [
      ...peers,
      {
        id: account.id,
        note: Math.round(accountNote * 10) / 10,
        nombreAvis: reviews.length,
        vues: account.profileViews || 0,
      },
    ];

  const ranked = list
    .map((p) => ({ ...p, score: visibilityScore(p) }))
    .sort((a, b) => b.score - a.score);

  const index = ranked.findIndex((p) => p.id === account.id);
  return index >= 0 ? index + 1 : ranked.length;
}

export function buildReportMetrics(account) {
  const reviews = getProReviews(account.id);
  const views = account.profileViews || 0;
  const whatsappClicks = Math.floor(views * 0.35);
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.note, 0) / reviews.length) * 10) / 10
    : 4.2;

  return {
    views,
    viewsTrend: '+12%',
    whatsappClicks,
    whatsappTrend: '+8%',
    newReviews: Math.min(reviews.length, 3),
    ratingDelta: '+0.2',
    avgRating,
    categoryRank: computeCategoryRank(account),
    categoryName: resolveCategoryName(account.categorie),
    region: account.region || '—',
    profession: account.profession || '—',
    reputationScore: 81,
    reputationAvg: 68,
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sectionBlocks(metrics, selectedSections) {
  const blocks = [];

  if (selectedSections.includes('summary')) {
    blocks.push({
      title: 'Résumé exécutif',
      rows: [
        ['Professionnel', metrics.proName],
        ['Catégorie', metrics.categoryName],
        ['Villes', metrics.region],
        ['Période', metrics.periodLabel],
      ],
    });
  }

  if (selectedSections.includes('views')) {
    blocks.push({
      title: 'Vues & trafic',
      rows: [
        ['Vues sur la période', metrics.views],
        ['Évolution vs période précédente', metrics.viewsTrend],
      ],
    });
  }

  if (selectedSections.includes('whatsapp')) {
    blocks.push({
      title: 'Contacts WhatsApp',
      rows: [
        ['Clics WhatsApp', metrics.whatsappClicks],
        ['Évolution', metrics.whatsappTrend],
        ['Taux de conversion', metrics.views ? `${((metrics.whatsappClicks / metrics.views) * 100).toFixed(1)}%` : '0%'],
      ],
    });
  }

  if (selectedSections.includes('reviews')) {
    blocks.push({
      title: 'Avis clients',
      rows: [
        ['Note moyenne', `${metrics.avgRating} / 5`],
        ['Nouveaux avis', metrics.newReviews],
        ['Évolution note', metrics.ratingDelta],
      ],
    });
  }

  if (selectedSections.includes('reputation')) {
    blocks.push({
      title: 'Score réputation',
      rows: [
        ['Votre score', `${metrics.reputationScore} / 100`],
        ['Moyenne catégorie', `${metrics.reputationAvg} / 100`],
      ],
    });
  }

  if (selectedSections.includes('ranking')) {
    blocks.push({
      title: 'Position concurrence',
      rows: [
        ['Rang catégorie', `#${metrics.categoryRank}`],
        ['Catégorie', metrics.categoryName],
        ['Évolution 30 jours', '+2 positions'],
      ],
    });
  }

  return blocks;
}

export function buildReportPayload(account, options) {
  const metrics = buildReportMetrics(account);
  const periodLabel = `${options.startDate} — ${options.endDate}`;
  const enriched = {
    ...metrics,
    proName: account.nom,
    periodLabel,
    title: options.title,
    subtitle: options.subtitle,
    generatedAt: new Date().toLocaleString('fr-FR'),
    adminName: account.nom,
  };

  return {
    metrics: enriched,
    blocks: sectionBlocks(enriched, options.sections),
    options,
  };
}

function downloadBlob(content, mime, filename) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function slugify(name) {
  return (name || 'rapport').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export function buildReportHtml(payload) {
  const { metrics, blocks, options } = payload;
  const headerMeta = [
    options.includeDate ? `Généré le ${metrics.generatedAt}` : null,
    options.includeAdminName ? metrics.adminName : null,
  ].filter(Boolean).join(' · ');

  const kpiHtml = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;">
      <div style="background:#F8F6F0;padding:14px;border-radius:10px;"><div style="font-size:12px;color:#666;">Vues</div><div style="font-size:22px;font-weight:700;color:#0E1208;">${metrics.views}</div><div style="font-size:11px;color:#2E7D32;">${metrics.viewsTrend}</div></div>
      <div style="background:#F8F6F0;padding:14px;border-radius:10px;"><div style="font-size:12px;color:#666;">WhatsApp</div><div style="font-size:22px;font-weight:700;color:#0E1208;">${metrics.whatsappClicks}</div><div style="font-size:11px;color:#2E7D32;">${metrics.whatsappTrend}</div></div>
      <div style="background:#F8F6F0;padding:14px;border-radius:10px;"><div style="font-size:12px;color:#666;">Position</div><div style="font-size:22px;font-weight:700;color:#0E1208;">#${metrics.categoryRank}</div><div style="font-size:11px;color:#888;">${escapeHtml(metrics.categoryName)}</div></div>
    </div>
  `;

  const sectionsHtml = blocks.map((block) => `
    <section style="margin-bottom:24px;">
      <h2 style="font-size:16px;margin:0 0 10px;color:#0E1208;border-bottom:2px solid #F5C518;padding-bottom:6px;">${escapeHtml(block.title)}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${block.rows.map(([label, value]) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #EFEFEF;color:#666;width:55%;">${escapeHtml(label)}</td>
            <td style="padding:8px 0;border-bottom:1px solid #EFEFEF;font-weight:600;color:#1A1A1A;">${escapeHtml(value)}</td>
          </tr>
        `).join('')}
      </table>
    </section>
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(metrics.title)}</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #1A1A1A; margin: 0; padding: 32px; background: #fff; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <header style="background:#0E1208;color:#fff;padding:24px;border-radius:12px;margin-bottom:24px;">
    ${options.includeLogo ? '<div style="font-size:22px;font-weight:800;margin-bottom:8px;"><span style="color:#F5C518;">G</span>-List</div>' : ''}
    <h1 style="margin:0 0 6px;font-size:22px;">${escapeHtml(metrics.title)}</h1>
    ${metrics.subtitle ? `<p style="margin:0 0 8px;opacity:0.85;font-size:14px;">${escapeHtml(metrics.subtitle)}</p>` : ''}
    <p style="margin:0;font-size:12px;opacity:0.7;">${escapeHtml(metrics.periodLabel)}${headerMeta ? ` · ${escapeHtml(headerMeta)}` : ''}</p>
  </header>
  ${options.sections.includes('summary') ? kpiHtml : ''}
  ${sectionsHtml}
  <footer style="margin-top:32px;font-size:11px;color:#999;text-align:center;">G-List · Annuaire professionnel Guinée</footer>
</body>
</html>`;
}

export function exportReport(payload, format) {
  const slug = slugify(payload.metrics.proName);
  const date = new Date().toISOString().slice(0, 10);

  if (format === 'csv') {
    const lines = [['Section', 'Indicateur', 'Valeur']];
    payload.blocks.forEach((block) => {
      block.rows.forEach(([label, value]) => {
        lines.push([block.title, label, value]);
      });
    });
    const csv = lines.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
    downloadBlob(`\uFEFF${csv}`, 'text/csv;charset=utf-8', `glist-rapport-${slug}-${date}.csv`);
    return;
  }

  if (format === 'excel') {
    const tableRows = payload.blocks.flatMap((block) => block.rows.map(([label, value]) => (
      `<tr><td>${escapeHtml(block.title)}</td><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`
    ))).join('');
    const html = `<html><head><meta charset="utf-8" /></head><body>
      <table border="1">
        <tr><th>Section</th><th>Indicateur</th><th>Valeur</th></tr>
        ${tableRows}
      </table>
    </body></html>`;
    downloadBlob(html, 'application/vnd.ms-excel;charset=utf-8', `glist-rapport-${slug}-${date}.xls`);
    return;
  }

  if (format === 'word') {
    const html = buildReportHtml(payload).replace('<!DOCTYPE html>', '');
    const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="fr"><head><meta charset="utf-8"><title>Rapport</title></head><body>${html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || ''}</body></html>`;
    downloadBlob(wordHtml, 'application/msword;charset=utf-8', `glist-rapport-${slug}-${date}.doc`);
    return;
  }

  const reportHtml = buildReportHtml(payload);
  const printWin = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWin) return;
  printWin.document.write(reportHtml);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => {
    printWin.print();
  }, 400);
}
