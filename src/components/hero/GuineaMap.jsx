import styles from './GuineaMap.module.css';

export default function GuineaMap({ className = '' }) {
  return (
    <svg
      viewBox="0 0 500 420"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={`${styles.map} ${className}`}
      aria-hidden="true"
    >
      <ellipse cx="200" cy="180" rx="130" ry="120" fill="rgba(245,197,24,0.04)" />

      <path
        d="
          M 72,85
          L 85,72
          L 102,65
          L 118,58
          L 135,52
          L 155,48
          L 172,44
          L 192,42
          L 210,40
          L 228,41
          L 245,45
          L 262,50
          L 278,58
          L 292,68
          L 304,80
          L 312,94
          L 318,108
          L 322,122
          L 328,134
          L 338,144
          L 348,152
          L 355,162
          L 358,174
          L 355,186
          L 348,196
          L 338,205
          L 328,215
          L 320,226
          L 314,238
          L 308,252
          L 300,265
          L 290,276
          L 278,285
          L 265,292
          L 252,298
          L 238,302
          L 224,305
          L 210,306
          L 196,304
          L 182,300
          L 168,294
          L 155,286
          L 142,277
          L 130,266
          L 118,255
          L 108,243
          L 98,230
          L 90,217
          L 82,204
          L 75,190
          L 68,176
          L 62,162
          L 58,148
          L 55,134
          L 54,120
          L 56,106
          L 62,94
          Z
        "
        fill="rgba(245, 197, 24, 0.08)"
        stroke="#F5C518"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        strokeLinejoin="round"
      />

      <line x1="82" y1="204" x2="115" y2="185" stroke="#F5C518" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.2" />
      <line x1="82" y1="204" x2="168" y2="145" stroke="#F5C518" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.15" />
      <line x1="82" y1="204" x2="102" y2="130" stroke="#F5C518" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.15" />
      <line x1="82" y1="204" x2="230" y2="185" stroke="#F5C518" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.12" />
      <line x1="82" y1="204" x2="280" y2="168" stroke="#F5C518" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.12" />
      <line x1="82" y1="204" x2="262" y2="255" stroke="#F5C518" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.1" />
      <line x1="82" y1="204" x2="295" y2="130" stroke="#F5C518" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.1" />

      <circle cx="82" cy="204" r="4" fill="#F5C518" opacity="0.9">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="70" y="220" fontSize="9" fill="#F5C518" opacity="0.7" fontFamily="Inter, sans-serif">Conakry</text>

      <circle cx="115" cy="185" r="3" fill="#F5C518" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <text x="120" y="182" fontSize="8" fill="#F5C518" opacity="0.5" fontFamily="Inter, sans-serif">Kindia</text>

      <circle cx="168" cy="145" r="3" fill="#F5C518" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4s" begin="1s" repeatCount="indefinite" />
      </circle>
      <text x="173" y="142" fontSize="8" fill="#F5C518" opacity="0.5" fontFamily="Inter, sans-serif">Labé</text>

      <circle cx="195" cy="168" r="3" fill="#F5C518" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3.5s" begin="0.8s" repeatCount="indefinite" />
      </circle>

      <circle cx="102" cy="130" r="3" fill="#F5C518" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.8s" begin="1.5s" repeatCount="indefinite" />
      </circle>

      <circle cx="230" cy="185" r="3" fill="#F5C518" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3.2s" begin="0.3s" repeatCount="indefinite" />
      </circle>

      <circle cx="280" cy="168" r="3" fill="#F5C518" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4.5s" begin="0.7s" repeatCount="indefinite" />
      </circle>
      <text x="285" y="165" fontSize="8" fill="#F5C518" opacity="0.5" fontFamily="Inter, sans-serif">Kankan</text>

      <circle cx="262" cy="255" r="3" fill="#F5C518" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3.8s" begin="1.2s" repeatCount="indefinite" />
      </circle>
      <text x="267" y="252" fontSize="8" fill="#F5C518" opacity="0.5" fontFamily="Inter, sans-serif">Nzérékoré</text>

      <circle cx="295" cy="130" r="3" fill="#F5C518" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.5s" begin="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
