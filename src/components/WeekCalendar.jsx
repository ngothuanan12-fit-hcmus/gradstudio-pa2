import { useState } from 'react';
import Button from './Button.jsx';

// Editorial week strip + timeline milestones for 19–25/10/2026.
// Opens on Saturday 24/10 (the shoot day, never called "Hôm nay").
// The clashing 09:00 slot strikes out the time "09:00" itself as required by the brief.
export default function WeekCalendar({ days = [], defaultDayId = '2026-10-24' }) {
  const [selectedId, setSelectedId] = useState(defaultDayId);
  const currentDay = days.find((day) => day.id === selectedId) || days[0];
  const events = currentDay?.events || [];

  return (
    <section className="panel week" aria-labelledby="week-title">
      <div className="panel-head">
        <div>
          <h2 id="week-title">Tháng 10, 2026 · Tuần 19–25/10</h2>
          <p className="meta-line">Lịch dự kiến tại studio · Thứ Bảy 24/10 có buổi chụp GS-1024</p>
        </div>
        <span className="week-badge">Tuần 43</span>
      </div>

      <div className="week-strip" role="group" aria-label="Chọn ngày trong tuần 19 đến 25 tháng 10">
        {days.map((day) => {
          const isSelected = day.id === currentDay?.id;
          return (
            <button
              key={day.id}
              type="button"
              className={
                day.isShootDay
                  ? 'week-cell week-cell-shoot'
                  : 'week-cell'
              }
              aria-pressed={isSelected}
              onClick={() => setSelectedId(day.id)}
            >
              <span className="week-dow">{day.dow}</span>
              <span className="week-num">{day.num}</span>
              {day.isShootDay ? (
                <span className="week-shoot-tag">◆ Ngày chụp</span>
              ) : (
                <span className="week-shoot-empty">Trống</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="week-timeline">
        <div className="panel-head">
          <h3 className="week-timeline-title">
            {currentDay?.dow}, {currentDay?.dateLabel}/2026 · Lịch trình của Linh
          </h3>
          <p className="meta-line">
            {events.length ? `${events.length} mốc thời gian` : 'Không có lịch'}
          </p>
        </div>

        {events.length ? (
          <ol className="week-events">
            {events.map((event) => (
              <li
                className={event.struck ? 'week-event week-event-off' : 'week-event'}
                key={event.id}
              >
                <div className="week-event-head">
                  <p className="week-event-time">
                    {event.struck ? (
                      <s>{event.from}{event.to ? `–${event.to}` : ''}</s>
                    ) : (
                      <span>{event.from}{event.to ? `–${event.to}` : ''}</span>
                    )}
                  </p>
                  {event.tag ? <span className="week-event-tag">⚠ {event.tag}</span> : null}
                </div>
                <p className="week-event-title">
                  {event.struck ? <s>{event.title}</s> : event.title}
                </p>
                <p className="week-event-where">{event.where}</p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="empty week-empty-box">
            <p>Không có lịch chụp trong ngày {currentDay?.dateLabel}/2026.</p>
            <Button variant="secondary" onClick={() => setSelectedId(defaultDayId)}>
              Xem ngày chụp Thứ Bảy, 24/10
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
