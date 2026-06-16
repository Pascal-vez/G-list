import { useState } from 'react';
import {
  CheckCircle,
  User,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Send,
} from 'lucide-react';
import { REGIONS } from '../data/constants';
import ProfessionSelect, { resolveProfessionValue } from '../components/ProfessionSelect';
import { submitWaitlist } from '../api/waitlist';
import { usePageMeta } from '../hooks/usePageMeta';
import styles from './Join.module.css';

function Confetti() {
  const colors = ['#F5C518', '#1A1A1A', '#25D366', '#E74C3C', '#2196F3'];
  return (
    <div className={styles.confettiContainer} aria-hidden="true">
      {Array.from({ length: 50 }).map((_, i) => (
        <span
          key={i}
          className={styles.confetti}
          style={{
            left: `${Math.random() * 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

function FormField({ icon: Icon, iconColor, accent, label, children }) {
  return (
    <label className={styles.field}>
      <span className={styles.labelRow}>
        <span
          className={styles.labelIcon}
          style={{ background: accent, color: iconColor }}
          aria-hidden="true"
        >
          <Icon size={15} strokeWidth={2.2} />
        </span>
        {label}
      </span>
      {children}
    </label>
  );
}

export default function Join() {
  const [form, setForm] = useState({
    nom: '',
    categorie: '',
    profession: '',
    customProfession: '',
    region: '',
    whatsapp: '',
    email: '',
    message: '',
  });
  const [success, setSuccess] = useState(false);

  usePageMeta({
    title: 'Rejoindre G-List',
    description: 'Inscrivez-vous sur la liste d\'attente G-List — annuaire professionnel en Guinée.',
    path: '/rejoindre',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const profession = resolveProfessionValue(form.categorie, form.profession, form.customProfession);
    await submitWaitlist({ ...form, profession });
    setSuccess(true);
  };

  if (success) {
    return (
      <div className={styles.page}>
        <Confetti />
        <div className={styles.successCard}>
          <CheckCircle size={48} className={styles.successIcon} />
          <h1>Merci ! Vous êtes sur la liste.</h1>
          <p>Nous vous contactons sur WhatsApp au lancement.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Vous êtes un professionnel en Guinée ?</h1>
        <p className={styles.subtitle}>
          Rejoignez la liste d'attente G-List. Nous vous contacterons en priorité au lancement.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField label="Nom complet *" icon={User} iconColor="#F5C518" accent="rgba(245, 197, 24, 0.15)">
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Votre nom et prénom"
            />
          </FormField>

          <ProfessionSelect
            category={form.categorie}
            profession={form.profession}
            customProfession={form.customProfession}
            onCategoryChange={(v) => setForm((prev) => ({ ...prev, categorie: v, profession: '', customProfession: '' }))}
            onProfessionChange={(v) => setForm((prev) => ({ ...prev, profession: v }))}
            onCustomProfessionChange={(v) => setForm((prev) => ({ ...prev, customProfession: v }))}
          />

          <FormField label="Villes *" icon={MapPin} iconColor="#4CAF50" accent="rgba(76, 175, 80, 0.12)">
            <select
              name="region"
              value={form.region}
              onChange={handleChange}
              required
              className={`${styles.input} ${styles.select}`}
            >
              <option value="">Sélectionner une ville</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Numéro WhatsApp * (format +224...)" icon={Phone} iconColor="#25D366" accent="rgba(37, 211, 102, 0.12)">
            <input
              type="tel"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              required
              placeholder="+224 6XX XX XX XX"
              pattern="\+224[0-9\s]{8,12}"
              className={styles.input}
            />
          </FormField>

          <FormField label="Email (optionnel)" icon={Mail} iconColor="#5C9EFF" accent="rgba(92, 158, 255, 0.12)">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              className={styles.input}
            />
          </FormField>

          <FormField label="Message libre (optionnel)" icon={MessageSquare} iconColor="#AB47BC" accent="rgba(171, 71, 188, 0.12)">
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              placeholder="Qu'est-ce qui vous manque le plus comme outil professionnel ?"
              className={styles.textarea}
            />
          </FormField>

          <button type="submit" className={styles.submitBtn}>
            <Send size={18} aria-hidden="true" />
            Rejoindre G-List
          </button>
        </form>
      </div>
    </div>
  );
}
