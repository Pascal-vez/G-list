import { apiConfig } from './config';
import { apiRequest } from './client';
import {
  requestPasswordReset,
  resetPasswordByToken,
  verifyEmailToken,
  createEmailVerificationToken,
} from '../utils/storage';

export async function forgotPassword(email, userType) {
  if (apiConfig.useRemoteApi) {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, userType }),
    });
  }
  const token = requestPasswordReset(email, userType);
  if (!token) return { ok: false, message: 'Aucun compte trouvé avec cet email.' };
  return { ok: true, token, message: 'Lien de réinitialisation généré (mode local).' };
}

export async function resetPassword(token, password) {
  if (apiConfig.useRemoteApi) {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
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
