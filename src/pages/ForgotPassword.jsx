import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import SeoHead from '../components/SEO/SeoHead';
import { forgotPassword } from '../api/auth';
import { apiConfig } from '../api/config';
import styles from './AuthPages.module.css';

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const defaultType = params.get('type') === 'pro' ? 'pro' : 'visiteur';
  const [userType, setUserType] = useState(defaultType);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim(), userType);
      if (!res.ok) {
        setError(res.message || 'Une erreur est survenue.');
        return;
      }
      setResult(res);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SeoHead
        titre="Mot de passe oublié"
        description="Réinitialisez votre mot de passe G-List."
        url="/mot-de-passe-oublie"
        noIndex
      />
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
            {!apiConfig.useRemoteApi && (
              <p className={styles.tokenHint}>
                Mode local — aucun email n&apos;est envoyé. Utilisez le lien ci-dessous :
                {result.token && (
                  <> <Link to={`/reinitialiser-mot-de-passe/${result.token}`}>Réinitialiser le mot de passe</Link></>
                )}
              </p>
            )}
            {apiConfig.useRemoteApi && (
              <p className={styles.tokenHint}>
                Vérifiez votre boîte mail (et les spams). L&apos;email part uniquement si le backend et Resend sont actifs.
              </p>
            )}
            {result.devLink && (
              <p className={styles.tokenHint}>
                Dev — lien direct :{' '}
                <a href={result.devLink}>Réinitialiser le mot de passe</a>
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.error}><AlertCircle size={16} /> {error}</p>}
            <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} /></label>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
            </button>
          </form>
        )}
        <p className={styles.back}><Link to={userType === 'pro' ? '/espace-pro' : '/dashboard/visiteur'}>← Retour à la connexion</Link></p>
      </div>
    </div>
    </>
  );
}
