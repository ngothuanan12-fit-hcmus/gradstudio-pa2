import { formatVND } from '../data.js';

export default function BookingSummary({ booking, title = 'Buổi chụp của bạn' }) {
  return (
    <section className="summary" aria-label={title}>
      <h2 className="summary-title">{title}</h2>
      <dl className="summary-list">
        <div className="summary-row"><dt>Mã booking</dt><dd>{booking.id}</dd></div>
        <div className="summary-row"><dt>Gói</dt><dd>{booking.pkg}</dd></div>
        <div className="summary-row"><dt>Ngày</dt><dd>{booking.dayOfWeek}, {booking.date}</dd></div>
        <div className="summary-row"><dt>Giờ</dt><dd>{booking.makeup.from}–{booking.shoot.to}</dd></div>
        <div className="summary-row summary-total"><dt>Tổng</dt><dd>{formatVND(booking.price)}</dd></div>
      </dl>
    </section>
  );
}
