import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';
import { submitContact } from '../api/contact';
import styles from './Contact.module.css';

export default function Contact() {
  usePageMeta({
    title: 'Contact',
    description: 'Contactez l\'équipe G-List — support, partenariats et questions générales.',
    path: '/contact',
    pageKey: 'contact',
  });

  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await submitContact(form);
      setSent(true);
      setForm({ nom: '', email: '', sujet: '', message: '' });
    } catch {
      setError('Envoi impossible. Réessayez ou contactez-nous sur WhatsApp.');
    }
  };

  return (
    <InfoPageLayout title="Contact" subtitle="Nous sommes à votre écoute" pageKey="apropos">
      <div className={styles.grid}>
        <div className={styles.info}>
          <InfoSection title="Coordonnées">
            <ul className={styles.list}>
              <li><MapPin size={16} /> Conakry, République de Guinée</li>
              <li><Phone size={16} /> <a href="https://wa.me/224626419331">+224 626 41 93 31 (WhatsApp)</a></li>
              <li><Mail size={16} /> <a href="mailto:contact@g-list.gn">contact@g-list.gn</a></li>
            </ul>
            <p className={styles.hours}>Lun – Sam · 8h – 18h (GMT)</p>
          </InfoSection>
        </div>
        <div className={styles.formWrap}>
          <h2>Envoyer un message</h2>
          {sent && <p className={styles.success}><CheckCircle size={16} /> Message envoyé ! Nous vous répondrons rapidement.</p>}
          {error && <p className={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <label>Nom<input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className={styles.input} /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={styles.input} /></label>
            <label>Sujet<input value={form.sujet} onChange={(e) => setForm({ ...form, sujet: e.target.value })} required className={styles.input} /></label>
            <label>Message<textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} className={styles.textarea} /></label>
            <button type="submit" className="btn-primary"><Send size={18} /> Envoyer</button>
          </form>
        </div>
      </div>
    </InfoPageLayout>
  );
}
