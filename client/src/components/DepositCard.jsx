import { useNavigate } from 'react-router';
import { api } from '../api/client.js';
import useAction from '../forms/useAction.js';
import { formatMoment } from '../utils/moment.js';
import { formatVND } from '../utils/money.js';
import Button from './Button.jsx';
import DataState from './DataState.jsx';
import Icon from './Icon.jsx';

const PAY_STATUS_LABEL = {
  succeeded: 'Thành công',
  failed: 'Thất bại',
  pending: 'Đang chờ',
};

// Shows deposit/remainder amounts, transaction history for the booking, and state-appropriate payment/next-step controls.
export default function DepositCard({ booking, paymentsQuery }) {
  const navigate = useNavigate();
  const depositAction = useAction();

  const allPayments = paymentsQuery.data || [];
  const bookingPayments = allPayments.filter((p) => p.bookingId === booking.id);
  const latestFailed = bookingPayments.find((p) => p.kind === 'deposit' && p.status === 'failed');
  const pendingPay = bookingPayments.find((p) => p.status === 'pending');
  const latestDepositSuccess = bookingPayments.find((p) => p.kind === 'deposit' && p.status === 'succeeded');

  const isUnpaidPending = booking.status === 'Chờ cọc 30%' && booking.payment?.depositStatus === 'unpaid';
  const isRaceClash = booking.status === 'Chờ cọc 30%' && booking.payment?.depositStatus === 'paid';
  const isBooked = booking.status === 'Đã đặt lịch';
  const isDone = booking.status === 'Hoàn thành';
  const isCancelled = booking.status === 'Đã hủy';

  function handleStartDeposit(event) {
    event.preventDefault();
    if (!isUnpaidPending || depositAction.busy) return;
    depositAction.run(async () => {
      const payment = await api('/payments', {
        method: 'POST',
        body: { bookingId: booking.id, kind: 'deposit' },
      });
      navigate(`/thanh-toan/${payment.id}`);
    });
  }

  return (
    <section className="panel deposit" aria-labelledby="deposit-title">
      <h2 id="deposit-title">Thanh toán cọc 30%</h2>
      <dl className="deposit-list">
        <div className="deposit-row deposit-row-primary">
          <dt>Cọc 30%</dt>
          <dd>{formatVND(booking.pricing.deposit)}</dd>
        </div>
        <div className="deposit-row">
          <dt>Còn lại sau cọc</dt>
          <dd>{formatVND(booking.pricing.remainder)}</dd>
        </div>
        <div className="deposit-row">
          <dt>Tổng gói</dt>
          <dd>{formatVND(booking.pricing.total)}</dd>
        </div>
      </dl>

      {isUnpaidPending ? (
        <form className="deposit-form" noValidate onSubmit={handleStartDeposit}>
          {latestFailed ? (
            <div className="schedule-alert is-danger" role="status">
              <Icon name="alert" />
              <p>{latestFailed.message}</p>
            </div>
          ) : null}

          {pendingPay ? (
            <div className="schedule-alert is-notice">
              <p>Giao dịch {pendingPay.id} đang chờ hoàn tất trên cổng thanh toán thử nghiệm.</p>
              <Button variant="secondary" to={`/thanh-toan/${pendingPay.id}`}>
                Tiếp tục thanh toán ({pendingPay.id})
              </Button>
            </div>
          ) : null}

          {depositAction.error ? (
            <p className="form-error" role="alert">
              {depositAction.error}
            </p>
          ) : null}

          <Button
            variant="primary"
            type="submit"
            aria-disabled={depositAction.busy ? 'true' : undefined}
            aria-describedby="deposit-note"
          >
            {depositAction.busy
              ? 'Đang mở cổng thanh toán…'
              : latestFailed
                ? 'Thử thanh toán lại cọc 30%'
                : 'Thanh toán cọc 30%'}
          </Button>
          <p className="deposit-note" id="deposit-note">
            Lịch chỉ được giữ sau khi cọc thành công và studio kiểm tra lại lịch.
          </p>
        </form>
      ) : null}

      {isRaceClash ? (
        <div className="deposit-state-actions">
          <div className="schedule-alert is-danger" role="status">
            <Icon name="alert" />
            <div>
              <p>
                <strong>Đã nhận cọc 30%, nhưng lịch chưa được giữ</strong>
              </p>
              <p>
                {latestDepositSuccess?.message ||
                  'Đã nhận tiền cọc 30%, nhưng khung giờ đã có khách khác giữ trước. Booking vẫn ở trạng thái Chờ cọc 30%; hãy nhắn studio để đổi lịch hoặc xử lý.'}
              </p>
              {booking.payment?.depositPaidAt ? (
                <p className="meta-line">Ghi nhận lúc {formatMoment(booking.payment.depositPaidAt)}</p>
              ) : null}
            </div>
          </div>
          <Button variant="primary" to="/tu-van">
            Nhắn với studio
          </Button>
        </div>
      ) : null}

      {isBooked ? (
        <div className="deposit-state-actions">
          <div className="schedule-alert is-free" role="status">
            <Icon name="check" />
            <div>
              <p>
                Đã thanh toán cọc 30%
                {booking.payment?.depositPaidAt ? ` lúc ${formatMoment(booking.payment.depositPaidAt)}` : ''}.
              </p>
              {booking.payment?.remainderStatus === 'paid' ? (
                <p>
                  Đã thanh toán 70% còn lại
                  {booking.payment?.remainderPaidAt ? ` lúc ${formatMoment(booking.payment.remainderPaidAt)}` : ''}.
                </p>
              ) : null}
            </div>
          </div>
          <Button variant="primary" to={`/lich-chup/${booking.id}/anh`}>
            {booking.payment?.remainderStatus === 'paid' ? 'Nhận ảnh buổi chụp' : 'Chọn ảnh & thanh toán 70%'}
          </Button>
        </div>
      ) : null}

      {isDone ? (
        <div className="deposit-state-actions">
          <div className="schedule-alert is-free" role="status">
            <Icon name="done" />
            <div>
              <p>
                Đã thanh toán đủ 100% ({formatVND(booking.pricing.total)}).
                {booking.payment?.remainderPaidAt
                  ? ` Hoàn tất lúc ${formatMoment(booking.payment.remainderPaidAt)}.`
                  : ''}
              </p>
            </div>
          </div>
          {booking.fileLink ? (
            <a className="btn btn-primary" href={booking.fileLink} target="_blank" rel="noreferrer">
              Mở link ảnh hoàn chỉnh
            </a>
          ) : null}
          <Button variant="secondary" to={`/lich-chup/${booking.id}/anh`}>
            Xem bộ ảnh buổi chụp
          </Button>
        </div>
      ) : null}

      {isCancelled ? (
        <div className="schedule-alert is-neutral" role="status">
          <Icon name="alert" />
          <div>
            <p>Booking đã hủy. Nhân sự và phòng chụp đã được giải phóng.</p>
            {booking.payment?.depositStatus === 'paid' ? (
              <p className="meta-line">
                Số tiền cọc đã thanh toán ({formatVND(booking.pricing.deposit)}
                {booking.payment.depositPaidAt ? `, lúc ${formatMoment(booking.payment.depositPaidAt)}` : ''}) vẫn được
                ghi nhận để studio hoàn ngoài hệ thống.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="deposit-history-block">
        <h3 className="deposit-history-title">Lịch sử giao dịch</h3>
        <DataState
          query={paymentsQuery}
          isEmpty={(list) => !list.some((p) => p.bookingId === booking.id)}
          emptyText="Chưa có giao dịch thanh toán nào."
          loadingLabel="Đang tải lịch sử giao dịch…"
        >
          {(list) => {
            const items = list.filter((p) => p.bookingId === booking.id);
            return (
              <ul className="schedule-pay-list">
                {items.map((p) => (
                  <li key={p.id} className="schedule-pay-item">
                    <div className="schedule-pay-top">
                      <strong>{p.kind === 'deposit' ? 'Cọc 30%' : 'Phần còn lại 70%'}</strong>
                      <span className="gs-tnum">{formatVND(p.amount)}</span>
                    </div>
                    <div className="schedule-pay-meta">
                      <span>{PAY_STATUS_LABEL[p.status] || p.status}</span>
                      <time dateTime={p.completedAt || p.createdAt}>{formatMoment(p.completedAt || p.createdAt)}</time>
                    </div>
                    {p.message ? <p className="schedule-pay-note">{p.message}</p> : null}
                  </li>
                ))}
              </ul>
            );
          }}
        </DataState>
      </div>
    </section>
  );
}
