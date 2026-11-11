// The week of the story as a list, not a 7-column timetable: each day keeps its
// date and every event in full, so nothing clips at 360 px. The old 09:00
// request stays visible with a text tag; it is never hidden by colour alone.
export default function WeekCalendar({ days = [], today }) {
  return (
    <section className="panel week" aria-labelledby="week-title">
      <div className="panel-head">
        <h2 id="week-title">Tuần 19–25/10/2026</h2>
        <p className="meta-line">Thứ Bảy 24/10 có buổi chụp GS-1024</p>
      </div>

      <ol className="week-days">
        {days.map((day) => {
          const active = day.id === today;
          const hasEvents = day.events && day.events.length > 0;
          return (
            <li className={active ? 'week-day week-day-today' : 'week-day'} key={day.id}>
              <p className="week-date">
                <time dateTime={day.id}>
                  <span className="week-dow">{day.dow}</span>
                  <span className="week-num">{day.num}</span>
                </time>
                {active ? <span className="week-today">Hôm nay</span> : null}
              </p>

              {hasEvents ? (
                <ul className="week-events">
                  {day.events.map((event) => (
                    <li className={event.struck ? 'week-event week-event-off' : 'week-event'} key={event.id}>
                      <p className="week-event-time">
                        {event.from}{event.to ? `–${event.to}` : ''}
                      </p>
                      <p className="week-event-title">{event.title}</p>
                      <p className="week-event-where">{event.where}</p>
                      {event.struck ? <span className="week-event-tag">Đã bỏ vì trùng lịch</span> : null}
                    </li>
                  ))}
                </ul>
              ) : <p className="week-empty">Không có lịch</p>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
