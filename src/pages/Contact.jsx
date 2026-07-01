import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import SeoHead from '../components/SEO/SeoHead';
import { submitContact } from '../api/contact';
import { SITE_CONTACT_EMAIL } from '../data/constants';
import { useTranslation } from '../i18n/I18nContext';
import styles from './Contact.module.css';

export default function Contact() {
  const { t } = useTranslation();
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
      setError(t('contact.form.error'));
    }
  };

  return (
    <>
      <SeoHead
        titre={t('contact.title')}
        description={t('contact.meta.description')}
        url="/contact"
      />
    <InfoPageLayout title={t('contact.title')} subtitle={t('contact.subtitle')} pageKey="apropos">
      <div className={styles.grid}>
        <div className={styles.info}>
          <InfoSection title={t('contact.info.title')}>
            <ul className={styles.list}>
              <li><MapPin size={16} /> {t('contact.info.address')}</li>
              <li><Phone size={16} /> <a href="https://wa.me/224626419331">+224 626 41 93 31 (WhatsApp)</a></li>
              <li><Mail size={16} /> <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a></li>
            </ul>
            <p className={styles.hours}>{t('contact.info.hours')}</p>
          </InfoSection>
        </div>
        <div className={styles.formWrap}>
          <h2>{t('contact.form.title')}</h2>
          {sent && <p className={styles.success}><CheckCircle size={16} /> {t('contact.form.success')}</p>}
          {error && <p className={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <label>{t('contact.form.name')}<input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className={styles.input} /></label>
            <label>{t('contact.form.email')}<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={styles.input} /></label>
            <label>{t('contact.form.subject')}<input value={form.sujet} onChange={(e) => setForm({ ...form, sujet: e.target.value })} required className={styles.input} /></label>
            <label>{t('contact.form.message')}<textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} className={styles.textarea} /></label>
            <button type="submit" className="btn-primary"><Send size={18} /> {t('contact.form.submit')}</button>
          </form>
        </div>
      </div>
    </InfoPageLayout>
    </>
  );
}
