import StatusBadge from './StatusBadge.jsx';
import { formatVND } from '../data.js';

// GS-1024 is agreed but not held: the badge says both what is settled and what
// is still missing, and the slot stays open until the deposit succeeds.
export default function BookingSummary({ booking, title = 'Buổi chụp GS-1024' }) {
  return (
    <section className="panel summary" aria-labelledby="summary-title">
      <div className="panel-head">
        <h2 className="summary-title" id="summary-title">{title}</h2>
        <StatusBadge tone="pending">Đã thống nhất lịch · Chờ cọc 30%</StatusBadge>
      </div>
      <dl className="summary-list">
        <div className="summary-row"><dt>Mã booking</dt><dd>{booking.id}</dd></div>
        <div className="summary-row"><dt>Khách hàng</dt><dd>{booking.customer}</dd></div>
        <div className="summary-row"><dt>Buổi chụp</dt><dd>{booking.sessionType}</dd></div>
        <div className="summary-row"><dt>Gói dịch vụ</dt><dd>{booking.pkg} · {booking.pkgDetail}</dd></div>
        <div className="summary-row"><dt>Ngày chụp</dt><dd>{booking.dayOfWeek}, {booking.date}</dd></div>
        <div className="summary-row">
          <dt>Makeup</dt>
          <dd>{booking.makeup.from}–{booking.makeup.to} với {booking.makeup.who}</dd>
        </div>
        <div className="summary-row">
          <dt>Chụp</dt>
          <dd>{booking.shoot.from}–{booking.shoot.to} với {booking.shoot.who} · {booking.shoot.room}</dd>
        </div>
        <div className="summary-row"><dt>Lưu ý</dt><dd>{booking.arrivalNote}</dd></div>
        <div className="summary-row summary-total"><dt>Tổng gói</dt><dd>{formatVND(booking.price)}</dd></div>
      </dl>
    </section>
  );
}
