import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Users, LayoutGrid } from 'lucide-react';
import { CATEGORIES } from '../data/constants';
import professionals from '../data/professionals';
import { HERO_SLIDES, HERO_SLIDE_INTERVAL_MS } from '../data/heroImages';
import styles from './Hero.module.css';

export default function Hero({ onSearch }) {
  const [query, setQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    HERO_SLIDES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (HERO_SLIDES.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim());
      navigate('/?search=' + encodeURIComponent(query.trim()));
      document.getElementById('professionals')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.layerBgWrap} aria-hidden="true">
        {HERO_SLIDES.map((src, index) => (
          <div
            key={src}
            className={`${styles.layerBgSlide} ${index === activeSlide ? styles.layerBgActive : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
      <div className={styles.layerShimmer} aria-hidden="true" />
      <div className={styles.layerOverlay} aria-hidden="true" />

      <div className={styles.layerContent}>
        <div className={styles.content}>
          <span className={`${styles.badge} ${styles.animEntry}`} style={{ animationDelay: '0s' }}>
            <MapPin size={13} aria-hidden="true" />
            Annuaire professionnel · Guinée
          </span>

          <h1 className={styles.title}>
            <span className={styles.titleLine} style={{ animationDelay: '0.1s' }}>
              Trouvez les meilleurs
            </span>
            <span className={styles.titleHighlight} style={{ animationDelay: '0.2s' }}>
              professionnels
            </span>
            <span className={styles.titleLine} style={{ animationDelay: '0.3s' }}>
              en Guinée
            </span>
          </h1>

          <p className={`${styles.subtitle} ${styles.animEntry}`} style={{ animationDelay: '0.4s' }}>
            Médecins, artisans, restaurants et plus — connectez-vous directement
            aux pros de confiance, partout en Guinée.
          </p>

          <form
            className={`${styles.searchForm} ${styles.animEntry}`}
            style={{ animationDelay: '0.5s' }}
            onSubmit={handleSubmit}
          >
            <Search size={18} className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              placeholder="Médecin, plombier, restaurant..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Rechercher un professionnel"
            />
            <button type="submit" className={styles.searchBtn}>
              Rechercher
            </button>
          </form>

          <div
            className={`${styles.stats} ${styles.animEntry}`}
            style={{ animationDelay: '0.6s' }}
          >
            <span className={styles.stat}>
              <Users size={14} aria-hidden="true" />
              {professionals.length}+ professionnels
            </span>
            <span className={styles.stat}>
              <MapPin size={14} aria-hidden="true" />
              Toutes les régions
            </span>
            <span className={styles.stat}>
              <LayoutGrid size={14} aria-hidden="true" />
              {CATEGORIES.length} catégories
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
