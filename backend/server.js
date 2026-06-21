import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { getCollection, pushToCollection, setNested, getNested } from './store.js';
import { isEmailConfigured, sendPasswordResetEmail, sendVerificationEmail, sendAdminDemandeAbonnementEmail, sendSubscriptionUserEmail } from './email.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'g-list-api',
    version: '1.0.0',
    email: isEmailConfigured(),
  });
});

// ── Waitlist ──
app.post('/api/waitlist', (req, res) => {
  const entry = { ...req.body, id: Date.now(), date: new Date().toISOString() };
  pushToCollection('waitlist', entry);
  res.status(201).json(entry);
});

app.get('/api/waitlist', (_req, res) => {
  res.json(getCollection('waitlist'));
});

// ── Contact ──
app.post('/api/contact', (req, res) => {
  const entry = { ...req.body, id: Date.now(), date: new Date().toISOString() };
  pushToCollection('contact', entry);
  res.status(201).json(entry);
});

// ── Reports ──
app.post('/api/reports', (req, res) => {
  const entry = { ...req.body, id: Date.now(), date: new Date().toISOString(), status: 'pending' };
  pushToCollection('reports', entry);
  res.status(201).json(entry);
});

app.get('/api/reports', (_req, res) => {
  res.json(getCollection('reports'));
});

// ── Auth ──
app.post('/api/auth/forgot-password', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { userType } = req.body;
  if (!email) {
    return res.status(400).json({ ok: false, message: 'Email requis.' });
  }

  const token = `rst_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  setNested('passwordResets', token, {
    email,
    userType,
    expires: Date.now() + 3600000,
  });

  const sent = await sendPasswordResetEmail({ email, token });
  if (!sent.ok && !sent.simulated) {
    return res.status(502).json({ ok: false, message: sent.error || 'Envoi email impossible.' });
  }

  const payload = {
    ok: true,
    message: sent.ok
      ? 'Un email de réinitialisation a été envoyé si ce compte existe.'
      : 'Lien de réinitialisation généré (mode dev).',
  };
  if (process.env.NODE_ENV !== 'production' && sent.simulated) {
    payload.devLink = sent.link;
  }
  res.json(payload);
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const entry = getNested('passwordResets', token);
  if (!entry || entry.expires < Date.now()) {
    return res.status(400).json({ ok: false, message: 'Lien invalide ou expiré.' });
  }
  const hash = await bcrypt.hash(password, 12);
  setNested('users', entry.email, { passwordHash: hash, userType: entry.userType });
  setNested('passwordResets', token, null);
  res.json({ ok: true, email: entry.email, userType: entry.userType });
});

app.post('/api/auth/verify-password', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ ok: false });
  }
  const user = getNested('users', email);
  if (!user?.passwordHash) {
    return res.json({ ok: false });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  res.json({ ok: match });
});

app.get('/api/auth/email-exists', (req, res) => {
  const email = req.query.email?.trim().toLowerCase();
  if (!email) return res.status(400).json({ exists: false });
  res.json({ exists: Boolean(getNested('users', email)?.passwordHash) });
});

app.post('/api/auth/register', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password, userType = 'pro' } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ ok: false, message: 'Email et mot de passe (6 car. min.) requis.' });
  }
  if (getNested('users', email)?.passwordHash) {
    return res.status(409).json({ ok: false, message: 'Email déjà utilisé.' });
  }
  const hash = await bcrypt.hash(password, 12);
  setNested('users', email, { passwordHash: hash, userType });
  res.status(201).json({ ok: true, email });
});

app.post('/api/auth/delete-account', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email et mot de passe requis.' });
  }

  const user = getNested('users', email);
  if (!user?.passwordHash) {
    return res.json({ ok: true, deleted: false });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(403).json({ ok: false, message: 'Mot de passe incorrect.' });
  }

  setNested('users', email, null);

  const resets = getCollection('passwordResets');
  if (resets && typeof resets === 'object') {
    for (const [token, entry] of Object.entries(resets)) {
      if (entry?.email === email) {
        setNested('passwordResets', token, null);
      }
    }
  }

  const verifications = getCollection('emailVerifications');
  if (verifications && typeof verifications === 'object') {
    for (const [token, entry] of Object.entries(verifications)) {
      if (entry?.email === email) {
        setNested('emailVerifications', token, null);
      }
    }
  }

  res.json({ ok: true, deleted: true });
});

app.post('/api/auth/verify-email', (req, res) => {
  const entry = getNested('emailVerifications', req.body.token);
  if (!entry) return res.status(400).json({ ok: false, message: 'Lien invalide.' });
  res.json({ ok: true, email: entry.email });
});

app.post('/api/auth/send-verification', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { userType } = req.body;
  if (!email) {
    return res.status(400).json({ ok: false, message: 'Email requis.' });
  }

  const token = `ver_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  setNested('emailVerifications', token, { email, userType });

  const sent = await sendVerificationEmail({ email, token });
  if (!sent.ok && !sent.simulated) {
    return res.status(502).json({ ok: false, message: sent.error || 'Envoi email impossible.' });
  }

  const payload = {
    ok: true,
    message: sent.ok ? 'Email de vérification envoyé.' : 'Lien généré (mode dev).',
  };
  if (process.env.NODE_ENV !== 'production' && sent.simulated) {
    payload.devLink = sent.link;
  }
  res.json(payload);
});

// ── Professionals placeholder (à connecter à une vraie DB) ──
app.get('/api/professionals', (_req, res) => {
  res.json({ message: 'Connecter une base de données et importer les professionnels.' });
});

app.get('/api/professionals/:id', (req, res) => {
  res.status(404).json({ message: `Professionnel ${req.params.id} non trouvé — DB non configurée.` });
});

app.post('/api/professionals/:id/reviews', (req, res) => {
  const proId = req.params.id;
  const review = { ...req.body, id: Date.now(), date: new Date().toISOString() };
  const reviews = getNested('reviews', proId) || [];
  reviews.unshift(review);
  setNested('reviews', proId, reviews);
  res.status(201).json(review);
});

app.get('/api/professionals/:id/reviews', (req, res) => {
  res.json(getNested('reviews', req.params.id) || []);
});

// ── Abonnement manuel ──
app.post('/api/abonnement/notify-admin', async (req, res) => {
  try {
    const raw = req.body || {};
    const acc = raw.account || {};
    const sent = await sendAdminDemandeAbonnementEmail({
      proNom: raw.proNom || acc.nom,
      proEmail: raw.proEmail || acc.email,
      planDemande: raw.planDemande,
      montant: raw.montant,
      numeroEmetteur: raw.numeroEmetteur,
      idTransaction: raw.idTransaction,
      heureTransaction: raw.heureTransaction,
    });
    res.json({ ok: true, email: sent.ok, simulated: sent.simulated });
  } catch (err) {
    console.error('[abonnement] notify-admin:', err);
    res.status(500).json({ message: 'Erreur envoi email admin.' });
  }
});

app.post('/api/abonnement/notify-user', async (req, res) => {
  try {
    const sent = await sendSubscriptionUserEmail(req.body || {});
    res.json({ ok: true, email: sent.ok, simulated: sent.simulated });
  } catch (err) {
    console.error('[abonnement] notify-user:', err);
    res.status(500).json({ message: 'Erreur envoi email utilisateur.' });
  }
});

app.post('/api/cron/verify-subscriptions', (_req, res) => {
  res.json({ ok: true, message: 'Exécuter verifier-abonnements via Supabase Edge Function ou cron local.' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur serveur interne.' });
});

app.listen(PORT, () => {
  console.log(`G-List API → http://localhost:${PORT}/api/health`);
});
