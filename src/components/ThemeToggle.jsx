import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle({
  variant = 'icon',
  className = '',
  onDark = false,
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const ThemeIcon = isDark ? Sun : Moon;

  if (variant === 'ligne') {
    return (
      <button
        type="button"
        className={`${styles.row} ${onDark ? styles.rowOnDark : ''} ${className}`.trim()}
        onClick={toggleTheme}
        aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      >
        <div className={styles.rowLeft}>
          <span className={styles.rowIcon} aria-hidden="true">
            <ThemeIcon size={18} strokeWidth={2} />
          </span>
          <span className={styles.rowLabel}>
            {isDark ? 'Mode clair' : 'Mode sombre'}
          </span>
        </div>
        <div className={`${styles.switch} ${isDark ? styles.switchOn : ''}`} aria-hidden="true">
          <div className={`${styles.switchKnob} ${isDark ? styles.switchKnobOn : ''}`} />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      className={`${styles.iconBtn} ${onDark ? styles.iconBtnOnDark : ''} ${className}`.trim()}
    >
      <ThemeIcon size={18} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
