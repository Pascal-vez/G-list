import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './MetricCard.module.css';

export default function MetricCard({
  icon: Icon,
  value,
  label,
  accent = '#F5C518',
  trend,
  period = '30 derniers jours',
}) {
  const trendUp = trend != null && trend >= 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        {Icon && <Icon size={18} style={{ color: accent }} className={styles.icon} />}
        {trend != null && (
          <span className={`${styles.trend} ${trendUp ? styles.trendUp : styles.trendDown}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendUp ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
      {period && <span className={styles.period}>{period}</span>}
    </div>
  );
}
