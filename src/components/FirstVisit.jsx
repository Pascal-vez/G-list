import { ArrowRight, Star } from 'lucide-react';
import styles from './FirstVisit.module.css';

export default function FirstVisit({ onExplore, onEvaluate }) {
  return (
    <div className={styles.screen}>
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.logo}>
          <span className={styles.logoG}>G</span>
          <span className={styles.logoList}>-List</span>
        </p>

        <span className={styles.badge}>Annuaire professionnel · Guinée</span>

        <h1 className={styles.title}>Bienvenue sur G-List</h1>
        <p className={styles.subtitle}>
          L&apos;annuaire des professionnels de confiance en Guinée
        </p>

        <p className={styles.intro}>
          Vous êtes sur le point de découvrir le prototype de G-List — la plateforme qui
          connecte les guinéens aux meilleurs professionnels de leur région : médecins,
          artisans, restaurants, techniciens et bien plus.
        </p>

        <div className={styles.noteBlock}>
          <p className={styles.noteTitle}>⚠️ Note importante</p>
          <p className={styles.noteText}>
            Les professionnels et informations affichés sur cette version sont entièrement
            fictifs. Ce prototype est une simulation créée uniquement pour valider le concept
            avant le lancement officiel.
          </p>
        </div>

        <p className={styles.callout}>
          Votre avis est notre boussole. Après avoir exploré la plateforme, dites-nous ce que
          vous en pensez — cela nous aide à construire la bonne solution pour la Guinée.
        </p>

        <button type="button" className={styles.primaryBtn} onClick={onExplore}>
          <span><ArrowRight size={18} style={{ verticalAlign: '-4px', marginRight: '8px' }} />Explorer G-List</span>
          <span className={styles.btnHint}>Je comprends que les infos sont fictives</span>
        </button>

        <button type="button" className={styles.secondaryBtn} onClick={onEvaluate}>
          <span><Star size={16} style={{ verticalAlign: '-3px', marginRight: '8px' }} />Évaluer G-List maintenant</span>
          <span className={styles.btnHintSecondary}>
            pour ceux qui veulent donner leur avis directement
          </span>
        </button>

        <footer className={styles.footer}>
          <p>Ce message ne s&apos;affichera qu&apos;une seule fois.</p>
          <p>G-List © 2026 — Prototype de validation.</p>
        </footer>
      </div>
    </div>
  );
}
