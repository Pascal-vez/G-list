import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './PasswordInput.module.css';

export default function PasswordInput({
  className = '',
  wrapClassName = '',
  toggleClassName = '',
  inLabel = false,
  variant = 'default',
  ...inputProps
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      className={`${styles.wrap} ${inLabel ? styles.inLabel : ''} ${wrapClassName}`.trim()}
    >
      <input
        {...inputProps}
        type={show ? 'text' : 'password'}
        className={`${styles.input} ${className}`.trim()}
      />
      <button
        type="button"
        className={`${styles.toggle} ${variant === 'glass' ? styles.toggleGlass : ''} ${toggleClassName}`.trim()}
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        tabIndex={-1}
      >
        {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
