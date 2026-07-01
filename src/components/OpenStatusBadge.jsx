import { getOpenStatus } from '../utils/horaires';
import { useTranslation } from '../i18n/I18nContext';
import styles from './OpenStatusBadge.module.css';

function resolveHint(t, status) {
  if (!status.hintKey) return status.hint;
  const vars = { ...status.hintVars };
  if (vars.day != null) {
    vars.day = t(`day.${vars.day}`);
  }
  return t(status.hintKey, vars);
}

export default function OpenStatusBadge({ horaires, className = '' }) {
  const { t } = useTranslation();
  const status = getOpenStatus(horaires);
  const hint = resolveHint(t, status);

  if (status.isOpen === null) return null;

  return (
    <span
      className={`${styles.badge} ${status.isOpen ? styles.open : styles.closed} ${className}`}
      title={hint}
    >
      <span className={styles.dot} aria-hidden="true" />
      {status.isOpen ? t('openStatus.open') : t('openStatus.closed')}
      {hint && <span className={styles.hint}> · {hint}</span>}
    </span>
  );
}
