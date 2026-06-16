import {
  getPlatformKPIs, getTopCategories, getTopRegions, getRevenueStats,
  getOpportunityGaps, findDuplicateGroups, getIAInsights,
} from './adminAnalytics';
import { getPlanMonthlyPrice } from './storage';

export const ADMIN_REPORT_SECTIONS = [
  { id: 'summary', label: 'Résumé exécutif', description: 'Vue d\'ensemble des indicateurs clés' },
  { id: 'professionals', label: 'Professionnels', description: 'Annuaire, vérifications et plans' },
  { id: 'users', label: 'Utilisateurs', description: 'Comptes visiteurs et professionnels' },
  { id: 'analytics', label: 'Analytics', description: 'Recherches, vues et tendances' },
  { id: 'moderation', label: 'Modération', description: 'Signalements et doublons' },
  { id: 'revenue', label: 'Revenus', description: 'Abonnements et MRR' },
  { id: 'opportunities', label: 'Opportunités', description: 'Zones à fort potentiel' },
];

function formatGNF(n) {
  return new Intl.NumberFormat('fr-GN').format(n);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildAdminReportMetrics(dateRange) {
  const kpis = getPlatformKPIs(dateRange);
  const rev = getRevenueStats(dateRange);
  const topCats = getTopCategories(5, dateRange);
  const topRegions = getTopRegions(5);
  const duplicates = findDuplicateGroups();
  const opps = getOpportunityGaps(5, dateRange);
  const { trends, recommendations, alerts } = getIAInsights(dateRange);

  return {
    totalPros: kpis.totalPros,
    verified: kpis.verified,
    premium: kpis.premium,
    advanced: kpis.advanced,
    totalUsers: kpis.totalUsers,
    totalViews: kpis.totalViews,
    totalSearches: kpis.totalSearches,
    whatsappClicks: kpis.whatsappClicks,
    waitlistCount: kpis.waitlistCount,
    pendingReports: kpis.pendingReports,
    evalCount: kpis.evalCount,
    growthPct: kpis.growthPct,
    mrr: rev.mrr,
    freeAccounts: rev.free,
    advancedAccounts: rev.advanced,
    premiumAccounts: rev.premium,
    advPrice: getPlanMonthlyPrice('advanced'),
    premPrice: getPlanMonthlyPrice('premium'),
    topCategory: topCats[0]?.label || '—',
    topCategoryCount: topCats[0]?.value || 0,
    topRegion: topRegions[0]?.label || '—',
    topRegionCount: topRegions[0]?.value || 0,
    topCategoriesList: topCats.map((c) => `${c.label} (${c.value})`).join(', ') || '—',
    topRegionsList: topRegions.map((r) => `${r.label} (${r.value})`).join(', ') || '—',
    duplicateCount: duplicates.length,
    opportunityCount: opps.length,
    topOpportunity: opps[0] ? `${opps[0].cat} — ${opps[0].region}` : '—',
    trends: trends.slice(0, 3).join(' · ') || '—',
    recommendations: recommendations.slice(0, 2).join(' · ') || '—',
    alerts: alerts.slice(0, 2).join(' · ') || '—',
  };
}

function sectionBlocks(metrics, selectedSections) {
  const blocks = [];

  if (selectedSections.includes('summary')) {
    blocks.push({
      title: 'Résumé exécutif',
      rows: [
        ['Professionnels actifs', metrics.totalPros],
        ['Profils vérifiés', metrics.verified],
        ['Comptes inscrits', metrics.totalUsers],
        ['Vues annuaire', metrics.totalViews],
        ['Croissance estimée', `+${metrics.growthPct}%`],
        ['Période', metrics.periodLabel],
      ],
    });
  }

  if (selectedSections.includes('professionals')) {
    blocks.push({
      title: 'Professionnels',
      rows: [
        ['Total actifs', metrics.totalPros],
        ['Vérifiés', metrics.verified],
        ['Plan Premium', metrics.premium],
        ['Plan Advanced', metrics.advanced],
        ['Liste d\'attente', metrics.waitlistCount],
      ],
    });
  }

  if (selectedSections.includes('users')) {
    blocks.push({
      title: 'Utilisateurs',
      rows: [
        ['Comptes inscrits', metrics.totalUsers],
        ['Évaluations plateforme', metrics.evalCount],
        ['Liste d\'attente', metrics.waitlistCount],
      ],
    });
  }

  if (selectedSections.includes('analytics')) {
    blocks.push({
      title: 'Analytics',
      rows: [
        ['Recherches totales', metrics.totalSearches],
        ['Vues annuaire', metrics.totalViews],
        ['Clics WhatsApp est.', metrics.whatsappClicks],
        ['Top catégorie', `${metrics.topCategory} (${metrics.topCategoryCount})`],
        ['Top ville', `${metrics.topRegion} (${metrics.topRegionCount})`],
        ['Top 5 catégories', metrics.topCategoriesList],
        ['Top 5 villes', metrics.topRegionsList],
        ['Tendances', metrics.trends],
      ],
    });
  }

  if (selectedSections.includes('moderation')) {
    blocks.push({
      title: 'Modération',
      rows: [
        ['Signalements en attente', metrics.pendingReports],
        ['Groupes de doublons', metrics.duplicateCount],
        ['Alertes', metrics.alerts],
      ],
    });
  }

  if (selectedSections.includes('revenue')) {
    blocks.push({
      title: 'Revenus',
      rows: [
        ['MRR estimé', `${formatGNF(metrics.mrr)} GNF`],
        ['Comptes Free', metrics.freeAccounts],
        [`Advanced × ${formatGNF(metrics.advPrice)} GNF`, metrics.advancedAccounts],
        [`Premium × ${formatGNF(metrics.premPrice)} GNF`, metrics.premiumAccounts],
        ['ARR estimé', `${formatGNF(metrics.mrr * 12)} GNF`],
      ],
    });
  }

  if (selectedSections.includes('opportunities')) {
    blocks.push({
      title: 'Opportunités',
      rows: [
        ['Zones identifiées', metrics.opportunityCount],
        ['Priorité #1', metrics.topOpportunity],
        ['Recommandations', metrics.recommendations],
      ],
    });
  }

  return blocks;
}

export function buildAdminReportPayload(options) {
  const metrics = buildAdminReportMetrics({
    startDate: options.startDateISO || options.startDate,
    endDate: options.endDateISO || options.endDate,
  });
  const periodLabel = `${options.startDate} — ${options.endDate}`;
  const enriched = {
    ...metrics,
    periodLabel,
    title: options.title,
    subtitle: options.subtitle,
    generatedAt: new Date().toLocaleString('fr-FR'),
    author: options.author || 'Administration G-List',
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

export function buildAdminReportHtml(payload) {
  const { metrics, blocks, options } = payload;
  const headerMeta = [
    options.includeDate ? `Généré le ${metrics.generatedAt}` : null,
    options.includeAuthor ? metrics.author : null,
  ].filter(Boolean).join(' · ');

  const kpiHtml = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;">
      <div style="background:#F8F6F0;padding:14px;border-radius:10px;"><div style="font-size:12px;color:#666;">Professionnels</div><div style="font-size:22px;font-weight:700;color:#0E1208;">${metrics.totalPros}</div><div style="font-size:11px;color:#2E7D32;">+${metrics.growthPct}%</div></div>
      <div style="background:#F8F6F0;padding:14px;border-radius:10px;"><div style="font-size:12px;color:#666;">Vues</div><div style="font-size:22px;font-weight:700;color:#0E1208;">${metrics.totalViews}</div><div style="font-size:11px;color:#888;">${metrics.totalSearches} recherches</div></div>
      <div style="background:#F8F6F0;padding:14px;border-radius:10px;"><div style="font-size:12px;color:#666;">MRR</div><div style="font-size:22px;font-weight:700;color:#0E1208;">${formatGNF(metrics.mrr)}</div><div style="font-size:11px;color:#888;">GNF</div></div>
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
  <footer style="margin-top:32px;font-size:11px;color:#999;text-align:center;">G-List · Rapport administration · Guinée</footer>
</body>
</html>`;
}

export function exportAdminReport(payload, format) {
  const slug = slugify('admin');
  const date = new Date().toISOString().slice(0, 10);

  if (format === 'csv') {
    const lines = [['Section', 'Indicateur', 'Valeur']];
    payload.blocks.forEach((block) => {
      block.rows.forEach(([label, value]) => {
        lines.push([block.title, label, value]);
      });
    });
    const csv = lines.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
    downloadBlob(`\uFEFF${csv}`, 'text/csv;charset=utf-8', `glist-rapport-admin-${slug}-${date}.csv`);
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
    downloadBlob(html, 'application/vnd.ms-excel;charset=utf-8', `glist-rapport-admin-${slug}-${date}.xls`);
    return;
  }

  if (format === 'word') {
    const html = buildAdminReportHtml(payload).replace('<!DOCTYPE html>', '');
    const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="fr"><head><meta charset="utf-8"><title>Rapport</title></head><body>${html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || ''}</body></html>`;
    downloadBlob(wordHtml, 'application/msword;charset=utf-8', `glist-rapport-admin-${slug}-${date}.doc`);
    return;
  }

  const reportHtml = buildAdminReportHtml(payload);
  const printWin = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWin) return;
  printWin.document.write(reportHtml);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => {
    printWin.print();
  }, 400);
}
