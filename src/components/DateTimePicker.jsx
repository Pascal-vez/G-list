import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DateTimePicker.module.css';

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

function parseValue(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toDatetimeLocalString(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function formatDisplay(value) {
  const d = parseValue(value);
  if (!d) return '';
  return d.toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function DateTimePicker({
  value = '',
  onChange,
  placeholder = 'Choisir date et heure',
  max = new Date(),
  min = null,
  required = false,
  id,
}) {
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const parsed = parseValue(value);
  const now = new Date();

  const [viewMonth, setViewMonth] = useState(() => {
    const base = parsed || now;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [draftDate, setDraftDate] = useState(() => parsed || null);
  const [hour, setHour] = useState(() => (parsed ? parsed.getHours() : now.getHours()));
  const [minute, setMinute] = useState(() => (parsed ? parsed.getMinutes() : now.getMinutes()));

  useEffect(() => {
    if (!open) return undefined;
    const p = parseValue(value);
    setDraftDate(p);
    if (p) {
      setViewMonth(new Date(p.getFullYear(), p.getMonth(), 1));
      setHour(p.getHours());
      setMinute(p.getMinutes());
    } else {
      setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
      setHour(now.getHours());
      setMinute(now.getMinutes());
    }

    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, value]);

  const maxDay = startOfDay(max);
  const minDay = min ? startOfDay(min) : null;

  const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < startOffset; i += 1) {
      cells.push({ type: 'empty', key: `e-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      cells.push({ type: 'day', key: `d-${day}`, date, day });
    }
    return cells;
  }, [viewMonth]);

  const canGoNextMonth = useMemo(() => (
    viewMonth.getFullYear() < maxDay.getFullYear()
    || (viewMonth.getFullYear() === maxDay.getFullYear() && viewMonth.getMonth() < maxDay.getMonth())
  ), [viewMonth, maxDay]);

  const canGoPrevMonth = useMemo(() => {
    if (!minDay) return true;
    const prev = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 0);
    return prev >= minDay;
  }, [viewMonth, minDay]);

  const isDayDisabled = (date) => {
    const d = startOfDay(date);
    if (d > maxDay) return true;
    if (minDay && d < minDay) return true;
    return false;
  };

  const applySelection = () => {
    if (!draftDate) return;
    const next = new Date(draftDate);
    next.setHours(hour, minute, 0, 0);
    if (next > max) return;
    onChange?.(toDatetimeLocalString(next));
    setOpen(false);
  };

  const draftDateTime = useMemo(() => {
    if (!draftDate) return null;
    const next = new Date(draftDate);
    next.setHours(hour, minute, 0, 0);
    return next;
  }, [draftDate, hour, minute]);

  const selectionInFuture = draftDateTime && draftDateTime > max;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        id={id}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className={value ? '' : styles.triggerPlaceholder}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Calendar size={18} className={styles.triggerIcon} aria-hidden />
      </button>

      {open && (
        <div className={`${styles.popover} lightSurface`} role="dialog" aria-label="Choisir date et heure">
          <div className={styles.calHead}>
            <button
              type="button"
              className={styles.navBtn}
              disabled={!canGoPrevMonth}
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              aria-label="Mois précédent"
            >
              <ChevronLeft size={18} />
            </button>
            <strong>
              {viewMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </strong>
            <button
              type="button"
              className={styles.navBtn}
              disabled={!canGoNextMonth}
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              aria-label="Mois suivant"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className={styles.weekdays}>
            {WEEKDAYS.map((w) => (
              <span key={w} className={styles.weekday}>{w}</span>
            ))}
          </div>

          <div className={styles.days}>
            {calendarCells.map((cell) => {
              if (cell.type === 'empty') {
                return <span key={cell.key} className={styles.dayEmpty} />;
              }
              const disabled = isDayDisabled(cell.date);
              const selected = draftDate && sameDay(cell.date, draftDate);
              const today = sameDay(cell.date, now);
              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={disabled}
                  className={[
                    styles.dayBtn,
                    selected ? styles.daySelected : '',
                    today ? styles.dayToday : '',
                    disabled ? styles.dayDisabled : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setDraftDate(cell.date)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className={styles.timeRow}>
            <label htmlFor={`${id || 'dt'}-hour`}>Heure</label>
            <div className={styles.timeSelects}>
              <input
                id={`${id || 'dt'}-hour`}
                type="number"
                className={styles.timeInput}
                min={0}
                max={23}
                value={hour}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) {
                    setHour(Math.min(23, Math.max(0, next)));
                  }
                }}
                aria-label="Heure"
              />
              <span className={styles.timeSep}>:</span>
              <input
                id={`${id || 'dt'}-minute`}
                type="number"
                className={styles.timeInput}
                min={0}
                max={59}
                step={5}
                value={minute}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) {
                    setMinute(Math.min(59, Math.max(0, next)));
                  }
                }}
                aria-label="Minutes"
              />
            </div>
          </div>

          <button
            type="button"
            className={styles.confirmBtn}
            disabled={!draftDate || selectionInFuture}
            onClick={applySelection}
          >
            Confirmer
          </button>
        </div>
      )}
    </div>
  );
}
