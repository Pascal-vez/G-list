import { useState, useEffect } from 'react';
import { X, Copy, Check, Smartphone, ArrowLeft, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { fetchConfigPaiement, submitDemandeAbonnement } from '../../api/abonnement';
import { PLANS_INFO, planLabel, toPlanDemande } from '../../utils/plans';
import DateTimePicker from '../DateTimePicker';
import styles from './ModalAbonnement.module.css';

function formatGNF(n) {
  return new Intl.NumberFormat('fr-GN').format(n);
}

export default function ModalAbonnement({
  open,
  onClose,
  planId,
  account,
  onSuccess,
}) {
  const [step, setStep] = useState('instructions');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [numeroEmetteur, setNumeroEmetteur] = useState('');
  const [idTransaction, setIdTransaction] = useState('');
  const [heureTransaction, setHeureTransaction] = useState('');
  const [error, setError] = useState('');

  const planDemande = toPlanDemande(planId);
  const info = PLANS_INFO[planDemande];

  useEffect(() => {
    if (!open) return;
    setStep('instructions');
    setNumeroEmetteur('');
    setIdTransaction('');
    setHeureTransaction('');
    setError('');
    fetchConfigPaiement().then(setConfig).catch(() => setConfig(null));
  }, [open, planId]);

  if (!open) return null;

  const handleCopy = async () => {
    const num = config?.numero_depot || '+224626419331';
    try {
      await navigator.clipboard.writeText(num);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!numeroEmetteur.trim()) {
      setError('Le numéro émetteur est obligatoire.');
      return;
    }
    if (!heureTransaction.trim()) {
      setError('Indiquez la date et l\'heure de votre transaction.');
      return;
    }
    setLoading(true);
    try {
      await submitDemandeAbonnement({
        account,
        planId,
        numeroEmetteur,
        idTransaction,
        heureTransaction: new Date(heureTransaction).toISOString(),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Impossible d\'envoyer la demande.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={`${styles.modal} lightSurface`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-abonnement-title"
      >
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
          <X size={20} />
        </button>

        {step === 'instructions' ? (
          <>
            <h2 id="modal-abonnement-title">
              S&apos;abonner au plan {info?.nom || planLabel(planDemande)}
            </h2>
            <p className={styles.subtitle}>Paiement manuel via {config?.operateur || 'Orange Money'}</p>

            <div className={styles.amountBox}>
              <span>Montant à payer</span>
              <strong>{formatGNF(info?.prix || 0)} GNF</strong>
            </div>

            <ol className={styles.steps}>
              <li>
                Effectuez le dépôt sur ce numéro :
                <div className={styles.depotCard}>
                  <Smartphone size={18} aria-hidden />
                  <div>
                    <strong>{config?.numero_depot || '+224626419331'}</strong>
                    <span>{config?.operateur || 'Orange Money'}{config?.nom_titulaire ? ` · ${config.nom_titulaire}` : ''}</span>
                  </div>
                  <button type="button" className={styles.copyBtn} onClick={handleCopy}>
                    {copied ? <><Check size={14} /> Copié</> : <><Copy size={14} /> Copier</>}
                  </button>
                </div>
              </li>
              <li>Une fois le dépôt effectué, confirmez ci-dessous.</li>
            </ol>

            <button type="button" className={styles.primaryBtn} onClick={() => setStep('confirm')}>
              <Check size={16} aria-hidden />
              C&apos;est fait, j&apos;ai payé
              <ArrowRight size={16} aria-hidden />
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 id="modal-abonnement-title">Confirmer votre paiement</h2>
            <p className={styles.subtitle}>Plan {info?.nom} — {formatGNF(info?.prix || 0)} GNF</p>

            <label className={styles.field}>
              Numéro depuis lequel vous avez effectué la transaction *
              <input
                type="tel"
                value={numeroEmetteur}
                onChange={(e) => setNumeroEmetteur(e.target.value)}
                placeholder="+224 6XX XXX XXX"
                required
              />
            </label>

            <label className={styles.field}>
              Date et heure de la transaction *
              <DateTimePicker
                id="heure-transaction"
                value={heureTransaction}
                onChange={setHeureTransaction}
                placeholder="Cliquez pour ouvrir le calendrier"
                max={new Date()}
                min={new Date(Date.now() - 30 * 86400000)}
                required
              />
              <small>Choisissez la date et l&apos;heure figurant sur votre reçu Orange Money.</small>
            </label>

            <label className={styles.field}>
              Identifiant de transaction (optionnel)
              <input
                type="text"
                value={idTransaction}
                onChange={(e) => setIdTransaction(e.target.value)}
                placeholder="Visible sur votre reçu Orange Money"
              />
              <small>Facultatif — utile pour accélérer la validation.</small>
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setStep('instructions')}>
                <ArrowLeft size={14} aria-hidden /> Retour
              </button>
              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? 'Envoi…' : 'Valider'}
                {!loading && <ArrowRight size={16} aria-hidden />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function ToastAbonnement({ message, onClose }) {
  if (!message) return null;
  return createPortal(
    <div className={styles.toast} role="status">
      <Check size={18} aria-hidden />
      <div>
        <strong>{message.title}</strong>
        <p>{message.body}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Fermer">×</button>
    </div>,
    document.body,
  );
}
