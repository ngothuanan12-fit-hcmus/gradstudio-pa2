import { formatVND } from '../data.js';

// Money sits in its own right-aligned column, and a long package name wraps
// inside its cell instead of pushing the price out of the card.
export default function BookingSummary({ booking, title = 'Buổi chụp của bạn', time, note, badge }) {
  return (
    <section className="summary" aria-labelledby="summary-title">
      <div className="summary-head">
        <h2 className="summary-title" id="summary-title">{title}</h2>
        {badge || null}
      </div>
      {note ? <p className="summary-note">{note}</p> : null}
      <dl className="summary-list">
        <div className="summary-row">
          <dt>Mã booking</dt>
          <dd>{booking.id}</dd>
        </div>
        <div className="summary-row">
          <dt>Gói</dt>
          <dd>
            {booking.pkg}
            <span className="summary-detail">{booking.pkgDetail}</span>
          </dd>
        </div>
        <div className="summary-row">
          <dt>Loại buổi chụp</dt>
          <dd>{booking.sessionType}</dd>
        </div>
        <div className="summary-row">
          <dt>Ngày</dt>
          <dd>{booking.dayOfWeek}, {booking.date}</dd>
        </div>
        <div className="summary-row">
          <dt>Giờ</dt>
          <dd>{time || `${booking.makeup.from}–${booking.shoot.to}`}</dd>
        </div>
        <div className="summary-row">
          <dt>Lưu ý</dt>
          <dd>{booking.arrivalNote}</dd>
        </div>
        <div className="summary-row summary-total">
          <dt>Tổng</dt>
          <dd>{formatVND(booking.price)}</dd>
        </div>
      </dl>
    </section>
  );
}