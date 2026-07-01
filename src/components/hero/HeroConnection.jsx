import { useTranslation } from '../../i18n/I18nContext';
import styles from './HeroConnection.module.css';

const HUB = { cx: 500, cy: 300 };

const USERS = [
  { cx: 130, cy: 140, delay: 0 },
  { cx: 90, cy: 300, delay: 0.5 },
  { cx: 150, cy: 460, delay: 1 },
];

const PROS = [
  { cx: 870, cy: 170, delay: 0.25 },
  { cx: 910, cy: 300, delay: 0.75 },
  { cx: 850, cy: 430, delay: 1.25 },
];

function curvePath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const bend = Math.min(Math.abs(dx) * 0.42, 180);
  return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
}

function UserGlyph({ x, y }) {
  return (
    <g transform={`translate(${x - 5} ${y - 6})`}>
      <circle cx="5" cy="3.5" r="2.2" fill="currentColor" />
      <path
        d="M1.5 11c0-2.2 1.6-3.5 3.5-3.5s3.5 1.3 3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </g>
  );
}

function ProGlyph({ x, y }) {
  return (
    <g transform={`translate(${x - 5.5} ${y - 5})`} fill="currentColor">
      <rect x="1" y="3" width="9" height="7" rx="1.2" />
      <path d="M3.5 3V2.2a2 2 0 0 1 4 0V3" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </g>
  );
}

export default function HeroConnection() {
  const { t } = useTranslation();
  const userPaths = USERS.map((u) => curvePath(u.cx, u.cy, HUB.cx, HUB.cy));
  const proPaths = PROS.map((p) => curvePath(HUB.cx, HUB.cy, p.cx, p.cy));

  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="heroHubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5C518" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F5C518" stopOpacity="0" />
          </radialGradient>
          <filter id="heroNodeGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {userPaths.map((d, i) => (
          <path
            key={`u-${i}`}
            d={d}
            className={styles.link}
            style={{ animationDelay: `${USERS[i].delay}s` }}
          />
        ))}
        {proPaths.map((d, i) => (
          <path
            key={`p-${i}`}
            d={d}
            className={`${styles.link} ${styles.linkOut}`}
            style={{ animationDelay: `${PROS[i].delay}s` }}
          />
        ))}

        {userPaths.map((d, i) => (
          <circle key={`pulse-u-${i}`} r="3.5" className={styles.pulse}>
            <animateMotion
              dur="4.5s"
              repeatCount="indefinite"
              path={d}
              begin={`${USERS[i].delay}s`}
            />
          </circle>
        ))}
        {proPaths.map((d, i) => (
          <circle key={`pulse-p-${i}`} r="3.5" className={`${styles.pulse} ${styles.pulsePro}`}>
            <animateMotion
              dur="4.5s"
              repeatCount="indefinite"
              path={d}
              begin={`${PROS[i].delay + 0.6}s`}
            />
          </circle>
        ))}

        <g className={styles.hubGroup}>
          <circle cx={HUB.cx} cy={HUB.cy} r="72" fill="url(#heroHubGlow)" className={styles.hubAura} />
          <circle cx={HUB.cx} cy={HUB.cy} r="28" className={styles.hubRing} />
          <circle cx={HUB.cx} cy={HUB.cy} r="14" className={styles.hubCore} filter="url(#heroNodeGlow)" />
        </g>

        {USERS.map((u, i) => (
          <g
            key={`user-${i}`}
            className={styles.userNode}
            style={{ animationDelay: `${u.delay}s` }}
          >
            <circle cx={u.cx} cy={u.cy} r="22" className={styles.userHalo} />
            <circle cx={u.cx} cy={u.cy} r="11" className={styles.userDot} filter="url(#heroNodeGlow)" />
            <g className={styles.userGlyph}>
              <UserGlyph x={u.cx} y={u.cy} />
            </g>
          </g>
        ))}

        {PROS.map((p, i) => (
          <g
            key={`pro-${i}`}
            className={styles.proNode}
            style={{ animationDelay: `${p.delay}s` }}
          >
            <circle cx={p.cx} cy={p.cy} r="22" className={styles.proHalo} />
            <rect
              x={p.cx - 10}
              y={p.cy - 10}
              width="20"
              height="20"
              rx="5"
              className={styles.proDot}
              filter="url(#heroNodeGlow)"
            />
            <g className={styles.proGlyph}>
              <ProGlyph x={p.cx} y={p.cy} />
            </g>
          </g>
        ))}
      </svg>

      <div className={styles.labels}>
        <span className={styles.labelUsers}>{t('hero.connection.users')}</span>
        <span className={styles.labelHub}>G-List</span>
        <span className={styles.labelPros}>{t('hero.connection.pros')}</span>
      </div>
    </div>
  );
}
