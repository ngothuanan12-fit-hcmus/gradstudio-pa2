import StatusBadge from './StatusBadge.jsx';
import { vnDateLong, vnWeekday } from '../utils/date.js';
import { formatVND } from '../utils/money.js';
import { BOOKING_TONE } from '../utils/status.js';

function formatExtra(ex) {
  const parts = [ex.name];
  if (ex.modelName) parts.push(ex.modelName);
  if (ex.size) parts.push(`size ${ex.size}`);
  const text = parts.join(' · ');
  return ex.quantity > 1 ? `${text} × ${ex.quantity}` : text;
}

// Customer-facing summary of one booking from GET /api/bookings.
export default function BookingSummary({ booking }) {
  const isRaceClash = booking.status === 'Chờ cọc 30%' && booking.payment?.depositStatus === 'paid';
  const badgeTone = isRaceClash ? 'conflict' : BOOKING_TONE[booking.status] || 'neutral';
  const badgeText = isRaceClash
    ? 'Chờ cọc 30% · Trùng lịch'
    : booking.status === 'Chờ cọc 30%'
      ? 'Đã thống nhất lịch · Chờ cọc 30%'
      : booking.status;

  const durationLabel = booking.durationMinutes
    ? booking.durationMinutes % 60 === 0
      ? `${booking.durationMinutes / 60} giờ`
      : `${booking.durationMinutes} phút`
    : null;
  const pkgDetail = [durationLabel, booking.editedPhotos ? `${booking.editedPhotos} ảnh chỉnh` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="panel summary" aria-labelledby="summary-title">
      <div className="panel-head">
        <h2 className="summary-title" id="summary-title">
          Buổi chụp {booking.id}
        </h2>
        <StatusBadge tone={badgeTone}>{badgeText}</StatusBadge>
      </div>
      <dl className="summary-list">
        <div className="summary-row">
          <dt>Mã booking</dt>
          <dd>{booking.id}</dd>
        </div>
        <div className="summary-row">
          <dt>Buổi chụp</dt>
          <dd>
            {booking.sessionType}
            {booking.people > 1 ? ` · ${booking.people} người` : ''}
          </dd>
        </div>
        <div className="summary-row">
          <dt>Gói</dt>
          <dd>
            {booking.packageName}
            {pkgDetail ? <span className="summary-sub">{pkgDetail}</span> : null}
          </dd>
        </div>
        {booking.extras?.length ? (
          <div className="summary-row">
            <dt>Dịch vụ thêm</dt>
            <dd>{booking.extras.map(formatExtra).join(', ')}</dd>
          </div>
        ) : null}
        <div className="summary-row">
          <dt>Ngày</dt>
          <dd>
            {vnWeekday(booking.date)}, {vnDateLong(booking.date)}
          </dd>
        </div>
        <div className="summary-row">
          <dt>Makeup</dt>
          <dd>
            {booking.makeup ? `${booking.makeup.from}–${booking.makeup.to} với ${booking.makeup.staffName}` : 'Không'}
          </dd>
        </div>
        <div className="summary-row">
          <dt>Chụp</dt>
          <dd>
            {booking.shoot.from}–{booking.shoot.to} với {booking.shoot.staffName} · {booking.shoot.roomName}
          </dd>
        </div>
        <div className="summary-row">
          <dt>Tổng gói</dt>
          <dd>{formatVND(booking.pricing.total)}</dd>
        </div>
      </dl>
    </section>
  );
}
