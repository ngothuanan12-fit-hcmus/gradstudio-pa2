import Icon from './Icon.jsx';
import { vnPeriodTitle, vnShortDate, vnWeekday, weekDates } from '../utils/date.js';
import { toMinutes, toPct } from '../utils/time.js';

// Builds the week strip and day timeline dynamically from the booking's date and assigned slots.
export default function WeekCalendar({ booking }) {
  const isCancelled = booking.status === 'Đã hủy';
  const days = weekDates(booking.date);
  const weekTitle = vnPeriodTitle(booking.date, 'week');

  const events = [];
  if (booking.makeup) {
    events.push({
      id: `${booking.id}-makeup`,
      from: booking.makeup.from,
      to: booking.makeup.to,
      title: `Makeup với ${booking.makeup.staffName}`,
      where: booking.id,
    });
  }
  if (booking.shoot) {
    events.push({
      id: `${booking.id}-shoot`,
      from: booking.shoot.from,
      to: booking.shoot.to,
      title: `Chụp với ${booking.shoot.staffName}`,
      where: `${booking.shoot.roomName} · ${booking.id}`,
    });
  }

  const minFrom = events.length ? Math.min(...events.map((e) => toMinutes(e.from))) : 8 * 60;
  const maxTo = events.length ? Math.max(...events.map((e) => toMinutes(e.to))) : 18 * 60;
  const dayFrom = Math.min(8 * 60, Math.floor(minFrom / 60) * 60);
  const dayTo = Math.max(18 * 60, Math.ceil(maxTo / 60) * 60);
  const startH = Math.floor(dayFrom / 60);
  const spanH = Math.max(2, Math.ceil(dayTo / 60) - startH);
  const axisHours = [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => Math.round(startH + spanH * f));

  return (
    <section className="panel week" aria-labelledby="week-title">
      <div className="panel-head">
        <h2 id="week-title">{weekTitle}</h2>
      </div>

      <ol className="week-strip">
        {days.map((item) => {
          const isShootDay = item.date === booking.date;
          const cellClass = isShootDay
            ? isCancelled
              ? 'week-cell is-shoot is-off'
              : 'week-cell is-shoot'
            : 'week-cell';
          return (
            <li className={cellClass} key={item.date}>
              <time dateTime={item.date}>
                <span className="week-dow">{item.dow}</span>
                <span className="week-num">{item.dayNum}</span>
              </time>
              {isShootDay ? (
                <span className="week-mark">
                  <Icon name={isCancelled ? 'alert' : 'diamond'} />
                  <span className="sr-only">{isCancelled ? ' buổi chụp đã hủy' : ' ngày chụp'}</span>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className={isCancelled ? 'week-shoot-line is-off' : 'week-shoot-line'}>
        <Icon name={isCancelled ? 'alert' : 'diamond'} />{' '}
        {isCancelled ? (
          <s>
            {vnWeekday(booking.date)} {vnShortDate(booking.date)} · Ngày chụp {booking.id}
          </s>
        ) : (
          `${vnWeekday(booking.date)} ${vnShortDate(booking.date)} · Ngày chụp ${booking.id}`
        )}
        {isCancelled ? ' (Đã hủy)' : ''}
      </p>

      <h3 className="day-title">Lịch trình ngày {vnShortDate(booking.date)}</h3>
      <div className="day-bar" aria-hidden="true">
        <div className="day-axis">
          {axisHours.map((h) => (
            <span key={h} style={{ '--at': ((h * 60 - dayFrom) / (dayTo - dayFrom)) * 100 }}>
              {String(h).padStart(2, '0')}:00
            </span>
          ))}
        </div>
        <div className="day-track">
          {events.map((event) => {
            const rawAt = toPct(event.from, dayFrom, dayTo);
            const rawEnd = toPct(event.to, dayFrom, dayTo);
            const at = Math.max(0, Math.min(100, rawAt));
            const len = Math.max(2, Math.min(100 - at, rawEnd - at));
            return (
              <span
                key={event.id}
                className={isCancelled ? 'day-block is-off' : 'day-block'}
                style={{ '--at': at, '--len': len }}
              />
            );
          })}
        </div>
      </div>

      <ol className="day-agenda">
        {events.map((event) => (
          <li className={isCancelled ? 'day-item is-off' : 'day-item'} key={event.id}>
            <p className="day-time">
              {isCancelled ? (
                <s>
                  {event.from}–{event.to}
                </s>
              ) : (
                `${event.from}–${event.to}`
              )}
            </p>
            <div className="day-body">
              <p className="day-what">{isCancelled ? <s>{event.title}</s> : event.title}</p>
              <p className="day-where">
                {isCancelled ? (
                  <>
                    <Icon name="alert" /> Đã hủy · {event.where}
                  </>
                ) : (
                  event.where
                )}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
