import { hasVisited } from '../utils/storage';
import { useEvaluation } from '../context/EvaluationContext';
import styles from './EvaluateButton.module.css';

export default function EvaluateButton() {
  const { openModal } = useEvaluation();

  if (!hasVisited()) return null;

  return (
    <button type="button" className={styles.btn} onClick={openModal}>
      Évaluer G-List
    </button>
  );
}
