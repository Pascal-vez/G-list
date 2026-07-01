import 'dotenv/config';
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY || '';
const resend = apiKey ? new Resend(apiKey) : null;
const FROM = process.env.RESEND_FROM || 'G-List <onboarding@resend.dev>';
const SITE_URL = (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

function resolveAdminEmail(override) {
  const fromRequest = (override || '').trim();
  if (fromRequest) return fromRequest;
  return ADMIN_EMAIL.trim();
}

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
  adminEmail,
  proNom,
  proEmail,
  planDemande,
  montant,
  numeroEmetteur,
  idTransaction,
  heureTransaction,
}) {
  const to = resolveAdminEmail(adminEmail);
  const adminLink = `${SITE_URL}/admin-glist-2026?tab=abonnements`;
  const heureLabel = heureTransaction
    ? new Date(heureTransaction).toLocaleString('fr-FR')
    : 'Non fournie';

  if (!resend || !to) {
    console.warn('[email] Admin abonnement — pas de destinataire ou Resend absent', {
      to: to || '(vide)',
      proNom,
      planDemande,
    });
    return { ok: false, simulated: true, reason: !to ? 'NO_ADMIN_EMAIL' : 'NO_RESEND' };
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `🔔 Nouvelle demande d'abonnement — ${proNom || proEmail}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f9f9f7">
        <div style="background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e5e5e0">
          <h1 style="color:#0E1208;font-size:20px;margin:0 0 4px">Nouvelle demande d'abonnement</h1>
          <p style="color:#666;font-size:13px;margin:0 0 24px">G-List · Tableau de bord admin</p>

          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#888;width:45%">Utilisateur</td><td style="padding:8px 0;font-weight:600;color:#0E1208">${proNom || '—'} <span style="font-weight:400;color:#555">(${proEmail || '—'})</span></td></tr>
            <tr style="background:#f5f5f2"><td style="padding:8px 6px;color:#888">Plan demandé</td><td style="padding:8px 6px;font-weight:600;color:#0E1208;text-transform:uppercase">${planDemande}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Montant</td><td style="padding:8px 0;font-weight:700;color:#0E1208;font-size:16px">${new Intl.NumberFormat('fr-GN').format(montant || 0)} GNF</td></tr>
            <tr style="background:#f5f5f2"><td style="padding:8px 6px;color:#888">Numéro émetteur</td><td style="padding:8px 6px;font-family:monospace;color:#0E1208">${numeroEmetteur || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Heure transaction</td><td style="padding:8px 0;color:#0E1208">${heureLabel}</td></tr>
            <tr style="background:#f5f5f2"><td style="padding:8px 6px;color:#888">ID transaction</td><td style="padding:8px 6px;font-family:monospace;color:#555">${idTransaction || 'Non fourni'}</td></tr>
          </table>

          <div style="margin-top:28px;text-align:center">
            <a href="${adminLink}" style="display:inline-block;background:#F5C518;color:#0E1208;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
              Vérifier et activer la demande →
            </a>
          </div>
          <p style="color:#aaa;font-size:12px;text-align:center;margin-top:16px">
            Connectez-vous au panneau admin pour valider ou refuser cette demande.
          </p>
        </div>
        <p style="color:#bbb;font-size:11px;text-align:center;margin-top:16px">G-List Guinée · Cet email est automatique, ne pas répondre.</p>
      </div>
    `,
  });

  if (error) {
    console.error('[email] Admin abonnement error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function sendUserDemandeRecueEmail({ to, plan, montant }) {
  if (!to) return { ok: false, simulated: true, reason: 'NO_TO' };

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h1 style="color:#0E1208">Demande reçue</h1>
      <p>Bonjour,</p>
      <p>Nous avons bien reçu votre demande d'abonnement <b>${plan || '—'}</b>${montant ? ` (${montant} GNF)` : ''}.</p>
      <p>Notre équipe vérifie votre paiement Orange Money et vous activera sous peu. Vous recevrez une notification dès l'activation.</p>
      <p style="color:#666;font-size:13px">Merci de votre confiance — G-List Guinée</p>
    </div>
  `;

  if (!resend) {
    console.warn('[email] Demande reçue user —', { to, plan });
    return { ok: false, simulated: true, reason: 'NO_RESEND' };
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Demande d\'abonnement reçue — G-List',
    html,
  });

  if (error) {
    console.error('[email] Demande reçue error:', error);
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
