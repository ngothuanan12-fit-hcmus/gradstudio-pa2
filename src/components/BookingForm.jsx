import Button from './Button.jsx';
import ConflictAlert from './ConflictAlert.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatVND } from '../data.js';

// A real form. The page opens at 14:00, the time Linh agreed, so the submit is
// enabled; changing back to 09:00 brings the clash and disables it again.
export default function BookingForm({
  booking,
  services = [],
  conflict,
  start,
  onStartChange,
  slots,
  picked,
  onPickSlot,
}) {
  return (
    <form className="panel booking-form" action="lich-chup.html" aria-labelledby="booking-form-title">
      <div className="panel-head">
        <h2 id="booking-form-title">Booking mới</h2>
        <StatusBadge tone={conflict ? 'conflict' : 'confirmed'}>
          {conflict ? 'Trùng lịch' : 'Đã chốt lịch'}
        </StatusBadge>
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
            <option value={booking.requested}>{booking.requested}</option>
            <option value={booking.agreed}>{booking.agreed}</option>
          </select>
          {conflict ? (
            <span className="field-error" id="bf-start-error">⚠ Mai (makeup) bận 08:00–12:00</span>
          ) : null}
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-makeup">Thợ makeup</label>
          <select className="input" id="bf-makeup" defaultValue={booking.makeup.who}>
            <option value={booking.makeup.who}>{booking.makeup.who}</option>
          </select>
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-photographer">Thợ chụp</label>
          <select className="input" id="bf-photographer" defaultValue={booking.shoot.who}>
            <option value={booking.shoot.who}>{booking.shoot.who}</option>
          </select>
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-room">Phòng chụp</label>
          <select className="input" id="bf-room" defaultValue={booking.shoot.room}>
            <option value={booking.shoot.room}>{booking.shoot.room}</option>
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
        <Button variant="primary" type="submit" disabled={conflict}>
          Tạo booking và mở lịch chụp của Linh
        </Button>
      </div>
      <p className="form-note">
        {conflict
          ? 'Chọn giờ không trùng để tạo booking.'
          : `GS-1024 · Linh đã chốt ${booking.agreed} ngày ${booking.date}.`}
      </p>
    </form>
  );
}
