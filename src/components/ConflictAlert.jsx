// The alert names who is busy and when, both when 09:00 is selected and in the
// opening state after switching to 14:00. A free time is a real button with
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
          <h3 id="conflict-title">
            {conflict ? 'Trùng lịch lúc 09:00' : 'Đã đổi từ 09:00 sang 14:00 để tránh trùng lịch'}
          </h3>
          <p>
            {conflict
              ? 'Linh yêu cầu 09:00, nhưng Mai (makeup) bận 08:00–12:00. Chọn giờ trống 14:00 bên dưới để tạo booking.'
              : 'Giờ 09:00 Linh hỏi ban đầu bị trùng vì Mai (makeup) bận 08:00–12:00. Khung 14:00 đã chọn có đủ thợ makeup Mai, thợ chụp Tuấn và Phòng B.'}
          </p>
        </div>
      </div>
      <p className="slots-label" id="slots-label">Gợi ý giờ trống</p>
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
              <span aria-hidden="true">✓</span> {slot.time} · Gần nhất
              {picked === slot.id ? <span className="slot-picked"> · Đã chọn</span> : <span className="slot-picked"> · Chọn giờ này</span>}
            </span>
            <span className="slot-note">{slot.note}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
