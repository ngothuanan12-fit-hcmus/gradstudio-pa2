import Button from './Button.jsx';
import ConflictAlert from './ConflictAlert.jsx';
import StatusBadge from './StatusBadge.jsx';
import { bookingAddons, formatVND } from '../data.js';

// A real form. The page opens at 14:00, the time Linh agreed, so the submit is
// enabled; changing back to 09:00 brings the clash and disables it again.
export default function BookingForm({
  booking,
  services = [],
  addons = bookingAddons,
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
          <label className="field-label" htmlFor="bf-session-type">Loại buổi chụp</label>
          <select className="input" id="bf-session-type" defaultValue={booking.sessionType}>
            <option value="Tốt nghiệp cá nhân">Tốt nghiệp cá nhân</option>
            <option value="Tốt nghiệp nhóm">Tốt nghiệp nhóm</option>
          </select>
        </p>

        <p className="field field-span">
          <label className="field-label" htmlFor="bf-package">Gói chụp</label>
          <select className="input" id="bf-package" defaultValue={booking.pkg}>
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name} · {service.priceNote}
              </option>
            ))}
          </select>
          <span className="field-hint">{booking.pkgDetail} · Giá chốt: {formatVND(booking.price)} (cọc 30%: {formatVND(booking.deposit)})</span>
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-date">Ngày chụp</label>
          <input className="input" id="bf-date" type="text" defaultValue={`${booking.dayOfWeek}, ${booking.date}`} />
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-start">Giờ bắt đầu chụp</label>
          <select
            className="input"
            id="bf-start"
            value={start}
            aria-invalid={conflict ? 'true' : 'false'}
            aria-describedby="bf-start-status"
            onChange={(event) => onStartChange(event.target.value)}
          >
            <option value={booking.requested}>{booking.requested} (giờ Linh hỏi ban đầu)</option>
            <option value={booking.agreed}>{booking.agreed} (giờ đã chốt)</option>
          </select>
          <span className={conflict ? 'field-error' : 'field-ok'} id="bf-start-status">
            {conflict
              ? '⚠ Trùng lịch: Mai (makeup) bận 08:00–12:00'
              : '✓ Đủ thợ makeup Mai, thợ chụp Tuấn và Phòng B'}
          </span>
        </p>

        <fieldset className="field field-span form-fieldset">
          <legend className="field-label">Dịch vụ đi kèm</legend>
          <div className="form-checks">
            {addons.map((addon) => (
              <label key={addon.id} className="form-check" htmlFor={`bf-addon-${addon.id}`}>
                <input
                  id={`bf-addon-${addon.id}`}
                  type="checkbox"
                  defaultChecked={addon.defaultChecked}
                />
                <span>{addon.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="field">
          <label className="field-label" htmlFor="bf-makeup">Thợ makeup</label>
          <select className="input" id="bf-makeup" defaultValue={booking.makeup.who}>
            <option value={booking.makeup.who}>
              {booking.makeup.who} ({booking.makeup.from}–{booking.makeup.to})
            </option>
          </select>
        </p>

        <p className="field">
          <label className="field-label" htmlFor="bf-photographer">Thợ chụp</label>
          <select className="input" id="bf-photographer" defaultValue={booking.shoot.who}>
            <option value={booking.shoot.who}>
              {booking.shoot.who} ({booking.shoot.from}–{booking.shoot.to})
            </option>
          </select>
        </p>

        <p className="field field-span">
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
          Tạo booking · Khách hàng: mở lịch chụp GS-1024
        </Button>
      </div>
      <p className="form-note">
        {conflict
          ? 'Chọn giờ không trùng (14:00) để bật nút tạo booking.'
          : `GS-1024 · Linh đã chốt ${booking.agreed} ngày ${booking.date}. Lịch chỉ được giữ sau khi khách thanh toán cọc 30%.`}
      </p>
    </form>
  );
}
