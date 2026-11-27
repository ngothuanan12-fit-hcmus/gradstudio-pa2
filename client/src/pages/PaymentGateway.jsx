import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../api/client.js';
import Button from '../components/Button.jsx';
import DataState from '../components/DataState.jsx';
import Icon from '../components/Icon.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import useAction from '../forms/useAction.js';
import useApi from '../hooks/useApi.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import { vnDateLong, vnWeekday } from '../utils/date.js';
import { formatVND } from '../utils/money.js';
import '../styles/schedule.css';

const PAYMENT_BADGE = {
  pending: { tone: 'pending', label: 'Đang chờ thanh toán' },
  succeeded: { tone: 'confirmed', label: 'Thành công' },
  failed: { tone: 'new', label: 'Thất bại' },
};

// Steps G7 & G9 (docs/api/06-payments.md): test payment gateway route (/thanh-toan/:paymentId).
export default function PaymentGateway() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const paymentQuery = useApi(`/payments/${paymentId}`);
  const bookingId = paymentQuery.data?.bookingId || null;
  const bookingQuery = useApi(bookingId ? `/bookings/${bookingId}` : null);
  const submitAction = useAction();

  function chooseResult(event) {
    event.preventDefault();
    if (submitAction.busy) return;
    const result = event.nativeEvent?.submitter?.value;
    if (result !== 'success' && result !== 'fail') return;
    submitAction.run(async () => {
      await api(`/payments/${paymentId}/result`, {
        method: 'POST',
        body: { result },
      });
      navigate(`/thanh-toan/${paymentId}/ket-qua`);
    });
  }

  return (
    <CustomerLayout title="Cổng thanh toán thử nghiệm: GradStudio">
      <p className="back-link">
        <Link to="/lich-chup">‹ Lịch chụp của tôi</Link>
      </p>
      <h1 className="page-title">Cổng thanh toán thử nghiệm</h1>

      <div className="schedule-alert is-notice" role="note">
        <Icon name="clock" />
        <p>Môi trường thử nghiệm của GradStudio — không trừ tiền thật.</p>
      </div>

      <DataState query={paymentQuery} isEmpty={(p) => !p} loadingLabel="Đang tải thông tin thanh toán…">
        {(payment) => {
          const badge = PAYMENT_BADGE[payment.status] || PAYMENT_BADGE.pending;
          const kindLabel = payment.kind === 'deposit' ? 'Cọc 30%' : 'Thanh toán 70% còn lại';

          return (
            <div className="payment-gateway-grid">
              <section className="panel" aria-labelledby="gw-pay-title">
                <div className="panel-head">
                  <h2 id="gw-pay-title">Thông tin giao dịch {payment.id}</h2>
                  <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
                </div>

                <dl className="deposit-list">
                  <div className="deposit-row deposit-row-primary">
                    <dt>Số tiền thanh toán</dt>
                    <dd>{formatVND(payment.amount)}</dd>
                  </div>
                  <div className="deposit-row">
                    <dt>Mã giao dịch</dt>
                    <dd>{payment.id}</dd>
                  </div>
                  <div className="deposit-row">
                    <dt>Mã booking</dt>
                    <dd>{payment.bookingId}</dd>
                  </div>
                  <div className="deposit-row">
                    <dt>Khoản thanh toán</dt>
                    <dd>{kindLabel}</dd>
                  </div>
                </dl>

                <DataState query={bookingQuery} isEmpty={(b) => !b} loadingLabel="Đang tải thông tin buổi chụp…">
                  {(booking) => (
                    <dl className="summary-list gateway-booking-meta">
                      <div className="summary-row">
                        <dt>Gói chụp</dt>
                        <dd>{booking.packageName}</dd>
                      </div>
                      <div className="summary-row">
                        <dt>Ngày chụp</dt>
                        <dd>
                          {vnWeekday(booking.date)}, {vnDateLong(booking.date)}
                        </dd>
                      </div>
                      <div className="summary-row">
                        <dt>Giờ chụp</dt>
                        <dd>
                          {booking.shoot.from}–{booking.shoot.to} · {booking.shoot.roomName}
                        </dd>
                      </div>
                    </dl>
                  )}
                </DataState>

                {payment.status === 'pending' ? (
                  <form className="gateway-action-box" noValidate onSubmit={chooseResult}>
                    <p className="meta-line">
                      Chọn kết quả mô phỏng để hệ thống ghi nhận và chuyển về trang kết quả thanh toán.
                    </p>
                    {submitAction.error ? (
                      <p className="form-error" role="alert">
                        {submitAction.error}
                      </p>
                    ) : null}
                    <div className="payment-actions">
                      <Button
                        variant="primary"
                        type="submit"
                        name="result"
                        value="success"
                        aria-disabled={submitAction.busy ? 'true' : undefined}
                      >
                        {submitAction.busy ? 'Đang ghi nhận…' : 'Thanh toán thành công'}
                      </Button>
                      <Button
                        variant="secondary"
                        type="submit"
                        name="result"
                        value="fail"
                        aria-disabled={submitAction.busy ? 'true' : undefined}
                      >
                        {submitAction.busy ? 'Đang ghi nhận…' : 'Mô phỏng thanh toán thất bại'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="gateway-action-box">
                    <div className="schedule-alert is-neutral" role="status">
                      <Icon name="alert" />
                      <div>
                        <p>Giao dịch này đã kết thúc ({badge.label.toLowerCase()}) và không thể chọn lại kết quả.</p>
                        {payment.message ? <p>{payment.message}</p> : null}
                      </div>
                    </div>
                    <div className="payment-actions">
                      <Button variant="primary" to={`/thanh-toan/${payment.id}/ket-qua`}>
                        Xem kết quả thanh toán
                      </Button>
                      <Button variant="secondary" to="/lich-chup">
                        Về lịch chụp của tôi
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          );
        }}
      </DataState>
    </CustomerLayout>
  );
}
