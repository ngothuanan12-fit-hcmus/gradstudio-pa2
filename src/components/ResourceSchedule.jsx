const KINDS = {
  busy: { label: 'Bận', glyph: '■' },
  conflict: { label: 'Trùng lịch', glyph: '⚠' },
  free: { label: 'Trống', glyph: '✓' },
  proposed: { label: 'Đề xuất (14:00)', glyph: '◆' },
};

// A list instead of an 880px timeline. Every block shows its full label and
// time, so nothing is clipped at 360px, and each kind keeps a text label and glyph.
export default function ResourceSchedule({ title, date, start = '14:00', rows = [] }) {
  const isConflict = start !== '14:00';
  return (
    <section className="panel sched" aria-labelledby="sched-title">
      <div className="panel-head">
        <div>
          <h2 id="sched-title">{title || 'Lịch thợ và phòng'}</h2>
          <p className="meta-line">
            {date} · Giờ đang xem trên form: <b>{start}</b> (
            {isConflict
              ? '⚠ Trùng ca sáng của Mai 08:00–12:00'
              : '✓ Ca chiều 13:00–16:00 đủ Mai, Tuấn và Phòng B'}
            )
          </p>
        </div>
        <ul className="sched-legend" aria-label="Chú thích trạng thái">
          {Object.entries(KINDS).map(([kind, item]) => (
            <li key={kind}>
              <span className={`sched-swatch kind-${kind}`} aria-hidden="true">{item.glyph}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sched-rows">
        {rows.map((row) => (
          <section className="sched-row" key={row.id} aria-labelledby={`sched-${row.id}`}>
            <h3 id={`sched-${row.id}`}>
              {row.name}
              <span> · {row.role}</span>
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
