import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import PasswordInput from './PasswordInput';
import { MIN_DELETION_REASON_LENGTH } from '../utils/accountDeletionFeedback';
import styles from './AccountDeletionFlow.module.css';

export default function AccountDeletionFlow({
  accountLabel,
  onDelete,
  hint = 'La suppression efface votre compte et les données associées. Cette action ne peut pas être annulée.',
}) {
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const openDeleteWarning = () => {
    setDeleteError('');
    if (!deleteReason.trim() || deleteReason.trim().length < MIN_DELETION_REASON_LENGTH) {
      setDeleteError(`Indiquez pourquoi vous supprimez votre compte (minimum ${MIN_DELETION_REASON_LENGTH} caractères).`);
      return;
    }
    if (!deletePassword) {
      setDeleteError('Saisissez votre mot de passe pour continuer.');
      return;
    }
    setShowDeleteWarning(true);
  };

  const closeDeleteWarning = () => {
    if (deleting) return;
    setShowDeleteWarning(false);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    setDeleteError('');
    setDeleting(true);
    const result = await onDelete?.({ password: deletePassword, reason: deleteReason.trim() });
    setDeleting(false);

    if (result?.ok === false) {
      if (result.error === 'PASSWORD_INVALID') {
        setDeleteError('Mot de passe incorrect.');
      } else if (result.error === 'REASON_REQUIRED') {
        setDeleteError(result.message || 'La raison de suppression est obligatoire.');
      } else {
        setDeleteError(result.message || 'Impossible de supprimer le compte.');
      }
      return;
    }

    setShowDeleteWarning(false);
    setDeletePassword('');
    setDeleteReason('');
  };

  return (
    <section className={styles.panel}>
      <h3>Supprimer mon compte</h3>
      <p className={styles.hint}>{hint}</p>

      <label className={styles.field}>
        <span>Pourquoi supprimez-vous votre compte ? *</span>
        <textarea
          value={deleteReason}
          onChange={(e) => { setDeleteReason(e.target.value); setDeleteError(''); }}
          className={styles.textarea}
          rows={4}
          placeholder="Ex. : je n'utilise plus le service, tarifs, fonctionnalités manquantes…"
          required
          minLength={MIN_DELETION_REASON_LENGTH}
        />
        <small className={styles.charHint}>
          {deleteReason.trim().length}/{MIN_DELETION_REASON_LENGTH} caractères minimum — transmis à l&apos;équipe G-List
        </small>
      </label>

      <label className={styles.field}>
        <span>Confirmer avec votre mot de passe *</span>
        <PasswordInput
          inLabel
          value={deletePassword}
          onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
          className={styles.input}
          placeholder="Votre mot de passe"
          autoComplete="current-password"
        />
      </label>

      {deleteError && !showDeleteWarning && <p className={styles.error}>{deleteError}</p>}

      <button
        type="button"
        className={styles.deleteBtn}
        onClick={openDeleteWarning}
        disabled={deleting}
      >
        <Trash2 size={16} aria-hidden="true" />
        Supprimer mon compte
      </button>

      {showDeleteWarning && (
        <div className={styles.overlay} onClick={closeDeleteWarning} role="presentation">
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-desc"
          >
            <div className={styles.modalIcon} aria-hidden="true">
              <AlertTriangle size={40} />
            </div>
            <h4 id="delete-account-title">Supprimer définitivement votre compte ?</h4>
            <p id="delete-account-desc" className={styles.modalLead}>
              Vous êtes sur le point de supprimer le compte <strong>{accountLabel}</strong>.
              Cette action est <strong>irréversible</strong>.
            </p>
            <blockquote className={styles.reasonPreview}>
              « {deleteReason.trim()} »
            </blockquote>
            {deleteError && <p className={styles.modalError}>{deleteError}</p>}
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={closeDeleteWarning} disabled={deleting}>
                Annuler
              </button>
              <button type="button" className={styles.confirmBtn} onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? 'Suppression…' : 'Oui, supprimer mon compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
