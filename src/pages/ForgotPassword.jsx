import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { forgotPassword } from '../api/auth';
import styles from './AuthPages.module.css';

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const defaultType = params.get('type') === 'pro' ? 'pro' : 'visiteur';
  const [userType, setUserType] = useState(defaultType);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  usePageMeta({
    title: 'Mot de passe oublié',
    description: 'Réinitialisez votre mot de passe G-List.',
    path: '/mot-de-passe-oublie',
    noIndex: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const res = await forgotPassword(email, userType);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setResult(res);
  };

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <h1><KeyRound size={24} /> Mot de passe oublié</h1>
        <p className={styles.sub}>Recevez un lien pour réinitialiser votre mot de passe.</p>
        <div className={styles.tabs}>
          <button type="button" className={userType === 'visiteur' ? styles.tabActive : ''} onClick={() => setUserType('visiteur')}>Visiteur</button>
          <button type="button" className={userType === 'pro' ? styles.tabActive : ''} onClick={() => setUserType('pro')}>Professionnel</button>
        </div>
        {result?.ok ? (
          <div className={styles.success}>
            <CheckCircle size={18} />
            <p>{result.message}</p>
            {result.token && (
              <p className={styles.tokenHint}>
                Mode local — utilisez ce lien :{' '}
                <Link to={`/reinitialiser-mot-de-passe/${result.token}`}>Réinitialiser le mot de passe</Link>
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.error}><AlertCircle size={16} /> {error}</p>}
            <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} /></label>
            <button type="submit" className="btn-primary">Envoyer le lien</button>
          </form>
        )}
        <p className={styles.back}><Link to={userType === 'pro' ? '/espace-pro' : '/dashboard/visiteur'}>← Retour à la connexion</Link></p>
      </div>
    </div>
  );
}
