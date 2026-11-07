import { useRef } from 'react';
import Button from './Button.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatVND } from '../data.js';

// Payment is simulated. The native <dialog> gives focus trapping and Escape
// for free; nothing leaves the page and no money moves.
export default function DepositCard({ booking, paid, percent = 30, onPaid }) {
  const dialogRef = useRef(null);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function confirmPayment() {
    dialogRef.current?.close();
    onPaid();
  }

  return (
    <section className="panel deposit" aria-labelledby="deposit-title">
      <div className="panel-head">
        <h2 id="deposit-title">Thanh toán cọc {percent}%</h2>
        <StatusBadge tone={paid ? 'confirmed' : 'pending'}>{paid ? 'Đã cọc' : 'Chờ cọc'}</StatusBadge>
      </div>
      <p className="pay-note">Thanh toán mô phỏng, không có giao dịch thật.</p>

      <div
        className="deposit-bar"
        role="progressbar"
        aria-label="Đã thanh toán"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={paid ? percent : 0}
      >
        <span className={paid ? 'deposit-fill deposit-fill-paid' : 'deposit-fill'} />
      </div>

      <dl className="money-list">
        <div>
          <dt>Giá gói</dt>
          <dd>{formatVND(booking.price)}</dd>
        </div>
        <div>
          <dt>Tiền cọc {percent}%</dt>
          <dd>{formatVND(booking.deposit)}</dd>
        </div>
        <div>
          <dt>Còn lại sau buổi chụp</dt>
          <dd>{formatVND(booking.rest)}</dd>
        </div>
      </dl>

      {paid ? (
        <p className="pay-done">✓ Đã ghi nhận cọc mô phỏng {formatVND(booking.deposit)}.</p>
      ) : (
        <Button variant="primary" type="button" onClick={openDialog}>
          Thanh toán {formatVND(booking.deposit)}
        </Button>
      )}

      <dialog className="pay-dialog" ref={dialogRef} aria-labelledby="pay-dialog-title">
        <h2 id="pay-dialog-title">Mô phỏng thanh toán</h2>
        <p>Đây là hộp thoại mô phỏng. Không có giao dịch thật nào được thực hiện.</p>
        <p className="pay-amount">{formatVND(booking.deposit)}</p>
        <p className="pay-note">Cọc {percent}% cho booking {booking.id}.</p>
        <div className="dialog-actions">
          <Button variant="ghost" type="button" onClick={closeDialog}>Hủy</Button>
          <Button variant="secondary" type="button" onClick={confirmPayment}>Thanh toán thành công</Button>
        </div>
      </dialog>
    </section>
  );
}