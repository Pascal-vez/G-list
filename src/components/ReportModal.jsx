import { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { submitReport } from '../api/reports';
import styles from './ReportModal.module.css';

const REASONS = [
  'Informations incorrectes',
  'Profil frauduleux',
  'Contenu inapproprié',
  'Harcèlement ou spam',
  'Autre',
];

export default function ReportModal({ pro, onClose }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await submitReport({ proId: pro.id, proNom: pro.nom, reason, details });
      setSent(true);
      setTimeout(onClose, 2000);
    } catch {
      setError('Impossible d\'envoyer le signalement. Réessayez.');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="report-title">
        <div className={styles.header}>
          <h2 id="report-title"><Flag size={20} /> Signaler ce profil</h2>
          <button type="button" onClick={onClose} aria-label="Fermer"><X size={20} /></button>
        </div>
        {sent ? (
          <p className={styles.success}>Merci. Votre signalement a été enregistré et sera examiné par notre équipe.</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <p>Signaler <strong>{pro.nom}</strong></p>
            <label>
              Motif
              <select value={reason} onChange={(e) => setReason(e.target.value)} className={styles.select}>
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label>
              Détails (optionnel)
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} className={styles.textarea} placeholder="Décrivez le problème..." />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className="btn-primary">Envoyer le signalement</button>
          </form>
        )}
      </div>
    </div>
  );
}
