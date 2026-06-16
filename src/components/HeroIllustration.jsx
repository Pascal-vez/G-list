import styles from './HeroIllustration.module.css';

function ProCard({ x, y, initials, label, city, color }) {
  return (
    <g transform={`translate(${x}, ${y})`} className={styles.proCard}>
      <rect width="52" height="52" rx="10" fill="#1F1F1F" stroke={color} strokeWidth="1.5" />
      <circle cx="26" cy="20" r="11" fill={color} />
      <text x="26" y="24" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif">
        {initials}
      </text>
      <text x="26" y="38" textAnchor="middle" fill="#F5C518" fontSize="7" fontWeight="600" fontFamily="Inter, sans-serif">
        {label}
      </text>
      <text x="26" y="47" textAnchor="middle" fill="#777" fontSize="6.5" fontFamily="Inter, sans-serif">
        {city}
      </text>
    </g>
  );
}

function ConnectionLine({ d, delay = '0s' }) {
  return (
    <>
      <path d={d} stroke="#F5C518" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.25" fill="none" />
      <path d={d} stroke="#F5C518" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" fill="none">
        <animate attributeName="stroke-dashoffset" values="18;0" dur="2.5s" begin={delay} repeatCount="indefinite" />
      </path>
    </>
  );
}

export default function HeroIllustration() {
  const hub = { x: 248, y: 198 };

  const nodes = [
    { x: 72, y: 218, initials: 'MB', label: 'Médecin', city: 'Conakry', color: '#E74C3C' },
    { x: 118, y: 108, initials: 'AD', label: 'BTP', city: 'Kindia', color: '#D35400' },
    { x: 168, y: 72, initials: 'FD', label: 'Santé', city: 'Labé', color: '#27AE60' },
    { x: 358, y: 88, initials: 'PC', label: 'Commerce', city: 'Kankan', color: '#009688' },
    { x: 330, y: 268, initials: 'KS', label: 'Agro', city: 'Nzérékoré', color: '#689F38' },
    { x: 195, y: 288, initials: 'IS', label: 'Plombier', city: 'Mamou', color: '#2980B9' },
  ];

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <svg viewBox="0 0 500 360" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svg}>
        <defs>
          <linearGradient id="mapFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E2E2E" />
            <stop offset="100%" stopColor="#1E1E1E" />
          </linearGradient>
          <linearGradient id="mapGlow" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#F5C518" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F5C518" stopOpacity="0" />
          </linearGradient>
          <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.35" />
          </filter>
          <filter id="hubShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#F5C518" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Carte stylisée de la Guinée */}
        <path
          d="M 58 195
             C 58 155, 75 115, 110 88
             C 145 62, 195 58, 250 68
             C 310 78, 365 72, 405 98
             C 430 115, 445 145, 438 178
             C 430 215, 410 248, 378 275
             C 345 302, 300 318, 252 322
             C 200 326, 155 312, 118 288
             C 82 265, 58 235, 58 195 Z"
          fill="url(#mapFill)"
          stroke="#3D3D3D"
          strokeWidth="1.5"
        />
        <path
          d="M 58 195
             C 58 155, 75 115, 110 88
             C 145 62, 195 58, 250 68
             C 310 78, 365 72, 405 98
             C 430 115, 445 145, 438 178
             C 430 215, 410 248, 378 275
             C 345 302, 300 318, 252 322
             C 200 326, 155 312, 118 288
             C 82 265, 58 235, 58 195 Z"
          fill="url(#mapGlow)"
        />

        {/* Côte atlantique */}
        <path
          d="M 58 195 C 52 210, 50 230, 54 252 C 58 268, 68 282, 82 292"
          stroke="#F5C518"
          strokeWidth="2"
          opacity="0.35"
          fill="none"
          strokeLinecap="round"
        />

        {/* Points villes sur la carte */}
        {[
          { cx: 88, cy: 228, label: 'Conakry' },
          { cx: 138, cy: 128, label: 'Kindia' },
          { cx: 195, cy: 98, label: 'Labé' },
          { cx: 385, cy: 118, label: 'Kankan' },
          { cx: 355, cy: 288, label: 'Nzérékoré' },
          { cx: 218, cy: 305, label: 'Mamou' },
        ].map((dot) => (
          <g key={dot.label}>
            <circle cx={dot.cx} cy={dot.cy} r="3" fill="#F5C518" opacity="0.5" />
            <circle cx={dot.cx} cy={dot.cy} r="1.5" fill="#F5C518" />
          </g>
        ))}

        {/* Lignes de connexion G-List → pros */}
        {nodes.map((node, i) => {
          const cx = node.x + 26;
          const cy = node.y + 26;
          const mx = (hub.x + cx) / 2;
          const my = (hub.y + cy) / 2 - 20;
          return (
            <ConnectionLine
              key={node.city}
              d={`M ${hub.x} ${hub.y} Q ${mx} ${my} ${cx} ${cy}`}
              delay={`${i * 0.3}s`}
            />
          );
        })}

        {/* Hub central G-List */}
        <g filter="url(#hubShadow)">
          <circle cx={hub.x} cy={hub.y} r="36" fill="#F5C518" />
          <circle cx={hub.x} cy={hub.y} r="42" fill="none" stroke="#F5C518" strokeWidth="1" opacity="0.3">
            <animate attributeName="r" values="38;48;38" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x={hub.x} y={hub.y - 4} textAnchor="middle" fill="#1A1A1A" fontSize="20" fontWeight="700" fontFamily="Inter, sans-serif">G</text>
          <text x={hub.x} y={hub.y + 14} textAnchor="middle" fill="#1A1A1A" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">-List</text>
        </g>

        {/* Carrés pros aux 6 régions */}
        <g filter="url(#cardShadow)">
          {nodes.map((node) => (
            <ProCard key={node.city} {...node} />
          ))}
        </g>

        {/* Légende carte */}
        <text x="250" y="348" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif" letterSpacing="1">
          RÉPUBLIQUE DE GUINÉE · TOUTES LES RÉGIONS CONNECTÉES
        </text>
      </svg>
    </div>
  );
}
