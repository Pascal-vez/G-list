export function getHeaderOffset(extra = 16) {
  const header = document.querySelector('header');
  if (header) {
    return header.getBoundingClientRect().height + extra;
  }
  return 76 + extra;
}

function scrollElementIntoView(id, behavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return false;

  const top = el.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

let scrollTimers = [];

function clearScrollTimers() {
  scrollTimers.forEach(clearTimeout);
  scrollTimers = [];
}

/** Scroll vers une ancre — 3 passes max, annule les scrolls précédents. */
export function scrollToId(id, behavior = 'smooth') {
  if (!id) return;

  clearScrollTimers();
  const delays = [0, 200, 600];

  delays.forEach((delay, index) => {
    const timer = window.setTimeout(() => {
      scrollElementIntoView(id, index === 0 ? behavior : 'auto');
    }, delay);
    scrollTimers.push(timer);
  });
}

export function scrollToTop(behavior = 'auto') {
  clearScrollTimers();
  window.scrollTo({ top: 0, left: 0, behavior });
}

export function getScrollTargetFromPath(to) {
  const url = new URL(to, window.location.origin);
  const hashId = url.hash.replace('#', '');
  if (hashId) return hashId;
  if (url.searchParams.get('region') || url.searchParams.get('verified')) {
    return 'professionals';
  }
  return '';
}

export function parseNavTarget(to) {
  const url = new URL(to, window.location.origin);
  return {
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    scrollId: getScrollTargetFromPath(to),
  };
}

export function navigateAndScroll(to, navigate) {
  const target = parseNavTarget(to);

  navigate(
    {
      pathname: target.pathname,
      search: target.search,
      hash: target.hash,
    },
    { preventScrollReset: Boolean(target.scrollId) },
  );
}
