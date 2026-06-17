import { Calendar } from 'lucide-react';
import {
  DATE_PRESETS,
  applyPreset,
  formatPeriodLabel,
  formatPeriodShort,
} from '../../utils/dateRange';
import styles from './DateRangePicker.module.css';

export { defaultDateRange } from '../../utils/dateRange';

export default function DateRangePicker({ value, onChange, variant = 'default' }) {
  const { startDate, endDate } = value;
  const barClass = variant === 'green' ? `${styles.bar} ${styles.barGreen}` : styles.bar;
  const activePresetClass = variant === 'green' ? styles.presetBtnActiveGreen : styles.presetBtnActive;

  const handleStart = (nextStart) => {
    if (!nextStart) return;
    onChange({
      startDate: nextStart,
      endDate: nextStart > endDate ? nextStart : endDate,
    });
  };

  const handleEnd = (nextEnd) => {
    if (!nextEnd) return;
    onChange({
      startDate: nextEnd < startDate ? nextEnd : startDate,
      endDate: nextEnd,
    });
  };

  const activePreset = DATE_PRESETS.find((preset) => {
    const range = applyPreset(preset.id);
    return range.startDate === startDate && range.endDate === endDate;
  })?.id;

  return (
    <div className={barClass}>
      <div className={styles.summary}>
        <Calendar size={18} aria-hidden="true" />
        <div>
          <strong>Période d&apos;analyse</strong>
          <span>{formatPeriodLabel(startDate, endDate)} · {formatPeriodShort(startDate, endDate)}</span>
        </div>
      </div>

      <div className={styles.presets}>
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`${styles.presetBtn} ${activePreset === preset.id ? activePresetClass : ''}`}
            onClick={() => onChange(applyPreset(preset.id))}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className={styles.dates}>
        <label className={styles.dateField}>
          <span>Du</span>
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => handleStart(e.target.value)}
          />
        </label>
        <label className={styles.dateField}>
          <span>Au</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => handleEnd(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
