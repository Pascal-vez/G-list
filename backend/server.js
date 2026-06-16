import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { getCollection, pushToCollection, setNested, getNested } from './store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'g-list-api', version: '1.0.0' });
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

// ── Auth stubs ──
app.post('/api/auth/forgot-password', (req, res) => {
  const { email, userType } = req.body;
  const token = `rst_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  setNested('passwordResets', token, {
    email: email?.trim().toLowerCase(),
    userType,
    expires: Date.now() + 3600000,
  });
  // TODO: envoyer email avec lien /reinitialiser-mot-de-passe/:token
  res.json({ ok: true, token, message: 'Lien de réinitialisation généré.' });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const entry = getNested('passwordResets', token);
  if (!entry || entry.expires < Date.now()) {
    return res.status(400).json({ ok: false, message: 'Lien invalide ou expiré.' });
  }
  const hash = await bcrypt.hash(password, 12);
  setNested('users', entry.email, { passwordHash: hash, userType: entry.userType });
  res.json({ ok: true });
});

app.post('/api/auth/verify-email', (req, res) => {
  const entry = getNested('emailVerifications', req.body.token);
  if (!entry) return res.status(400).json({ ok: false, message: 'Lien invalide.' });
  res.json({ ok: true, email: entry.email });
});

app.post('/api/auth/send-verification', (req, res) => {
  const token = `ver_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  setNested('emailVerifications', token, {
    email: req.body.email?.trim().toLowerCase(),
    userType: req.body.userType,
  });
  res.json({ ok: true, token });
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

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur serveur interne.' });
});

app.listen(PORT, () => {
  console.log(`G-List API → http://localhost:${PORT}/api/health`);
});
