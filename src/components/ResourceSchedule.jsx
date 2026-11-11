const KINDS = {
  busy: { label: 'Bận', glyph: '■' },
  conflict: { label: 'Trùng', glyph: '⚠' },
  free: { label: 'Trống', glyph: '✓' },
  proposed: { label: 'Đề xuất', glyph: '◆' },
};
const DAY_FROM = 8, DAY_TO = 18;
const HOURS = [8, 10, 12, 14, 16, 18];
const toHours = (t) => { const [h, m] = t.split(':').map(Number); return h + m / 60; };
const pct = (t) => ((toHours(t) - DAY_FROM) / (DAY_TO - DAY_FROM)) * 100;

// Blocks that overlap in one row go to a second lane, so neither covers the other.
function lanes(blocks) {
  const ends = [];
  return blocks.map((block) => {
    const from = toHours(block.from);
    let lane = ends.findIndex((end) => end <= from);
    if (lane < 0) lane = ends.length;
    ends[lane] = toHours(block.to);
    return { ...block, lane };
  });
}

// The resource calendar with the suggested times. From 768 px a day timeline gives the overview; it repeats what the
// list says, so screen readers skip it. The list below is the readable record at every width: each block keeps its
// kind as a word and a symbol, its label and its times, so nothing rests on colour or is cut off.
export default function ResourceSchedule({ title, date, rows = [], slots = [], picked, conflict, onPick }) {
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
                <span aria-hidden="true">✓</span> {slot.time}
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
            <span>{item.glyph} {item.label}</span>
          </li>
        ))}
      </ul>

      <div className="tl" aria-hidden="true">
        <div className="tl-axis">
          {HOURS.map((h) => (
            <span key={h} style={{ left: `${((h - DAY_FROM) / (DAY_TO - DAY_FROM)) * 100}%` }}>{String(h).padStart(2, '0')}:00</span>
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
                  const short = toHours(block.to) - toHours(block.from) <= 1;
                  return (
                    <span
                      key={block.id}
                      className={`tl-block kind-${block.kind || 'busy'}${short ? ' is-short' : ''}`}
                      style={{ left: `${pct(block.from)}%`, width: `${pct(block.to) - pct(block.from)}%`, '--lane': block.lane }}
                    >
                      {kind.glyph}<span className="tl-word"> {kind.label}</span>
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
                      <span aria-hidden="true">{kind.glyph}</span> {kind.label}
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
