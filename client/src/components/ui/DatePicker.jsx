import { useEffect, useId, useRef, useState } from 'react';
import Icon from '../Icon.jsx';
import {
  WEEKDAY_SHORT,
  addDays,
  addMonths,
  isValidIsoDate,
  monthGridDates,
  todayStudioIso,
  vnDateLong,
} from '../../utils/date.js';

// Custom accessible Vietnamese calendar date picker displaying dd/MM/yyyy and emitting YYYY-MM-DD.
export default function DatePicker({
  id,
  label,
  value,
  onChange,
  suggestedDate = null,
  highlightDates = null,
  disabled = false,
  error,
  hint,
  placeholder = 'Chọn ngày',
  compact = false,
}) {
  const autoId = useId();
  const fieldId = id || autoId;
  const dialogId = `${fieldId}-calendar`;
  const hintId = hint ? `${fieldId}-hint` : null;
  const errorId = error ? `${fieldId}-error` : null;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const today = todayStudioIso();
  const validValue = isValidIsoDate(value) ? value : today;

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => validValue.slice(0, 7));
  const [focusedDate, setFocusedDate] = useState(validValue);
  const [pos, setPos] = useState({ above: false, alignEnd: false });

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const monthIso = `${viewMonth}-01`;
  const cells = monthGridDates(monthIso);
  const monthNumber = Number(viewMonth.slice(5, 7));
  const yearNumber = viewMonth.slice(0, 4);

  function openCalendar() {
    if (disabled) return;
    const base = isValidIsoDate(value) ? value : today;
    setViewMonth(base.slice(0, 7));
    setFocusedDate(base);
    setOpen(true);
  }

  function pickDate(iso) {
    onChange(iso);
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return undefined;

    function updatePosition() {
      const trigger = triggerRef.current;
      const pop = popoverRef.current;
      if (!trigger || !pop) return;
      const rect = trigger.getBoundingClientRect();
      const popH = pop.offsetHeight || 320;
      const popW = pop.offsetWidth || 296;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const above = spaceBelow < popH + 12 && spaceAbove > spaceBelow;
      const alignEnd = rect.left + popW > window.innerWidth - 12 && rect.right - popW >= 12;
      setPos({ above, alignEnd });
    }

    updatePosition();

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  function handleGridKeyDown(event) {
    let delta = 0;
    if (event.key === 'ArrowLeft') delta = -1;
    else if (event.key === 'ArrowRight') delta = 1;
    else if (event.key === 'ArrowUp') delta = -7;
    else if (event.key === 'ArrowDown') delta = 7;
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pickDate(focusedDate);
      return;
    }
    if (delta !== 0) {
      event.preventDefault();
      const next = addDays(focusedDate, delta);
      setFocusedDate(next);
      setViewMonth(next.slice(0, 7));
    }
  }

  return (
    <div className={`field date-picker${compact ? ' is-compact' : ''}`} ref={rootRef}>
      <label className="field-label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="dp-wrap">
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          className="dp-trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={dialogId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openCalendar())}
        >
          <span className={isValidIsoDate(value) ? 'dp-value' : 'dp-placeholder'}>
            {isValidIsoDate(value) ? vnDateLong(value) : placeholder}
          </span>
          <span className="dp-icon" aria-hidden="true">
            <Icon name="calendar" />
          </span>
        </button>

        {open ? (
          <div
            ref={popoverRef}
            id={dialogId}
            className={`dp-popover${pos.above ? ' is-above' : ''}${pos.alignEnd ? ' is-align-end' : ''}`}
            role="dialog"
            aria-label={`Chọn ngày (${label})`}
            onKeyDown={handleGridKeyDown}
          >
            <div className="dp-header">
              <button
                type="button"
                className="dp-nav-btn"
                aria-label="Tháng trước"
                onClick={() => setViewMonth(addMonths(monthIso, -1).slice(0, 7))}
              >
                <Icon name="chevron-left" />
              </button>
              <span className="dp-month-title">
                Tháng {monthNumber}, {yearNumber}
              </span>
              <button
                type="button"
                className="dp-nav-btn"
                aria-label="Tháng sau"
                onClick={() => setViewMonth(addMonths(monthIso, 1).slice(0, 7))}
              >
                <Icon name="chevron-right" />
              </button>
            </div>

            <div className="dp-weekdays" aria-hidden="true">
              {WEEKDAY_SHORT.map((dow) => (
                <span key={dow}>{dow}</span>
              ))}
            </div>

            <div className="dp-grid" role="grid">
              {cells.map((cell) => {
                const isSelected = cell.date === value;
                const isFocused = cell.date === focusedDate;
                const isToday = cell.date === today;
                const hasEvent = highlightDates ? highlightDates.has(cell.date) : false;
                return (
                  <button
                    key={cell.date}
                    type="button"
                    className={`dp-day${cell.inMonth ? '' : ' is-outside'}${isSelected ? ' is-selected' : ''}${isFocused ? ' is-focused' : ''}${isToday ? ' is-today' : ''}${hasEvent ? ' has-event' : ''}`}
                    aria-label={vnDateLong(cell.date)}
                    aria-pressed={isSelected}
                    onClick={() => pickDate(cell.date)}
                  >
                    <span>{cell.dayNum}</span>
                  </button>
                );
              })}
            </div>

            <div className="dp-footer">
              <button type="button" className="dp-quick-btn" onClick={() => pickDate(today)}>
                Hôm nay
              </button>
              {suggestedDate && isValidIsoDate(suggestedDate) ? (
                <button type="button" className="dp-quick-btn" onClick={() => pickDate(suggestedDate)}>
                  Ngày hẹn ({vnDateLong(suggestedDate).slice(0, 5)})
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      {hint ? (
        <span className="field-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="field-error" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
