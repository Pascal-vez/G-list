import { useState } from 'react';
import { getInfoPageHero, INFO_PAGE_HERO_FALLBACK } from '../data/infoPageHeroImages';
import styles from './InfoPageLayout.module.css';

export function InfoSection({ title, children }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

export default function InfoPageLayout({ title, subtitle, pageKey = 'apropos', children }) {
  const hero = getInfoPageHero(pageKey);
  const [imgSrc, setImgSrc] = useState(hero.image);

  return (
    <div className={styles.page}>
      <header
        className={styles.hero}
        style={{
          '--page-accent': hero.accent,
          '--page-accent-bg': hero.accentBg,
        }}
      >
        <img
          src={imgSrc}
          alt=""
          className={styles.bgImage}
          style={{ objectPosition: hero.position }}
          onError={() => {
            if (imgSrc !== INFO_PAGE_HERO_FALLBACK) {
              setImgSrc(INFO_PAGE_HERO_FALLBACK);
            }
          }}
          aria-hidden="true"
        />
        <div className={styles.overlay} aria-hidden="true" />
        <div className={styles.accentBar} aria-hidden="true" />
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroSubtitle}>{subtitle}</p>
        </div>
      </header>
      <article className={styles.body}>
        <div className={styles.container}>{children}</div>
      </article>
    </div>
  );
}
