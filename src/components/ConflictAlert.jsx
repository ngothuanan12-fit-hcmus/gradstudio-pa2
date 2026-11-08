// The alert names who is busy and when. A free time is a real button with
// aria-pressed, so the selected 14:00 is visible without colour alone.
export default function ConflictAlert({ conflict, slots = [], picked, onPick }) {
  return (
    <section
      className={conflict ? 'alert alert-danger' : 'alert alert-free'}
      role={conflict ? 'alert' : undefined}
      aria-labelledby="conflict-title"
    >
      <div className="alert-head">
        <span className="alert-icon" aria-hidden="true">{conflict ? '⚠' : '✓'}</span>
        <div>
          <h3 id="conflict-title">{conflict ? 'Trùng lịch' : 'Không còn trùng lịch'}</h3>
          <p>
            {conflict
              ? 'Linh yêu cầu 09:00, nhưng Mai (makeup) bận 08:00–12:00. Chọn giờ trống bên dưới.'
              : 'Đã chọn 14:00. Lịch mới không trùng với lịch của Mai.'}
          </p>
        </div>
      </div>
      <p className="slots-label" id="slots-label">Giờ trống</p>
      <div className="slots" role="group" aria-labelledby="slots-label">
        {slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            className="slot"
            aria-pressed={picked === slot.id}
            onClick={() => onPick(slot)}
          >
            <span className="slot-time">
              <span aria-hidden="true">✓</span> {slot.time}
              {picked === slot.id ? <span className="slot-picked"> · Đã chọn</span> : null}
            </span>
            <span className="slot-note">{slot.note}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
