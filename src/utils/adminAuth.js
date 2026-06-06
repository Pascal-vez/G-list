const ADMIN_AUTH_KEY = 'admin_auth';
const ADMIN_EXPIRY_KEY = 'admin_expiry';
const SESSION_TTL_MS = 60 * 60 * 1000;

export function isAdminSessionValid() {
  const auth = sessionStorage.getItem(ADMIN_AUTH_KEY);
  const expiry = sessionStorage.getItem(ADMIN_EXPIRY_KEY);

  if (!auth || !expiry || Date.now() > parseInt(expiry, 10)) {
    clearAdminSession();
    return false;
  }

  return true;
}

export function setAdminSession() {
  sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
  sessionStorage.setItem(ADMIN_EXPIRY_KEY, String(Date.now() + SESSION_TTL_MS));
}

export function clearAdminSession() {
  sessionStorage.clear();
}

export function formatCountdown(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}
