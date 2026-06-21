import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data/constants';
import { useProfessionalsList } from '../hooks/useProfessionalsList';
import SearchBar from './SearchBar';
import styles from './Hero.module.css';

const QUICK_CATEGORIES = ['sante', 'juridique', 'restaurants', 'plomberie', 'coiffure', 'btp'];

export default function Hero() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const professionals = useProfessionalsList();
  const proCount = professionals.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/annuaire?search=${encodeURIComponent(q)}`);
  };

  const handleQuickCategory = (catId) => {
    navigate(`/categorie/${catId}`);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.auroraBackground} aria-hidden="true">
        <div className={`${styles.auroraShape} ${styles.shape1}`} />
        <div className={`${styles.auroraShape} ${styles.shape2}`} />
        <div className={`${styles.auroraShape} ${styles.shape3}`} />
      </div>
      <div className={styles.inner}>
        <h1 className={`${styles.title} hero-display`}>
          <span className={styles.titleLine1}>Trouvez</span>
          <span className={styles.titleLine2}>
            le <span className={styles.titleAccent}>professionnel</span>
          </span>
          <span className={styles.titleLine3}>qu&apos;il vous faut</span>
        </h1>
        <p className={styles.subtitle}>
          Plus de {proCount} professionnels référencés en Guinée
        </p>

        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSubmit={handleSubmit}
          ariaLabel="Rechercher un professionnel"
          className={styles.searchWrap}
        />

        <div className={styles.quickLinks}>
          {QUICK_CATEGORIES.map((id) => {
            const cat = CATEGORIES.find((c) => c.id === id);
            if (!cat) return null;
            return (
              <button
                key={id}
                type="button"
                className={styles.quickPill}
                onClick={() => handleQuickCategory(id)}
              >
                {cat.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
