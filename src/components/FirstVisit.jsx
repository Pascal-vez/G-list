import { ArrowRight } from 'lucide-react';
import styles from './FirstVisit.module.css';

export default function FirstVisit({ onExplore }) {
  return (
    <div className={styles.screen}>
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.logo}>
          <span className={styles.logoG}>G</span>
          <span className={styles.logoList}>-List</span>
        </p>

        <span className={styles.badge}>Annuaire professionnel · Guinée 🇬🇳</span>

        <h1 className={`${styles.title} hero-display`}>Bienvenue sur G-List</h1>
        <p className={styles.subtitle}>
          Trouvez et contactez les meilleurs professionnels près de chez vous
        </p>

        <p className={styles.intro}>
          Médecins, artisans, restaurants, techniciens, avocats et bien plus — parcourez
          l&apos;annuaire par catégorie, ville ou recherche libre. Contactez directement
          via WhatsApp ou demandez un devis.
        </p>

        <ul className={styles.features}>
          <li>14 villes couvertes</li>
          <li>21 catégories de services</li>
          <li>Profils vérifiés et avis clients</li>
        </ul>

        <button type="button" className={styles.primaryBtn} onClick={onExplore}>
          <ArrowRight size={18} />
          Explorer l&apos;annuaire
        </button>

        <footer className={styles.footer}>
          <p>Ce message ne s&apos;affichera qu&apos;une seule fois.</p>
          <p>G-List © 2026 — Fait pour la Guinée</p>
        </footer>
      </div>
    </div>
  );
}
