import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation, LOCALES } from '../i18n/I18nContext';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher({ onDark = false, className = '' }) {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div
      ref={ref}
      className={`${styles.wrap} ${onDark ? styles.onDark : ''} ${className}`.trim()}
    >
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-label={t('lang.label')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe size={17} strokeWidth={2} aria-hidden="true" />
        <span className={styles.code}>{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <ul className={styles.menu} role="listbox" aria-label={t('lang.label')}>
          {LOCALES.map((item) => (
            <li key={item.code} role="option" aria-selected={item.code === locale}>
              <button
                type="button"
                className={`${styles.option} ${item.code === locale ? styles.optionActive : ''}`}
                onClick={() => {
                  setLocale(item.code);
                  setOpen(false);
                }}
              >
                {t(item.labelKey)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
