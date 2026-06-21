import 'dotenv/config';
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY || '';
const resend = apiKey ? new Resend(apiKey) : null;
const FROM = process.env.RESEND_FROM || 'G-List <onboarding@resend.dev>';
const SITE_URL = (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

export function isEmailConfigured() {
  return Boolean(resend);
}

export async function sendPasswordResetEmail({ email, token }) {
  const link = `${SITE_URL}/reinitialiser-mot-de-passe/${encodeURIComponent(token)}`;

  if (!resend) {
    console.warn('[email] RESEND_API_KEY absent — lien reset:', link);
    return { ok: false, simulated: true, link };
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Réinitialisation de votre mot de passe — G-List',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="color:#0E1208;font-size:22px">G-List</h1>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe sur G-List.</p>
        <p><a href="${link}" style="display:inline-block;background:#F5C518;color:#0E1208;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Choisir un nouveau mot de passe</a></p>
        <p style="color:#666;font-size:13px">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `,
  });

  if (error) {
    console.error('[email] Resend error:', error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function sendVerificationEmail({ email, token }) {
  const link = `${SITE_URL}/verifier-email/${encodeURIComponent(token)}`;

  if (!resend) {
    console.warn('[email] RESEND_API_KEY absent — lien verify:', link);
    return { ok: false, simulated: true, link };
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Vérifiez votre adresse email — G-List',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="color:#0E1208;font-size:22px">G-List</h1>
        <p>Bonjour,</p>
        <p>Confirmez votre adresse email pour activer votre compte G-List.</p>
        <p><a href="${link}" style="display:inline-block;background:#F5C518;color:#0E1208;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Vérifier mon email</a></p>
      </div>
    `,
  });

  if (error) {
    console.error('[email] Resend error:', error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function sendAdminDemandeAbonnementEmail({
  proNom,
  proEmail,
  planDemande,
  montant,
  numeroEmetteur,
  idTransaction,
  heureTransaction,
}) {
  const to = ADMIN_EMAIL;
  const adminLink = `${SITE_URL}/admin-glist-2026?tab=abonnements`;
  const heureLabel = heureTransaction
    ? new Date(heureTransaction).toLocaleString('fr-FR')
    : 'Non fournie';

  if (!resend || !to) {
    console.warn('[email] Admin abonnement —', { proNom, planDemande, montant, numeroEmetteur, heureTransaction });
    return { ok: false, simulated: true };
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Nouvelle demande d'abonnement — ${proNom || proEmail}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="color:#0E1208;font-size:20px">Nouvelle demande d'abonnement</h1>
        <p><b>Utilisateur :</b> ${proNom || '—'} (${proEmail || '—'})</p>
        <p><b>Plan demandé :</b> ${planDemande}</p>
        <p><b>Montant :</b> ${montant} GNF</p>
        <p><b>Numéro émetteur :</b> ${numeroEmetteur}</p>
        <p><b>Heure de la transaction :</b> ${heureLabel}</p>
        <p><b>ID transaction :</b> ${idTransaction || 'Non fourni'}</p>
        <p><a href="${adminLink}">Voir et traiter la demande</a></p>
      </div>
    `,
  });

  if (error) {
    console.error('[email] Admin abonnement error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function sendSubscriptionUserEmail({
  to,
  subject,
  plan,
  planFin,
  refused,
  motif,
}) {
  if (!to) return { ok: false, simulated: true };

  let html;
  if (refused) {
    html = `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="color:#0E1208">Demande d'abonnement</h1>
        <p>Votre demande d'abonnement n'a pas pu être validée.</p>
        ${motif ? `<p><b>Motif :</b> ${motif}</p>` : ''}
      </div>
    `;
  } else {
    html = `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="color:#0E1208">Abonnement activé !</h1>
        <p>Félicitations ! Votre plan <b>${plan}</b> est actif${planFin ? ` jusqu'au ${new Date(planFin).toLocaleDateString('fr-FR')}` : ''}.</p>
        <p>Vos nouvelles fonctionnalités sont disponibles immédiatement dans votre espace pro.</p>
        <p><a href="${SITE_URL}/espace-pro?tab=notifications" style="display:inline-block;background:#F5C518;color:#0E1208;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Voir mon espace pro</a></p>
      </div>
    `;
  }

  if (!resend) {
    console.warn('[email] User abonnement —', { to, subject });
    return { ok: false, simulated: true };
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: subject || 'G-List — Abonnement',
    html,
  });

  if (error) {
    console.error('[email] User abonnement error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
