import Button from './Button.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatVND } from '../data.js';

// Payment has no next screen in PA#2. The button is disabled, and the note
// next to it states the rule from the brief: the slot is held only after the
// 30% deposit succeeds.
export default function DepositCard({ booking }) {
  return (
    <section className="panel deposit" aria-labelledby="deposit-title">
      <div className="panel-head">
        <h2 id="deposit-title">Đặt cọc giữ lịch</h2>
        <StatusBadge tone="pending">{booking.statusLabel}</StatusBadge>
      </div>

      <div className="deposit-highlight">
        <p className="deposit-label">Cọc giữ lịch (30%)</p>
        <p className="deposit-amount">{formatVND(booking.deposit)}</p>
      </div>

      <dl className="summary-list">
        <div className="summary-row">
          <dt>Tổng gói ({booking.pkg})</dt>
          <dd>{formatVND(booking.price)}</dd>
        </div>
        <div className="summary-row">
          <dt>Thanh toán sau buổi chụp (70%)</dt>
          <dd>{formatVND(booking.rest)}</dd>
        </div>
      </dl>

      <Button variant="primary" disabled aria-describedby="deposit-note">
        Thanh toán cọc 30% ({formatVND(booking.deposit)})
      </Button>
      <p className="deposit-note" id="deposit-note">
        Chưa mở cổng thanh toán trong bản mẫu. Lịch {booking.agreed} ngày {booking.date} chỉ được giữ chính thức sau khi đặt cọc 30% thành công.
      </p>
    </section>
  );
}
