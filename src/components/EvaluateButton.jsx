import { hasVisited } from '../utils/storage';
import { useEvaluation } from '../context/EvaluationContext';
import { useTranslation } from '../i18n/I18nContext';
import styles from './EvaluateButton.module.css';

export default function EvaluateButton() {
  const { openModal } = useEvaluation();
  const { t } = useTranslation();

  if (!hasVisited()) return null;

  return (
    <button type="button" className={styles.btn} onClick={openModal}>
      {t('evaluate.cta')}
    </button>
  );
}
