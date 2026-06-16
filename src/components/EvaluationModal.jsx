import { useState } from 'react';
import { X, CheckCircle, Send } from 'lucide-react';
import { addEvaluation } from '../utils/storage';
import styles from './EvaluationModal.module.css';

const UTILE_OPTIONS = ['Oui, absolument', 'Peut-être', 'Non'];

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className={styles.stars} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${star <= display ? styles.starActive : ''}`}
          onMouseEnter={() => setHover(star)}
          onClick={() => onChange(star)}
          aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function EvaluationModal({ open, onClose }) {
  const [utile, setUtile] = useState('');
  const [plusPlu, setPlusPlu] = useState('');
  const [ameliorer, setAmeliorer] = useState('');
  const [note, setNote] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!utile || !note) return;

    addEvaluation({
      utile,
      plusPlu: plusPlu.trim(),
      ameliorer: ameliorer.trim(),
      note,
      date: new Date().toISOString(),
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setUtile('');
      setPlusPlu('');
      setAmeliorer('');
      setNote(0);
    }, 3000);
  };

  const handleClose = () => {
    onClose();
    setSubmitted(false);
    setUtile('');
    setPlusPlu('');
    setAmeliorer('');
    setNote(0);
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="presentation">
      <div className={styles.card} role="dialog" aria-modal="true" aria-labelledby="eval-title">
        <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Fermer">
          <X size={22} />
        </button>

        {submitted ? (
          <div className={styles.success}>
            <CheckCircle size={48} className={styles.successIcon} aria-hidden="true" />
            <h2 className={styles.successTitle}>Merci pour votre évaluation !</h2>
            <p className={styles.successText}>
              Vous contribuez à construire la bonne solution pour la Guinée.
            </p>
            <button type="button" className={styles.closeLink} onClick={handleClose}>
              Fermer
            </button>
          </div>
        ) : (
          <>
            <p className={styles.logo}>
              <span className={styles.logoG}>G</span>
              <span className={styles.logoList}>-List</span>
            </p>

            <h2 id="eval-title" className={styles.title}>Votre avis sur G-List</h2>
            <p className={styles.subtitle}>
              Votre avis nous aide à construire la bonne solution pour la Guinée
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <fieldset className={styles.field}>
                <legend className={styles.label}>Cette plateforme vous serait-elle utile en Guinée ?</legend>
                <div className={styles.choiceRow}>
                  {UTILE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`${styles.choiceBtn} ${utile === option ? styles.choiceBtnActive : ''}`}
                      onClick={() => setUtile(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="eval-plus">
                  Qu&apos;est-ce qui vous a le plus plu ?
                </label>
                <textarea
                  id="eval-plus"
                  className={styles.textarea}
                  value={plusPlu}
                  onChange={(e) => setPlusPlu(e.target.value)}
                  rows={3}
                  placeholder="Ex : l'interface est claire, les catégories sont utiles..."
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="eval-minus">
                  Qu&apos;est-ce qui manque ou doit être amélioré ?
                </label>
                <textarea
                  id="eval-minus"
                  className={styles.textarea}
                  value={ameliorer}
                  onChange={(e) => setAmeliorer(e.target.value)}
                  rows={3}
                  placeholder="Ex : il manque une carte, les photos, les vrais numéros..."
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Recommanderiez-vous G-List ?</span>
                <StarPicker value={note} onChange={setNote} />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!utile || !note}
              >
                <Send size={16} />
                Envoyer mon évaluation
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
