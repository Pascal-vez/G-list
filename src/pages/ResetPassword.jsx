import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import SeoHead from '../components/SEO/SeoHead';
import { resetPassword } from '../api/auth';
import PasswordInput from '../components/PasswordInput';
import styles from './AuthPages.module.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    const res = await resetPassword(token, password);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate('/espace-pro'), 2500);
  };

  return (
    <>
      <SeoHead titre="Réinitialiser le mot de passe" url="/reinitialiser-mot-de-passe" noIndex />
    <div className={styles.page}>
      <div className={styles.box}>
        <h1><Lock size={24} /> Nouveau mot de passe</h1>
        {done ? (
          <p className={styles.success}><CheckCircle size={18} /> Mot de passe mis à jour ! Redirection...</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.error}><AlertCircle size={16} /> {error}</p>}
            <label>
              Nouveau mot de passe
              <PasswordInput inLabel value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={styles.input} autoComplete="new-password" />
            </label>
            <label>
              Confirmer
              <PasswordInput inLabel value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={styles.input} autoComplete="new-password" />
            </label>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </form>
        )}
        <p className={styles.back}><Link to="/mot-de-passe-oublie">← Nouvelle demande</Link></p>
      </div>
    </div>
    </>
  );
}
