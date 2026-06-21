import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import styles from './NotFound.module.css';

export default function NotFound() {
  usePageMeta({
    title: 'Page introuvable',
    description: 'La page demandée n\'existe pas sur G-List.',
    path: '/404',
    noIndex: true,
  });

  return (
    <div className={styles.page}>
      <span className={styles.code}>404</span>
      <h1>Page introuvable</h1>
      <p>La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
      <div className={styles.actions}>
        <Link to="/" className="btn-primary"><Home size={18} /> Accueil</Link>
        <Link to="/annuaire" className={styles.secondary}><Search size={18} /> Annuaire</Link>
      </div>
    </div>
  );
}
