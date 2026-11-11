import Button from './Button.jsx';
import Icon from './Icon.jsx';
import { formatVND } from '../data.js';
import { fmtTime, toMinutes } from '../utils/time.js';

// The booking card inside the chat, right after Linh agrees. A real form of its own (never inside the message box's
// form). Details agreed in the chat are filled in; the end times follow from the start time and the 2-hour package.
// The page opens at 14:00, so the submit is enabled; choosing 09:00 brings back the clash and disables it.
// The card can fold to one line, which still shows the time, the clash note and the submit.
// The fields have no `name`: submitting only opens lich-chup.html, which reads its booking from data.js, so no booking
// detail travels in the address.
export default function BookingForm({ booking, services = [], conflict, start, onStartChange, open, onToggle }) {
  // Make-up takes the hour before the shoot; the Premium package shoots for two hours.
  const t = toMinutes(start);
  const makeup = `${fmtTime(t - 60)}–${fmtTime(t)}`;
  const shoot = `${fmtTime(t)}–${fmtTime(t + 120)}`;
  return (
    <form className="booking-card" id="booking-moi" action="lich-chup.html" aria-labelledby="booking-card-title">
      <div className="booking-card-head">
        <h3 id="booking-card-title">Booking mới cho Linh</h3>
        <Button variant="secondary" aria-expanded={open} aria-controls="booking-card-details" onClick={onToggle}>
          {open ? 'Thu gọn' : 'Mở chi tiết'}
        </Button>
      </div>
      <p className="booking-card-summary">
        {booking.date} · {start} · Makeup {makeup} · Chụp {shoot}
      </p>
      <p className={conflict ? 'booking-card-note is-conflict' : 'booking-card-note'} role="status">
        <Icon name="alert" />{' '}
        {conflict
          ? `09:00 trùng lịch: Mai (makeup) bận 08:00–12:00. Chọn ${booking.agreed} để tạo booking.`
          : `09:00 Linh hỏi ban đầu bị trùng vì Mai (makeup) bận 08:00–12:00, nên đã đổi sang ${booking.agreed}.`}
      </p>

      <div id="booking-card-details" className="booking-card-details" hidden={!open}>
        <fieldset className="bf-group">
          <legend>Khách và gói <span className="bf-from">· lấy từ hội thoại</span></legend>
          <div className="bf-grid">
            <p className="field">
              <label className="field-label" htmlFor="bf-customer">Khách hàng</label>
              <input className="input" id="bf-customer" type="text" defaultValue={booking.customer} autoComplete="off" />
            </p>
            <p className="field">
              <label className="field-label" htmlFor="bf-package">Gói chụp</label>
              <select className="input" id="bf-package" defaultValue={booking.pkg}>
                {services.map((service) => (
                  <option key={service.id} value={service.name}>{service.name}</option>
                ))}
              </select>
              <span className="field-hint">{booking.pkgDetail} · {formatVND(booking.price)}</span>
            </p>
          </div>
        </fieldset>

        <fieldset className="bf-group">
          <legend>Thời gian <span className="bf-from">· lấy từ hội thoại</span></legend>
          <div className="bf-grid">
            <p className="field">
              <label className="field-label" htmlFor="bf-date">Ngày chụp</label>
              <input className="input" id="bf-date" type="text" defaultValue={booking.date} />
            </p>
            <p className="field">
              <label className="field-label" htmlFor="bf-start">Giờ chụp</label>
              <select
                className="input"
                id="bf-start"
               
                value={start}
                aria-invalid={conflict ? 'true' : 'false'}
                onChange={(event) => onStartChange(event.target.value)}
              >
                <option value={booking.requested}>{booking.requested}</option>
                <option value={booking.agreed}>{booking.agreed}</option>
              </select>
              <span className="field-hint">Makeup {makeup} · Chụp {shoot}</span>
            </p>
          </div>
        </fieldset>

        <fieldset className="bf-group">
          <legend>Người và phòng</legend>
          <div className="bf-grid">
            <p className="field">
              <label className="field-label" htmlFor="bf-makeup">Thợ makeup</label>
              <select className="input" id="bf-makeup" defaultValue={booking.makeup.who}>
                <option value={booking.makeup.who}>{booking.makeup.who}</option>
              </select>
              <span className={conflict ? 'bf-avail is-busy' : 'bf-avail is-free'}>
                <Icon name={conflict ? 'alert' : 'check'} /> {conflict ? 'Bận 08:00–12:00' : `Trống ${makeup}`}
              </span>
            </p>
            <p className="field">
              <label className="field-label" htmlFor="bf-photographer">Thợ chụp</label>
              <select className="input" id="bf-photographer" defaultValue={booking.shoot.who}>
                <option value={booking.shoot.who}>{booking.shoot.who}</option>
              </select>
              {conflict ? null : <span className="bf-avail is-free"><Icon name="check" /> Trống {shoot}</span>}
            </p>
            <p className="field">
              <label className="field-label" htmlFor="bf-room">Phòng chụp</label>
              <select className="input" id="bf-room" defaultValue={booking.shoot.room}>
                <option value={booking.shoot.room}>{booking.shoot.room}</option>
              </select>
              {conflict ? null : <span className="bf-avail is-free"><Icon name="check" /> Trống {shoot}</span>}
            </p>
          </div>
        </fieldset>
      </div>

      <Button variant="primary" type="submit" disabled={conflict}>
        <span>Tạo booking GS-1024</span>
        <span className="btn-sub">Khách hàng: mở lịch chụp</span>
      </Button>
    </form>
  );
}
