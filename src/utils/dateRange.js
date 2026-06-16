export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function parseISODate(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(iso, days) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function daysBetween(startDate, endDate) {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

export function defaultDateRange() {
  const endDate = todayISO();
  return { startDate: addDays(endDate, -29), endDate };
}

export function getPreviousPeriod(startDate, endDate) {
  const span = daysBetween(startDate, endDate);
  const prevEnd = addDays(startDate, -1);
  return { startDate: addDays(prevEnd, -(span - 1)), endDate: prevEnd };
}

export function formatDateFR(iso) {
  if (!iso) return '—';
  return parseISODate(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatPeriodLabel(startDate, endDate) {
  return `${formatDateFR(startDate)} — ${formatDateFR(endDate)}`;
}

export function formatPeriodShort(startDate, endDate) {
  const days = daysBetween(startDate, endDate);
  if (days === 1) return '1 jour';
  return `${days} jours`;
}

export function filterByDateRange(items, startDate, endDate, dateKey = 'date') {
  const start = parseISODate(startDate).getTime();
  const end = parseISODate(endDate).getTime() + 86400000 - 1;
  return items.filter((item) => {
    const raw = item[dateKey];
    if (!raw) return true;
    const t = parseISODate(String(raw).slice(0, 10)).getTime();
    return t >= start && t <= end;
  });
}

export const DATE_PRESETS = [
  { id: '7d', label: '7 j' },
  { id: '30d', label: '30 j' },
  { id: '90d', label: '90 j' },
  { id: 'month', label: 'Ce mois' },
  { id: 'lastMonth', label: 'Mois dernier' },
  { id: 'year', label: 'Cette année' },
];

export function applyPreset(presetId) {
  const endDate = todayISO();
  const now = new Date();

  switch (presetId) {
    case '7d':
      return { startDate: addDays(endDate, -6), endDate };
    case '30d':
      return { startDate: addDays(endDate, -29), endDate };
    case '90d':
      return { startDate: addDays(endDate, -89), endDate };
    case 'month':
      return { startDate: toISO(new Date(now.getFullYear(), now.getMonth(), 1)), endDate };
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: toISO(start), endDate: toISO(end) };
    }
    case 'year':
      return { startDate: toISO(new Date(now.getFullYear(), 0, 1)), endDate };
    default:
      return defaultDateRange();
  }
}

export function downsampleChartData(data, maxPoints = 24) {
  if (!data?.length || data.length <= maxPoints) return data || [];
  const step = Math.ceil(data.length / maxPoints);
  const result = [];
  for (let i = 0; i < data.length; i += step) {
    const chunk = data.slice(i, i + step);
    result.push({
      ...chunk[chunk.length - 1],
      label: chunk[0].label,
      value: chunk.reduce((sum, point) => sum + (point.value || 0), 0),
    });
  }
  return result;
}
