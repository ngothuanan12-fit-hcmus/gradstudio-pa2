import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  formatDateDisplay,
  formatTimeMinutes,
  getDayOfWeek,
  getResourceName,
  LUNCH_BREAK,
  scheduledEventsByDay,
  studioResources,
  timelineMinuteToPercent,
  TOTAL_MINUTES,
} from '../utils/scheduling.js';
import ConflictAlert from './ConflictAlert.jsx';

const LUNCH_BG = 'repeating-linear-gradient(135deg, rgba(35,28,22,0.07) 0 4px, transparent 4px 9px)';
const CONFLICT_BG = 'repeating-linear-gradient(135deg, rgba(180,35,24,0.55) 0 3px, rgba(254,243,242,0.92) 3px 7px)';
const PENDING_BG = 'repeating-linear-gradient(135deg, rgba(154,85,24,0.22) 0 4px, rgba(242,235,223,0.95) 4px 9px)';

export function TimelineRow({ label, children }) {
  return (
    <div className="st-timeline-row">
      <div className="st-timeline-label">{label}</div>
      <div className="st-timeline-track">{children}</div>
    </div>
  );
}

export function TimelineBlock({
  start,
  end,
  label,
  status,
  variant = 'request',
  conflicts = [],
  showConflict = true,
}) {
  const duration = end - start;
  const blockRef = useRef(null);
  const [widthPx, setWidthPx] = useState(0);
  const [tooltip, setTooltip] = useState(null);

  useLayoutEffect(() => {
    const el = blockRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => {
      setWidthPx(el.offsetWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = () => {
    const el = blockRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const timelineRect = el.closest('[data-timeline]')?.getBoundingClientRect();
    const asideRect = el.closest('aside')?.getBoundingClientRect();
    const minTop = Math.max(timelineRect ? timelineRect.top + 24 : 0, asideRect ? asideRect.top : 0);
    const below = rect.top - 68 < minTop;
    setTooltip({
      x: rect.left + rect.width / 2,
      y: below ? rect.bottom : rect.top,
      below,
    });
  };

  const getStyle = () => {
    if (variant === 'confirmed') {
      return { background: '#E2D3BF' };
    }
    if (variant === 'lunch') {
      return { background: LUNCH_BG };
    }
    if (variant === 'pending') {
      return {
        background: PENDING_BG,
        border: '1px solid rgba(154,85,24,0.55)',
      };
    }
    return {
      background: 'rgba(250,246,240,0.88)',
      border: '1.5px dashed var(--accent)',
    };
  };

  const showLabel = variant !== 'lunch' && widthPx >= 56;

  return (
    <div
      className="st-glide st-block-pos"
      style={{ transform: `translateX(${timelineMinuteToPercent(start)}%)` }}
    >
      <div
        ref={blockRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setTooltip(null)}
        className="st-block-bar"
        style={{
          ...getStyle(),
          width: `${(duration / TOTAL_MINUTES) * 100}%`,
          zIndex: variant === 'lunch' ? 0 : 1,
        }}
      >
        {variant === 'request' ? (
          <span className="st-block-conflicts" aria-hidden="true">
            {conflicts.map(([cStart, cEnd], idx) => (
              <span
                key={idx}
                className="st-block-conflict-slice"
                style={{
                  left: `${((cStart - start) / duration) * 100}%`,
                  width: `${((cEnd - cStart) / duration) * 100}%`,
                  background: CONFLICT_BG,
                  opacity: showConflict ? 1 : 0,
                }}
              />
            ))}
          </span>
        ) : null}

        {showLabel ? (
          <span className={variant === 'confirmed' ? 'st-block-text is-confirmed' : 'st-block-text is-request'}>
            {label}
          </span>
        ) : null}
      </div>

      {tooltip
        ? createPortal(
            <div
              className="st-portal-tooltip"
              style={{
                left: tooltip.x,
                top: tooltip.below ? tooltip.y + 8 : tooltip.y - 8,
                transform: tooltip.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
              }}
            >
              <p className="st-portal-tooltip-title">{label}</p>
              <p className="st-portal-tooltip-sub">
                {formatTimeMinutes(start)}–{formatTimeMinutes(end)} · {status}
              </p>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export function SlotSuggestion({ title, detail, nearest, onPick, disabled }) {
  return (
    <div className={nearest ? 'st-slot-card is-nearest' : 'st-slot-card'}>
      <div className="st-slot-info">
        <div className="st-slot-head">
          <span className="st-slot-title">{title}</span>
          {nearest ? <span className="st-slot-badge">Gần nhất</span> : null}
        </div>
        <p className="st-slot-detail">{detail}</p>
      </div>
      <button
        type="button"
        onClick={onPick}
        disabled={disabled}
        className={nearest ? 'st-btn-filled st-slot-btn' : 'st-btn-outline st-slot-btn'}
      >
        {nearest ? `Chọn ${title}` : 'Chọn'}
      </button>
    </div>
  );
}

export default function ResourceSchedule({
  timelineDate,
  onTimelineDateChange,
  bookingDate,
  startTime,
  isLinh,
  validation,
  suggestions = [],
  hasMakeup,
  isBookingCreated,
  onPickSuggestion,
  onClose,
}) {
  const isSameDay = timelineDate === bookingDate;
  const dayEvents = scheduledEventsByDay[timelineDate] ?? [];
  const hoursAxis = [8, 10, 12, 14, 16, 18];
  const requestVariant = isBookingCreated ? 'pending' : 'request';

  const legendItems = [
    ['Đã xác nhận', { background: '#E2D3BF' }],
    ['Yêu cầu đang xét', { border: '1.5px dashed var(--accent)' }],
    [
      'Trùng lịch',
      {
        background: 'repeating-linear-gradient(135deg, rgba(180,35,24,0.6) 0 2px, #FEF3F2 2px 4px)',
      },
    ],
    [
      'Nghỉ',
      {
        background: LUNCH_BG,
        border: '1px solid rgba(35,28,22,0.12)',
      },
    ],
  ];

  return (
    <aside className="st-resource-aside" aria-label="Lịch tài nguyên studio">
      {/* Date header & controls */}
      <div className="st-res-head">
        <div>
          <p className="st-kicker">Lịch tài nguyên</p>
          <h2 className="st-res-date-title">
            {getDayOfWeek(timelineDate)}, {timelineDate}/10
          </h2>
        </div>

        <div className="st-res-controls">
          {[-1, 1].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => onTimelineDateChange(delta)}
              aria-label={delta < 0 ? 'Ngày trước' : 'Ngày sau'}
              className="st-icon-circle-btn"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={delta < 0 ? { transform: 'rotate(180deg)' } : undefined}
                aria-hidden="true"
              >
                <path
                  d="m4.5 2.5 3.5 3.5-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ))}

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng lịch tài nguyên"
              className="st-icon-circle-btn"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Swatch legend */}
      <div className="st-res-legend">
        {legendItems.map(([legendLabel, legendStyle]) => (
          <span key={legendLabel} className="st-legend-item">
            <span className="st-legend-swatch" style={legendStyle} />
            <span>{legendLabel}</span>
          </span>
        ))}
      </div>

      {/* Gantt Timeline */}
      <div className="st-gantt-wrap" data-timeline>
        {/* Hourly axis labels */}
        <div className="st-gantt-axis">
          <div className="st-gantt-axis-spacer" />
          <div className="st-gantt-axis-track">
            {hoursAxis.map((h) => (
              <span
                key={h}
                className="st-gantt-hour"
                style={{
                  left: `${timelineMinuteToPercent(h * 60)}%`,
                  transform: `translateX(${h === 8 ? '0' : h === 18 ? '-100%' : '-50%'})`,
                }}
              >
                {formatTimeMinutes(h * 60)}
              </span>
            ))}
          </div>
        </div>

        {/* Rows container */}
        <div className="st-gantt-rows">
          {/* Vertical grid lines */}
          <div className="st-gantt-grid-lines" aria-hidden="true">
            {Array.from({ length: 11 }, (_, idx) => (
              <span
                key={idx}
                className="st-gantt-grid-line"
                style={{ left: `${idx * 10}%` }}
              />
            ))}
          </div>

          {/* Resource rows */}
          {studioResources.map((res) => {
            const currentReqSegments =
              isSameDay && isLinh
                ? validation.segments.filter((s) => s.resource === res.id)
                : [];

            return (
              <TimelineRow key={res.id} label={res.label}>
                {/* Lunch break */}
                <TimelineBlock
                  start={LUNCH_BREAK[0]}
                  end={LUNCH_BREAK[1]}
                  label="Nghỉ trưa"
                  status="Nghỉ"
                  variant="lunch"
                />

                {/* Confirmed existing sessions */}
                {dayEvents
                  .filter((ev) => ev.resource === res.id)
                  .map((ev) => (
                    <TimelineBlock
                      key={ev.start}
                      start={ev.start}
                      end={ev.end}
                      label={ev.title}
                      status="Đã xác nhận"
                      variant="confirmed"
                    />
                  ))}

                {/* Candidate requested booking segments */}
                {currentReqSegments.map((seg) => (
                  <TimelineBlock
                    key={seg.kind}
                    start={seg.start}
                    end={seg.end}
                    variant={requestVariant}
                    label={
                      isBookingCreated
                        ? 'Chờ xác nhận'
                        : seg.kind === 'makeup'
                        ? 'Makeup · Linh'
                        : 'Linh · yêu cầu'
                    }
                    status={
                      isBookingCreated
                        ? 'Chờ xác nhận'
                        : seg.conflicts.length
                        ? 'Trùng lịch'
                        : 'Yêu cầu đang xét'
                    }
                    conflicts={seg.conflicts}
                    showConflict={seg.conflicts.length > 0}
                  />
                ))}
              </TimelineRow>
            );
          })}

          {/* Active slot indicator needle */}
          {isSameDay && isLinh ? (
            <div className="st-needle-layer" aria-hidden="true">
              <div
                className="st-glide st-needle-pos"
                style={{ transform: `translateX(${timelineMinuteToPercent(startTime)}%)` }}
              >
                <span className="st-needle-line" />
                <span className="st-needle-dot" />
              </div>
            </div>
          ) : null}
        </div>

        {dayEvents.length === 0 ? (
          <p className="st-gantt-empty-note">
            Chưa có lịch nào trong ngày — đủ nhân sự cả ngày.
          </p>
        ) : null}
      </div>

      {/* Alert or confirmation box */}
      <div className="st-res-status-section">
        {isLinh && !isBookingCreated ? (
          validation.ok ? (
            <div className="st-ok-banner">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="m5 8.2 2 2 4-4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>
                {formatDateDisplay(bookingDate).slice(0, 5)} · {formatTimeMinutes(startTime)} — Đủ thợ chụp, thợ makeup và phòng
              </span>
            </div>
          ) : (
            <ConflictAlert
              key={`alert-${startTime}-${bookingDate}`}
              title="Trùng lịch tài nguyên"
              lines={validation.problems}
            />
          )
        ) : null}

        {isLinh && isBookingCreated ? (
          <div className="st-pending-banner">
            Đang giữ chỗ tạm cho #GS-1024 · {formatTimeMinutes(startTime)} — chờ Linh xác nhận.
          </div>
        ) : null}
      </div>

      {/* Smart Slot Suggestions */}
      {isLinh ? (
        <div className="st-suggestions-section">
          <p className="st-kicker">Gợi ý</p>
          <h3 className="st-suggestions-title">Gợi ý giờ trống</h3>

          <div className="st-suggestions-list">
            {suggestions.map((sug) => {
              const res = sug.result;
              const isDifferentDay = sug.day !== bookingDate;
              const detail = isDifferentDay
                ? 'Ngày khác, đủ nhân sự'
                : [
                    hasMakeup &&
                      `Makeup ${formatTimeMinutes(sug.time - 60)}–${formatTimeMinutes(sug.time)} · ${getResourceName(res.makeupArtist)}`,
                    `Chụp ${formatTimeMinutes(sug.time)}–${formatTimeMinutes(sug.time + 120)} · ${getResourceName(res.photographer)}`,
                    getResourceName(res.room),
                  ]
                    .filter(Boolean)
                    .join(' — ');

              return (
                <SlotSuggestion
                  key={`${sug.day}-${sug.time}`}
                  title={
                    isDifferentDay
                      ? `${sug.day}/10 · ${formatTimeMinutes(sug.time)}`
                      : formatTimeMinutes(sug.time)
                  }
                  detail={detail}
                  nearest={sug.nearest}
                  disabled={isBookingCreated}
                  onPick={() => onPickSuggestion(sug.day, sug.time)}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
