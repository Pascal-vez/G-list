import { Link } from 'react-router-dom';
import styles from './AuthTermsAcceptance.module.css';

export default function AuthTermsAcceptance({
  checked,
  onChange,
  id = 'auth-terms',
  className = '',
  onDark = false,
}) {
  return (
    <label
      className={`${styles.terms} ${onDark ? styles.termsOnDark : ''} ${className}`.trim()}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
      />
      <span>
        J&apos;accepte les{' '}
        <Link to="/conditions" target="_blank" rel="noopener noreferrer">
          conditions d&apos;utilisation
        </Link>
        {' '}et la{' '}
        <Link to="/confidentialite" target="_blank" rel="noopener noreferrer">
          politique de confidentialité
        </Link>
        {' '}*
      </span>
    </label>
  );
}
