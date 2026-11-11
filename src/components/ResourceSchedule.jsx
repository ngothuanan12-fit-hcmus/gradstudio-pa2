import Icon from './Icon.jsx';
import { fmtTime, toMinutes, toPct } from '../utils/time.js';

const KINDS = {
  busy: { label: 'Bận', icon: 'square' },
  conflict: { label: 'Trùng', icon: 'alert' },
  free: { label: 'Trống', icon: 'check' },
  proposed: { label: 'Đề xuất', icon: 'diamond' },
};
const DAY_FROM = 8 * 60, DAY_TO = 18 * 60;
const HOURS = [8, 10, 12, 14, 16, 18];
const pct = (t) => toPct(t, DAY_FROM, DAY_TO);

// Blocks that overlap in one row go to a second lane, so neither covers the other.
function lanes(blocks) {
  const ends = [];
  return blocks.map((block) => {
    const from = toMinutes(block.from);
    let lane = ends.findIndex((end) => end <= from);
    if (lane < 0) lane = ends.length;
    ends[lane] = toMinutes(block.to);
    return { ...block, lane };
  });
}

// Linh's blocks follow the start time chosen in the booking card: make-up the hour before with Mai, the two-hour shoot
// with Tuấn in Phòng B. A make-up hour that falls inside one of Mai's busy blocks is a clash.
function withLinh(rows, start) {
  const t = toMinutes(start);
  const makeup = { from: fmtTime(t - 60), to: fmtTime(t) };
  const shoot = { from: fmtTime(t), to: fmtTime(t + 120) };
  const clash = (row) => row.blocks.some((b) => b.kind === 'busy' && toMinutes(b.from) < t && t - 60 < toMinutes(b.to));
  const extra = {
    mai: (row) => ({ id: 'linh-makeup', ...makeup, label: clash(row) ? `Linh yêu cầu ${start}` : 'Linh · makeup', kind: clash(row) ? 'conflict' : 'proposed' }),
    tuan: () => ({ id: 'linh-shoot', ...shoot, label: 'Linh · GS-1024', kind: 'proposed' }),
    'phong-b': () => ({ id: 'linh-room', ...shoot, label: 'Linh · GS-1024', kind: 'proposed' }),
  };
  return rows.map((row) => {
    const blocks = extra[row.id] ? [...row.blocks, extra[row.id](row)] : row.blocks;
    return { ...row, blocks: [...blocks].sort((a, b) => toMinutes(a.from) - toMinutes(b.from)) };
  });
}

// The resource calendar with the suggested times. From 768 px a day timeline gives the overview; it repeats what the
// list says, so screen readers skip it. The list below is the readable record at every width: each block keeps its
// kind as a word and a symbol, its label and its times, so nothing rests on colour or is cut off.
export default function ResourceSchedule({ title, date, rows: baseRows = [], start, slots = [], picked, conflict, onPick }) {
  const rows = start ? withLinh(baseRows, start) : baseRows;
  return (
    <section className="panel sched" id="lich-tai-nguyen" aria-labelledby="sched-title">
      <div className="panel-head">
        <h2 id="sched-title">{title || 'Lịch thợ và phòng'}</h2>
        <p className="meta-line">{date}</p>
      </div>

      <div className={conflict ? 'sched-suggest is-conflict' : 'sched-suggest'}>
        <h3 id="slots-title">Giờ gợi ý</h3>
        <p>
          {conflict
            ? '09:00 không được: Mai (makeup) bận 08:00–12:00. Giờ đủ thợ makeup, thợ chụp và phòng:'
            : 'Giờ đủ thợ makeup, thợ chụp và phòng trong ngày:'}
        </p>
        <div className="slots" role="group" aria-labelledby="slots-title">
          {slots.map((slot) => (
            <button key={slot.id} type="button" className="slot" aria-pressed={picked === slot.id} onClick={() => onPick(slot)}>
              <span className="slot-time">
                <Icon name="check" /> {slot.time}
                {picked === slot.id ? <span className="slot-picked"> · Đã chọn cho Linh</span> : <span className="slot-picked"> · Chọn giờ này</span>}
              </span>
              <span className="slot-note">{slot.note}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="sched-legend" aria-label="Chú thích trạng thái">
        {Object.entries(KINDS).map(([kind, item]) => (
          <li key={kind}>
            <span className={`sched-swatch kind-${kind}`} aria-hidden="true" />
            <span><Icon name={item.icon} /> {item.label}</span>
          </li>
        ))}
      </ul>

      <div className="tl" aria-hidden="true">
        <div className="tl-axis">
          {HOURS.map((h) => (
            <span key={h} style={{ left: `${((h * 60 - DAY_FROM) / (DAY_TO - DAY_FROM)) * 100}%` }}>{String(h).padStart(2, '0')}:00</span>
          ))}
        </div>
        {rows.map((row) => {
          const placed = lanes(row.blocks);
          const count = Math.max(1, ...placed.map((b) => b.lane + 1));
          return (
            <div className="tl-row" key={row.id}>
              <span className="tl-name">{row.name}</span>
              <div className="tl-track" style={{ '--lanes': count }}>
                {placed.map((block) => {
                  const kind = KINDS[block.kind] || KINDS.busy;
                  const short = toMinutes(block.to) - toMinutes(block.from) <= 60;
                  return (
                    <span
                      key={block.id}
                      className={`tl-block kind-${block.kind || 'busy'}${short ? ' is-short' : ''}`}
                      style={{ left: `${pct(block.from)}%`, width: `${pct(block.to) - pct(block.from)}%`, '--lane': block.lane }}
                    >
                      <Icon name={kind.icon} /><span className="tl-word"> {kind.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sched-rows">
        {rows.map((row) => (
          <section className="sched-row" key={row.id} aria-labelledby={`sched-${row.id}`}>
            <h3 id={`sched-${row.id}`}>
              {row.name}
              <span>{row.role}</span>
            </h3>
            <ul className="sched-blocks">
              {row.blocks.map((block) => {
                const kind = KINDS[block.kind] || KINDS.busy;
                return (
                  <li className={`sched-block kind-${block.kind || 'busy'}`} key={block.id}>
                    <span className="sched-kind">
                      <Icon name={kind.icon} /> {kind.label}
                    </span>
                    <b>{block.label}</b>
                    <span className="sched-time">{block.from}–{block.to}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
