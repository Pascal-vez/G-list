const DAY_LABELS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function dayFromToken(token) {
  const d = token.toLowerCase().trim();
  if (d.startsWith('lun')) return 1;
  if (d.startsWith('mar')) return 2;
  if (d.startsWith('mer')) return 3;
  if (d.startsWith('jeu')) return 4;
  if (d.startsWith('ven')) return 5;
  if (d.startsWith('sam')) return 6;
  if (d.startsWith('dim')) return 0;
  return null;
}

function formatTime(h, m) {
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function getConakryContext(date = new Date()) {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Conakry',
    weekday: 'short',
  }).format(date);

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Conakry',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);

  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { day: dayMap[weekday] ?? 0, minutes: hour * 60 + minute };
}

function isDayInRange(day, startDay, endDay) {
  if (startDay == null || endDay == null) return true;
  if (startDay <= endDay) return day >= startDay && day <= endDay;
  return day >= startDay || day <= endDay;
}

function parseTimeRange(text) {
  const norm = text.toLowerCase().replace(/[·•—–]/g, ' ').replace(/\s+/g, ' ');

  let match = norm.match(/(\d{1,2})\s*h\s*(\d{2})?\s*[-–]\s*(\d{1,2})\s*h\s*(\d{2})?/);
  if (match) {
    return {
      open: parseInt(match[1], 10) * 60 + parseInt(match[2] || '0', 10),
      close: parseInt(match[3], 10) * 60 + parseInt(match[4] || '0', 10),
      openH: parseInt(match[1], 10),
      openM: parseInt(match[2] || '0', 10),
      closeH: parseInt(match[3], 10),
      closeM: parseInt(match[4] || '0', 10),
    };
  }

  match = norm.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (match) {
    return {
      open: parseInt(match[1], 10) * 60 + parseInt(match[2], 10),
      close: parseInt(match[3], 10) * 60 + parseInt(match[4], 10),
      openH: parseInt(match[1], 10),
      openM: parseInt(match[2], 10),
      closeH: parseInt(match[3], 10),
      closeM: parseInt(match[4], 10),
    };
  }

  return null;
}

function parseDayRange(text) {
  const norm = text.toLowerCase().replace(/[·•—–]/g, ' ').replace(/\s+/g, ' ');

  if (/7\s*j\s*\/?\s*7|tous?\s+les\s+jours/.test(norm)) {
    return { startDay: 0, endDay: 6 };
  }

  const match = norm.match(
    /(lun\w*|mar\w*|mer\w*|jeu\w*|ven\w*|sam\w*|dim\w*)\s*[-–]\s*(lun\w*|mar\w*|mer\w*|jeu\w*|ven\w*|sam\w*|dim\w*)/i,
  );
  if (match) {
    return { startDay: dayFromToken(match[1]), endDay: dayFromToken(match[2]) };
  }

  return { startDay: 1, endDay: 6 };
}

function nextOpenDay(currentDay, startDay, endDay) {
  for (let i = 1; i <= 7; i += 1) {
    const d = (currentDay + i) % 7;
    if (isDayInRange(d, startDay, endDay)) return d;
  }
  return startDay ?? 1;
}

/**
 * Détermine si un professionnel est ouvert selon ses horaires (heure de Conakry).
 * @returns {{ isOpen: boolean | null, hint?: string }}
 */
export function getOpenStatus(horaires, now = new Date()) {
  if (!horaires?.trim()) return { isOpen: null };

  const norm = horaires.toLowerCase().replace(/[·•—–]/g, ' ').replace(/\s+/g, ' ');

  if (/24\s*h\s*\/?\s*24|24\s*\/\s*24/.test(norm)) {
    return { isOpen: true, hintKey: 'openStatus.hint.alwaysOpen' };
  }

  const times = parseTimeRange(horaires);
  if (!times) return { isOpen: null };

  const { startDay, endDay } = parseDayRange(horaires);
  const { day, minutes } = getConakryContext(now);
  const openLabel = formatTime(times.openH, times.openM);
  const closeLabel = formatTime(times.closeH, times.closeM);

  const isOpenDay = isDayInRange(day, startDay, endDay);
  const isOpenTime = minutes >= times.open && minutes < times.close;
  const isOpen = isOpenDay && isOpenTime;

  if (isOpen) {
    return { isOpen: true, hintKey: 'openStatus.hint.closesAt', hintVars: { time: closeLabel } };
  }

  if (isOpenDay && minutes < times.open) {
    return { isOpen: false, hintKey: 'openStatus.hint.opensAt', hintVars: { time: openLabel } };
  }

  const nextDay = nextOpenDay(day, startDay, endDay);
  if (nextDay === day) {
    return { isOpen: false, hintKey: 'openStatus.hint.opensAt', hintVars: { time: openLabel } };
  }

  return { isOpen: false, hintKey: 'openStatus.hint.opensOnDay', hintVars: { day: nextDay, time: openLabel } };
}
