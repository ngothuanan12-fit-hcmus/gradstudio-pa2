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

export function TimelineRow({ label, children }) {
  return (
    <div className="st-timeline-row">
      <div className="st-timeline-label">{label}</div>
      <div className="st-timeline-track">{children}</div>
    </div>
  );
}

const BLOCK_CLASS_BY_STATE = {
  busy: 'st-block-bar st-block-busy',
  conflict: 'st-block-bar st-block-conflict',
  free: 'st-block-bar st-block-free',
  proposed: 'st-block-bar st-block-proposed',
};

export function TimelineBlock({
  start,
  end,
  label,
  status,
  state = 'busy',
}) {
  const duration = end - start;
  const blockClass = BLOCK_CLASS_BY_STATE[state] ?? BLOCK_CLASS_BY_STATE.busy;
  const timeRange = `${formatTimeMinutes(start)}–${formatTimeMinutes(end)}`;

  return (
    <div
      className="st-glide st-block-pos"
      style={{ transform: `translateX(${timelineMinuteToPercent(start)}%)` }}
    >
      <div
        title={`${label} (${timeRange} · ${status})`}
        className={blockClass}
        style={{
          width: `${(duration / TOTAL_MINUTES) * 100}%`,
          zIndex: state === 'busy' ? 1 : 2,
        }}
      >
        <span className="st-block-text">{label}</span>
      </div>
    </div>
  );
}

export function SlotSuggestion({ title, detail, nearest, onPick, disabled }) {
  return (
    <div className={nearest ? 'st-slot-card is-nearest' : 'st-slot-card'}>
      <div className="st-slot-info">
        <div className="st-slot-head">
          <span className="st-slot-title">{title}</span>
          {nearest ? <span className="st-slot-badge">✓ Gần nhất</span> : null}
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

  const legendItems = [
    ['busy', '—', 'Đã kín lịch'],
    ['proposed', '◷', 'Đang chọn'],
    ['conflict', '⚠', 'Trùng lịch'],
    ['free', '✓', 'Gợi ý trống'],
  ];

  return (
    <aside className="st-resource-aside" aria-label="Lịch tài nguyên studio">
      <div className="st-res-head">
        <div>
          <p className="st-kicker">Kiểm tra thợ chụp, makeup và phòng</p>
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
              <span aria-hidden="true">{delta < 0 ? '←' : '→'}</span>
            </button>
          ))}

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng lịch tài nguyên"
              className="st-icon-circle-btn"
            >
              <span aria-hidden="true">✕</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="st-res-legend">
        {legendItems.map(([key, glyph, legendLabel]) => (
          <span key={key} className="st-legend-item">
            <span className={`st-legend-swatch st-swatch-${key}`} aria-hidden="true">
              {glyph}
            </span>
            <span>{legendLabel}</span>
          </span>
        ))}
      </div>

      <div className="st-gantt-wrap" data-timeline>
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

        <div className="st-gantt-rows">
          <div className="st-gantt-grid-lines" aria-hidden="true">
            {Array.from({ length: 11 }, (_, idx) => (
              <span
                key={idx}
                className="st-gantt-grid-line"
                style={{ left: `${idx * 10}%` }}
              />
            ))}
          </div>

          {studioResources.map((res) => {
            const currentReqSegments =
              isSameDay && isLinh
                ? validation.segments.filter((s) => s.resource === res.id)
                : [];

            return (
              <TimelineRow key={res.id} label={res.label}>
                <TimelineBlock
                  start={LUNCH_BREAK[0]}
                  end={LUNCH_BREAK[1]}
                  label="Nghỉ trưa"
                  status="Đã kín lịch"
                  state="busy"
                />

                {dayEvents
                  .filter((ev) => ev.resource === res.id)
                  .map((ev) => (
                    <TimelineBlock
                      key={ev.start}
                      start={ev.start}
                      end={ev.end}
                      label={ev.title}
                      status="Đã chốt lịch"
                      state="busy"
                    />
                  ))}

                {currentReqSegments.map((seg) => {
                  const hasSegConflict = seg.conflicts.length > 0;
                  const segState = hasSegConflict
                    ? 'conflict'
                    : isBookingCreated
                    ? 'free'
                    : 'proposed';
                  return (
                    <TimelineBlock
                      key={seg.kind}
                      start={seg.start}
                      end={seg.end}
                      state={segState}
                      label={
                        hasSegConflict
                          ? `⚠ Trùng · Linh`
                          : isBookingCreated
                          ? '✓ #GS-1024 · Linh'
                          : seg.kind === 'makeup'
                          ? '◷ Makeup · Linh'
                          : '◷ Chụp · Linh'
                      }
                      status={
                        hasSegConflict
                          ? 'Trùng lịch'
                          : isBookingCreated
                          ? 'Chờ cọc 30%'
                          : 'Đang chọn'
                      }
                    />
                  );
                })}
              </TimelineRow>
            );
          })}

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
        ) : (
          <ul className="st-resource-summary-list" aria-label="Chi tiết ca bận trong ngày">
            {dayEvents.map((ev) => (
              <li key={`${ev.resource}-${ev.start}`} className="st-resource-summary-item">
                <strong>{getResourceName(ev.resource)}</strong>
                <span>
                  {formatTimeMinutes(ev.start)}–{formatTimeMinutes(ev.end)} · {ev.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="st-res-status-section">
        {isLinh && !isBookingCreated ? (
          validation.ok ? (
            <div className="st-ok-banner">
              <span aria-hidden="true">✓</span>
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
            ◷ Đã tạo #GS-1024 ({formatTimeMinutes(startTime)}) — lịch được giữ chính thức khi Linh thanh toán cọc 30%.
          </div>
        ) : null}
      </div>

      {isLinh ? (
        <div className="st-suggestions-section">
          <p className="st-kicker">Gợi ý khung giờ trống</p>
          <h3 className="st-suggestions-title">Đủ thợ chụp, thợ makeup và phòng</h3>

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
