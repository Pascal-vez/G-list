import styles from './BarChart.module.css';

export default function BarChart({ data, labelKey = 'label', valueKey = 'value', height = 120, color = '#F5C518' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className={styles.chart} style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className={styles.barWrap}>
          <div
            className={styles.bar}
            style={{ height: `${(d[valueKey] / max) * 100}%`, background: color }}
            title={`${d[labelKey]}: ${d[valueKey]}`}
          />
          <span className={styles.label}>{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}
