import { useEffect, useId, useRef, useState } from 'react';
import Icon from '../Icon.jsx';

// Custom accessible listbox select with keyboard navigation and automatic viewport boundary flip.
export default function Select({
  id,
  label,
  value,
  options = [],
  onChange,
  placeholder = 'Chọn…',
  disabled = false,
  error,
  hint,
  className = '',
}) {
  const autoId = useId();
  const fieldId = id || autoId;
  const listboxId = `${fieldId}-listbox`;
  const labelId = `${fieldId}-label`;
  const hintId = hint ? `${fieldId}-hint` : null;
  const errorId = error ? `${fieldId}-error` : null;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pos, setPos] = useState({ above: false, alignEnd: false });

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selected = options.find((opt) => opt.value === value) || null;

  function findNextEnabled(start, step) {
    if (!options.length) return -1;
    let idx = start;
    for (let i = 0; i < options.length; i += 1) {
      idx = (idx + step + options.length) % options.length;
      if (!options[idx].disabled) return idx;
    }
    return -1;
  }

  function openMenu(initialIndex) {
    if (disabled || !options.length) return;
    const currentIdx = options.findIndex((opt) => opt.value === value && !opt.disabled);
    const startIdx = initialIndex >= 0 ? initialIndex : currentIdx >= 0 ? currentIdx : findNextEnabled(-1, 1);
    setActiveIndex(startIdx);
    setOpen(true);
  }

  function commit(opt) {
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return undefined;

    function updatePosition() {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;
      const rect = trigger.getBoundingClientRect();
      const menuHeight = menu.offsetHeight || 240;
      const menuWidth = menu.offsetWidth || rect.width;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const above = spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;
      const alignEnd = rect.left + menuWidth > window.innerWidth - 12 && rect.right - menuWidth >= 12;
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

  function handleTriggerKeyDown(event) {
    if (disabled) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open)
        openMenu(
          findNextEnabled(
            options.findIndex((o) => o.value === value),
            1,
          ),
        );
      else setActiveIndex((prev) => findNextEnabled(prev, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open)
        openMenu(
          findNextEnabled(
            options.findIndex((o) => o.value === value),
            -1,
          ),
        );
      else setActiveIndex((prev) => findNextEnabled(prev, -1));
    } else if (event.key === 'Home' && open) {
      event.preventDefault();
      setActiveIndex(findNextEnabled(-1, 1));
    } else if (event.key === 'End' && open) {
      event.preventDefault();
      setActiveIndex(findNextEnabled(0, -1));
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      if (activeIndex >= 0 && options[activeIndex]) commit(options[activeIndex]);
      else setOpen(false);
    }
  }

  return (
    <div className={`field custom-select ${className}`.trim()} ref={rootRef}>
      <label className="field-label" id={labelId} htmlFor={fieldId}>
        {label}
      </label>
      <div className="cs-wrap">
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          className="cs-trigger"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-labelledby={`${labelId} ${fieldId}-value`}
          aria-activedescendant={open && activeIndex >= 0 ? `${fieldId}-opt-${activeIndex}` : undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openMenu(-1))}
          onKeyDown={handleTriggerKeyDown}
        >
          <span id={`${fieldId}-value`} className={selected ? 'cs-value' : 'cs-placeholder'}>
            {selected ? selected.label : placeholder}
          </span>
          <span className="cs-chevron" aria-hidden="true">
            <Icon name="chevron-down" />
          </span>
        </button>

        {open ? (
          <ul
            ref={menuRef}
            id={listboxId}
            className={`cs-menu${pos.above ? ' is-above' : ''}${pos.alignEnd ? ' is-align-end' : ''}`}
            role="listbox"
            aria-labelledby={labelId}
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isActive = idx === activeIndex;
              return (
                <li
                  key={opt.value}
                  id={`${fieldId}-opt-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled ? 'true' : undefined}
                  className={`cs-option${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}${opt.disabled ? ' is-disabled' : ''}`}
                  onMouseEnter={() => {
                    if (!opt.disabled) setActiveIndex(idx);
                  }}
                  onClick={() => commit(opt)}
                >
                  <span className="cs-option-main">
                    <span>{opt.label}</span>
                    {opt.sub ? <span className="cs-option-sub">{opt.sub}</span> : null}
                  </span>
                  {isSelected ? (
                    <span className="cs-option-check" aria-hidden="true">
                      <Icon name="check" />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
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
