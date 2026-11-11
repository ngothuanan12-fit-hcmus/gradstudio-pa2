import Icon from './Icon.jsx';
import { toPct } from '../utils/time.js';

const DAY_FROM = 8 * 60, DAY_TO = 18 * 60;
const HOURS = [8, 10, 12, 14, 16, 18];
const hour = (t) => `${String(Number.parseInt(t, 10) + 1).padStart(2, '0')}:00`;

// The week of the shoot as a strip of seven days, the shoot day marked with a word and an icon, then the day
// itself: a bar from 08:00 to 18:00 for the overview (it repeats the list, so screen readers skip it) and the list,
// which is the readable record. The 09:00 first asked for is struck through, the time itself included, and keeps
// its reason in words; hatching is only an extra cue.
export default function WeekCalendar({ days = [], shootDay }) {
  const day = days.find((item) => item.id === shootDay) || { events: [] };
  return (
    <section className="panel week" aria-labelledby="week-title">
      <div className="panel-head">
        <h2 id="week-title">Tuần 19–25/10/2026</h2>
      </div>

      <ol className="week-strip">
        {days.map((item) => (
          <li className={item.id === shootDay ? 'week-cell is-shoot' : 'week-cell'} key={item.id}>
            <time dateTime={item.id}>
              <span className="week-dow">{item.dow}</span>
              <span className="week-num">{item.num}</span>
            </time>
            {item.id === shootDay ? <span className="week-mark"><Icon name="diamond" /><span className="sr-only"> ngày chụp</span></span> : null}
          </li>
        ))}
      </ol>
      <p className="week-shoot-line"><Icon name="diamond" /> Thứ Bảy 24/10 · Ngày chụp GS-1024</p>

      <h3 className="day-title">Lịch trình ngày 24/10</h3>
      <div className="day-bar" aria-hidden="true">
        <div className="day-axis">
          {HOURS.map((h) => (
            <span key={h} style={{ '--at': ((h * 60 - DAY_FROM) / (DAY_TO - DAY_FROM)) * 100 }}>{String(h).padStart(2, '0')}:00</span>
          ))}
        </div>
        <div className="day-track">
          {day.events.map((event) => {
            const to = event.to || hour(event.from);
            return (
              <span
                key={event.id}
                className={event.struck ? 'day-block is-off' : 'day-block'}
                style={{ '--at': toPct(event.from, DAY_FROM, DAY_TO), '--len': toPct(to, DAY_FROM, DAY_TO) - toPct(event.from, DAY_FROM, DAY_TO) }}
              />
            );
          })}
        </div>
      </div>

      <ol className="day-agenda">
        {day.events.map((event) => (
          <li className={event.struck ? 'day-item is-off' : 'day-item'} key={event.id}>
            <p className="day-time">
              {event.struck ? <s>{event.from}</s> : `${event.from}–${event.to}`}
            </p>
            <div className="day-body">
              <p className="day-what">{event.title}</p>
              <p className="day-where">
                {event.struck ? <><Icon name="alert" /> {event.where}</> : event.where}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
