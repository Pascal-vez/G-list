import { useMemo, useState, useEffect } from 'react';
import styles from './HeroAnimatedGrid.module.css';

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function useGridSize() {
  const [gridSize, setGridSize] = useState(48);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setGridSize(mq.matches ? 64 : 48);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return gridSize;
}

export default function HeroAnimatedGrid() {
  const gridSize = useGridSize();
  const isMobile = gridSize === 64;

  const pulseCells = useMemo(() => {
    const rand = seededRandom(42);
    const cols = isMobile ? 16 : 28;
    const rows = isMobile ? 20 : 22;
    const count = isMobile ? 10 : 18;
    const cells = [];

    for (let i = 0; i < count; i++) {
      cells.push({
        id: i,
        x: Math.floor(rand() * cols) * gridSize,
        y: Math.floor(rand() * rows) * gridSize,
        delay: rand() * 4,
        duration: 3 + rand() * 3,
      });
    }
    return cells;
  }, [gridSize, isMobile]);

  return (
    <svg
      className={`${styles.grid} ${isMobile ? styles.gridMobile : ''}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="heroGridLines"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="rgba(245, 197, 24, 0.04)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#heroGridLines)" />
      {pulseCells.map((cell) => (
        <rect
          key={cell.id}
          x={cell.x}
          y={cell.y}
          width={gridSize}
          height={gridSize}
          className={styles.pulseCell}
          style={{
            animationDuration: `${cell.duration}s`,
            animationDelay: `${cell.delay}s`,
          }}
        />
      ))}
    </svg>
  );
}
