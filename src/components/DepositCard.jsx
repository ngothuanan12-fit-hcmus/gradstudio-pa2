import Button from './Button.jsx';
import { formatVND } from '../data.js';

// The deposit has no next page in PA#2, so the button is disabled and the note
// says why. The slot is only held after the deposit succeeds.
export default function DepositCard({ booking }) {
  return (
    <section className="panel deposit" aria-labelledby="deposit-title">
      <h2 id="deposit-title">Thanh toán cọc 30%</h2>
      <dl className="deposit-list">
        <div className="deposit-row deposit-row-primary">
          <dt>Cọc 30%</dt>
          <dd>{formatVND(booking.deposit)}</dd>
        </div>
        <div className="deposit-row">
          <dt>Còn lại sau cọc</dt>
          <dd>{formatVND(booking.rest)}</dd>
        </div>
        <div className="deposit-row">
          <dt>Tổng gói</dt>
          <dd>{formatVND(booking.price)}</dd>
        </div>
      </dl>
      <Button variant="primary" disabled aria-describedby="deposit-note">
        Thanh toán cọc 30%
      </Button>
      <p className="deposit-note" id="deposit-note">
        Chưa thanh toán được trong bản mẫu: PA#2 không có cổng thanh toán. Lịch chỉ được giữ
        sau khi cọc thành công và studio kiểm tra lại lịch.
      </p>
    </section>
  );
}
