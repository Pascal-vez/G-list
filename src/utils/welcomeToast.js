const WELCOME_KEY = 'glist_welcome_pending';

export function setPendingWelcome({ type, name }) {
  sessionStorage.setItem(WELCOME_KEY, JSON.stringify({
    type,
    name: (name || '').trim(),
  }));
}

export function consumePendingWelcome() {
  try {
    const raw = sessionStorage.getItem(WELCOME_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(WELCOME_KEY);
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(WELCOME_KEY);
    return null;
  }
}

export function buildWelcomeMessage({ type, name }) {
  const who = name ? `, ${name}` : '';
  if (type === 'pro') {
    return `Bienvenue${who} ! Votre espace professionnel est prêt. Complétez votre profil pour être visible sur G-List.`;
  }
  return `Bienvenue${who} ! Votre compte est créé. Explorez l'annuaire et enregistrez vos favoris.`;
}

export function showWelcomeFor(ms, setMessage, payload) {
  setMessage(buildWelcomeMessage(payload));
  return window.setTimeout(() => setMessage(''), ms);
}
