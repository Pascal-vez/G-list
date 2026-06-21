import styles from './Logo.module.css';

export default function Logo({ className = '' }) {
  return (
    <img
      src="/images/logo.png"
      alt="G-List"
      className={`${styles.logo} ${className}`}
      height={42}
      decoding="async"
    />
  );
}
