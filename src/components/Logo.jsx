import styles from './Logo.module.css';

export default function Logo({ className = '' }) {
  return (
    <img
      src="/images/logo.svg"
      alt="G-List"
      className={`${styles.logo} ${className}`}
      height={80}
      onError={(e) => { e.currentTarget.src = '/favicon.svg'; }}
      decoding="async"
    />
  );
}
