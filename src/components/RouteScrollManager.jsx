import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getScrollTargetFromPath, scrollToId, scrollToTop } from '../utils/scrollToId';

export default function RouteScrollManager() {
  const { pathname, hash, search } = useLocation();
  const routeKey = `${pathname}${search}${hash}`;
  const prevKey = useRef('');

  useEffect(() => {
    if (prevKey.current === routeKey) return;
    prevKey.current = routeKey;

    const scrollTarget = getScrollTargetFromPath(`${pathname}${search}${hash}`);

    if (scrollTarget) {
      scrollToId(scrollTarget);
    } else {
      scrollToTop('auto');
    }
  }, [routeKey, pathname, hash, search]);

  return null;
}
