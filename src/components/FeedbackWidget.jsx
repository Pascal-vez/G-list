import { useState } from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown, Lightbulb, Send } from 'lucide-react';
import { hasFeedbackVoted, recordFeedbackVote, addSuggestion } from '../utils/storage';
import styles from './FeedbackWidget.module.css';

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [voted, setVoted] = useState(hasFeedbackVoted());
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [thanks, setThanks] = useState(false);

  const handleVote = (positive) => {
    recordFeedbackVote(positive);
    setVoted(true);
    setThanks(true);
    setTimeout(() => {
      setOpen(false);
      setThanks(false);
    }, 2000);
  };

  const handleSuggestion = (e) => {
    e.preventDefault();
    if (suggestion.trim()) {
      addSuggestion(suggestion.trim());
      setSuggestion('');
      setThanks(true);
      setVoted(true);
      setTimeout(() => {
        setOpen(false);
        setThanks(false);
        setShowSuggestion(false);
      }, 2500);
    }
  };

  return (
    <div className={styles.container}>
      {open && (
        <div className={styles.popup}>
          {thanks ? (
            <p className={styles.thanks}>Merci pour votre retour !</p>
          ) : voted ? (
            <>
              <p className={styles.popupTitle}>G-List — Votre avis compte !</p>
              <p className={styles.popupText}>Merci, vous avez déjà donné votre avis.</p>
              {showSuggestion ? (
                <form onSubmit={handleSuggestion}>
                  <textarea
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="Votre suggestion..."
                    className={styles.textarea}
                    rows={3}
                    required
                  />
                  <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Send size={15} /> Envoyer
                  </button>
                </form>
              ) : (
                <button className={styles.suggestBtn} onClick={() => setShowSuggestion(true)}>
                  <Lightbulb size={16} />
                  Laisser une suggestion
                </button>
              )}
            </>
          ) : showSuggestion ? (
            <form onSubmit={handleSuggestion}>
              <p className={styles.popupTitle}>G-List — Votre avis compte !</p>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Votre suggestion..."
                className={styles.textarea}
                rows={3}
                required
              />
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Envoyer
              </button>
            </form>
          ) : (
            <>
              <p className={styles.popupTitle}>G-List — Votre avis compte !</p>
              <p className={styles.popupText}>
                Cette plateforme vous serait utile en Guinée ?
              </p>
              <div className={styles.voteBtns}>
                <button className={styles.yesBtn} onClick={() => handleVote(true)}>
                  <ThumbsUp size={16} />
                  Oui !
                </button>
                <button className={styles.noBtn} onClick={() => handleVote(false)}>
                  <ThumbsDown size={16} />
                  Non
                </button>
              </div>
              <button className={styles.suggestBtn} onClick={() => setShowSuggestion(true)}>
                <Lightbulb size={16} />
                Laisser une suggestion
              </button>
            </>
          )}
        </div>
      )}
      <button
        className={styles.fab}
        onClick={() => setOpen(!open)}
        aria-label="Feedback"
      >
        <MessageCircle size={20} strokeWidth={2} />
      </button>
    </div>
  );
}
