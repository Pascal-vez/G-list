import { GUINEA_PATH, REGIONAL_CAPITALS, CONAKRY } from './guineaMapData';
import styles from './HeroGuineaMap.module.css';

export default function HeroGuineaMap({ className = '' }) {
  const others = REGIONAL_CAPITALS.filter((c) => !c.hub);

  return (
    <svg
      viewBox="0 0 400 350"
      className={`${styles.map} ${className}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className={styles.breatheGroup}>
        <path
          className={styles.land}
          d={GUINEA_PATH}
        />

        {others.map((city) => (
          <line
            key={`line-${city.name}`}
            x1={CONAKRY.cx}
            y1={CONAKRY.cy}
            x2={city.cx}
            y2={city.cy}
            className={styles.connection}
          />
        ))}

        {REGIONAL_CAPITALS.map((city, i) => (
          <circle
            key={city.name}
            cx={city.cx}
            cy={city.cy}
            r={city.hub ? 4 : 3}
            className={city.hub ? styles.hubPoint : styles.regionPoint}
            style={{ animationDelay: `${i * 0.35}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
