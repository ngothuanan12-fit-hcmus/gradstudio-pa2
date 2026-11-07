import { useState } from 'react';

// Days are real buttons in a tablist. 24/10 is selected first. The agenda
// keeps the old 09:00 request struck through and shows the new times.
export default function WeekCalendar({ title, days = [], initialSelected }) {
  const [selected, setSelected] = useState(initialSelected || days[5]?.id || days[0]?.id);
  const current = days.find((day) => day.id === selected) || {};

  function move(event, index) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key) || !days.length) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowLeft') next = (index - 1 + days.length) % days.length;
    if (event.key === 'ArrowRight') next = (index + 1) % days.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = days.length - 1;
    setSelected(days[next].id);
    document.getElementById(`week-day-${days[next].id}`)?.focus();
  }

  return (
    <section className="panel week" aria-labelledby="week-title">
      <div className="panel-head">
        <h2 id="week-title">{title || 'Lịch tuần'}</h2>
      </div>

      <div className="week-days" role="tablist" aria-label="Ngày trong tuần">
        {days.map((day, index) => (
          <button
            key={day.id}
            id={`week-day-${day.id}`}
            type="button"
            role="tab"
            className={day.events?.length ? 'day has-event' : 'day'}
            aria-selected={selected === day.id}
            aria-controls="week-panel"
            tabIndex={selected === day.id ? 0 : -1}
            onClick={() => setSelected(day.id)}
            onKeyDown={(event) => move(event, index)}
          >
            <span className="day-dow">{day.dow}</span>
            <span className="day-num">{day.num}</span>
            {day.events?.length ? <span className="sr-only">{day.events.length} lịch hẹn</span> : null}
          </button>
        ))}
      </div>

      <div
        className="agenda"
        id="week-panel"
        role="tabpanel"
        aria-labelledby={`week-day-${selected}`}
      >
        {current.events?.length ? (
          <ol className="agenda-list">
            {current.events.map((event) => (
              <li className={event.struck ? 'agenda-item is-old' : 'agenda-item'} key={event.id}>
                {event.struck ? (
                  <s className="agenda-time">{event.from}</s>
                ) : (
                  <span className="agenda-time">
                    <time dateTime={event.from}>{event.from}</time>–<time dateTime={event.to}>{event.to}</time>
                  </span>
                )}
                <span>
                  <strong>{event.title}</strong>
                  <span>{event.where}</span>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty">Không có lịch chụp ngày này.</p>
        )}
      </div>
    </section>
  );
}