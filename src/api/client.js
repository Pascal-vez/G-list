import { apiConfig } from './config';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export async function apiRequest(path, options = {}) {
  if (!apiConfig.useRemoteApi) {
    throw new ApiError('API distante non configurée', 0);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      const hint = response.status === 404
        ? 'Route API introuvable — redémarrez le backend (npm run dev dans backend/).'
        : 'Réponse serveur invalide';
      throw new ApiError(hint, response.status, text);
    }
  }

  if (!response.ok) {
    throw new ApiError(body?.message || response.statusText, response.status, body);
  }

  return body;
}
