/**
 * SMS transactionnels — préparation phase 3.
 * Activer quand un fournisseur est choisi (Orange SMS API, Africa's Talking, etc.).
 *
 * Backend : ajouter SMS_API_KEY + SMS_SENDER dans backend/.env
 */

export const SMS_ENABLED = import.meta.env.VITE_SMS_ENABLED === 'true';

export async function sendTransactionalSms(_phone, _message) {
  if (!SMS_ENABLED) {
    return { ok: false, skipped: true, reason: 'SMS non configuré' };
  }
  // Brancher le fournisseur SMS ici (phase ultérieure).
  return { ok: false, reason: 'Fournisseur SMS non implémenté' };
}
