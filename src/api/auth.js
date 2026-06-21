import { apiConfig } from './config';
import { apiRequest } from './client';
import {
  requestPasswordReset,
  resetPasswordByToken,
  verifyEmailToken,
  createEmailVerificationToken,
  updateProPasswordInRegistry,
} from '../utils/storage';

export async function forgotPassword(email, userType) {
  if (apiConfig.useRemoteApi) {
    try {
      return await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email, userType }),
      });
    } catch (err) {
      if (err.name === 'ApiError' && err.status === 0) {
        return { ok: false, message: 'API non configurée.' };
      }
      if (err instanceof TypeError || err.message?.includes('fetch')) {
        return {
          ok: false,
          message: 'Impossible de joindre le serveur. Lancez le backend : cd backend && npm start',
        };
      }
      return { ok: false, message: err.message || 'Erreur lors de l\'envoi.' };
    }
  }
  const token = requestPasswordReset(email, userType);
  if (!token) return { ok: false, message: 'Aucun compte trouvé avec cet email.' };
  return { ok: true, token, message: 'Lien de réinitialisation généré (mode local).' };
}

export async function resetPassword(token, password) {
  if (apiConfig.useRemoteApi) {
    const res = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
    if (res?.ok && res.email && res.userType === 'pro') {
      updateProPasswordInRegistry(res.email, password);
    }
    return res;
  }
  const ok = resetPasswordByToken(token, password);
  return ok ? { ok: true } : { ok: false, message: 'Lien invalide ou expiré.' };
}

export async function verifyEmail(token) {
  if (apiConfig.useRemoteApi) {
    return apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
  const entry = verifyEmailToken(token);
  return entry ? { ok: true, email: entry.email } : { ok: false, message: 'Lien invalide.' };
}

export async function sendVerificationEmail(email, userType) {
  if (apiConfig.useRemoteApi) {
    return apiRequest('/auth/send-verification', {
      method: 'POST',
      body: JSON.stringify({ email, userType }),
    });
  }
  return { token: createEmailVerificationToken(email, userType) };
}
