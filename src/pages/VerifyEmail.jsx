import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MailCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { verifyEmail } from '../api/auth';
import styles from './AuthPages.module.css';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  usePageMeta({ title: 'Vérification email', path: '/verifier-email', noIndex: true });

  useEffect(() => {
    verifyEmail(token).then((res) => setStatus(res.ok ? 'ok' : 'error'));
  }, [token]);

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <h1><MailCheck size={24} /> Vérification email</h1>
        {status === 'loading' && <p>Vérification en cours...</p>}
        {status === 'ok' && (
          <p className={styles.success}><CheckCircle size={18} /> Votre adresse email a été vérifiée avec succès.</p>
        )}
        {status === 'error' && (
          <p className={styles.error}><AlertCircle size={16} /> Lien invalide ou expiré.</p>
        )}
        <p className={styles.back}><Link to="/">← Accueil</Link></p>
      </div>
    </div>
  );
}
