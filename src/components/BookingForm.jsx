import Button from './Button.jsx';
import ConflictAlert from './ConflictAlert.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatVND } from '../data.js';

// A real form: labels are visible, the error sits under the time field with
// aria-invalid, and submitting goes to lich-chup.html. No preventDefault.
export default function BookingForm({
  booking,
  services = [],
  conflict,
  start,
  onStartChange,
  slots,
  picked,
  onPickSlot,
  agreed,
  onSendQuote,
}) {
  const tone = conflict ? 'conflict' : agreed ? 'confirmed' : 'pending';
  const label = conflict ? 'Trùng lịch' : agreed ? 'Đã chốt giờ' : 'Chờ chốt giờ';

  return (
    <form className="panel booking-form" action="lich-chup.html" aria-labelledby="booking-form-title">
      <div className="panel-head">
        <h2 id="booking-form-title">Booking mới</h2>
        <StatusBadge tone={tone}>{label}</StatusBadge>
      </div>
      <p className="form-lede">
        {booking.customer} · {booking.sessionType} · {booking.pkg} · {formatVND(booking.price)}
      </p>

      <div className="form-grid">
        <p className="field">
          <label className="field-label" htmlFor="bf-customer">Khách hàng</label>
          <input className="input" id="bf-customer" type="text" defaultValue={booking.customer} autoComplete="off" />
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-package">Gói chụp</label>
          <select className="input" id="bf-package" defaultValue={booking.pkg}>
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name} · {service.priceNote}
              </option>
            ))}
          </select>
          <span className="field-hint">{booking.pkgDetail}</span>
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-date">Ngày chụp</label>
          <input className="input" id="bf-date" type="text" defaultValue={booking.date} />
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-start">Giờ bắt đầu</label>
          <select
            className="input"
            id="bf-start"
            value={start}
            aria-invalid={conflict ? 'true' : 'false'}
            aria-describedby={conflict ? 'bf-start-error' : undefined}
            onChange={(event) => onStartChange(event.target.value)}
          >
            <option value="09:00">09:00</option>
            <option value="14:00">14:00</option>
          </select>
          {conflict ? (
            <span className="field-error" id="bf-start-error">⚠ Mai (makeup) bận 08:00–12:00</span>
          ) : null}
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-makeup">Thợ makeup</label>
          <select className="input" id="bf-makeup" defaultValue={booking.makeup.who}>
            <option value="Mai">Mai</option>
          </select>
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-photographer">Thợ chụp</label>
          <select className="input" id="bf-photographer" defaultValue={booking.shoot.who}>
            <option value="Tuấn">Tuấn</option>
          </select>
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-room">Phòng chụp</label>
          <select className="input" id="bf-room" defaultValue={booking.shoot.room}>
            <option value="Phòng B">Phòng B</option>
            <option value="Phòng A">Phòng A</option>
          </select>
        </p>
      </div>

      <ConflictAlert
        conflict={conflict}
        slots={slots}
        picked={picked}
        onPick={onPickSlot}
      />

      <div className="form-actions">
        <Button variant="secondary" type="button" onClick={onSendQuote} disabled={!picked}>
          Gửi báo giá
        </Button>
        <Button variant="primary" type="submit" disabled={!agreed}>
          Tạo booking mới
        </Button>
      </div>
      <p className="form-note">
        {agreed
          ? 'Linh đã chốt 14:00. Nút Tạo booking mới đã bật.'
          : 'Chọn giờ 14:00, gửi báo giá và mô phỏng câu trả lời của Linh để bật nút Tạo booking mới.'}
      </p>
    </form>
  );
}