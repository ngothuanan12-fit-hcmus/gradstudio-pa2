import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../api/client.js';
import Button from '../components/Button.jsx';
import DataState from '../components/DataState.jsx';
import Icon from '../components/Icon.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import useAction from '../forms/useAction.js';
import useApi from '../hooks/useApi.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import { vnDateLong } from '../utils/date.js';
import { formatMoment } from '../utils/moment.js';
import { formatVND } from '../utils/money.js';
import { BOOKING_TONE } from '../utils/status.js';
import '../styles/schedule.css';

// Standalone payment result page (/thanh-toan/:paymentId/ket-qua), safe on direct load or F5.
export default function PaymentResult() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const paymentQuery = useApi(`/payments/${paymentId}`);
  const bookingId = paymentQuery.data?.bookingId || null;
  const bookingQuery = useApi(bookingId ? `/bookings/${bookingId}` : null);
  const retryAction = useAction();

  return (
    <CustomerLayout title="Kết quả thanh toán: GradStudio">
      <p className="back-link">
        <Link to="/lich-chup">‹ Lịch chụp của tôi</Link>
      </p>
      <h1 className="page-title">Kết quả thanh toán</h1>

      <DataState query={paymentQuery} isEmpty={(p) => !p} loadingLabel="Đang tải kết quả thanh toán…">
        {(payment) => (
          <DataState query={bookingQuery} isEmpty={(b) => !b} loadingLabel="Đang tải trạng thái booking…">
            {(booking) => {
              const kindLabel = payment.kind === 'deposit' ? 'Cọc 30%' : 'Thanh toán 70% còn lại';
              const isPending = payment.status === 'pending';
              const isFailed = payment.status === 'failed';
              const isRaceClash =
                payment.status === 'succeeded' && payment.kind === 'deposit' && booking.status === 'Chờ cọc 30%';
              const isHeldSuccess = payment.status === 'succeeded' && !isRaceClash;

              function handleRetryPayment() {
                if (retryAction.busy) return;
                retryAction.run(async () => {
                  const newPay = await api('/payments', {
                    method: 'POST',
                    body: { bookingId: payment.bookingId, kind: payment.kind },
                  });
                  navigate(`/thanh-toan/${newPay.id}`);
                });
              }

              return (
                <section className="panel" aria-labelledby="result-title">
                  <div className="panel-head">
                    <h2 id="result-title">
                      Giao dịch {payment.id} · {payment.bookingId}
                    </h2>
                    <StatusBadge tone={isRaceClash ? 'conflict' : BOOKING_TONE[booking.status] || 'neutral'}>
                      {isRaceClash ? 'Chờ cọc 30% · Trùng lịch' : booking.status}
                    </StatusBadge>
                  </div>

                  {isPending ? (
                    <>
                      <div className="schedule-alert is-notice" role="status">
                        <Icon name="clock" />
                        <p>
                          Giao dịch {payment.id} ({kindLabel} · {formatVND(payment.amount)}) đang chờ xác nhận trên cổng
                          thanh toán thử nghiệm.
                        </p>
                      </div>
                      <div className="payment-actions">
                        <Button variant="primary" to={`/thanh-toan/${payment.id}`}>
                          Quay lại cổng thanh toán
                        </Button>
                        <Button variant="secondary" to="/lich-chup">
                          Về lịch chụp của tôi
                        </Button>
                      </div>
                    </>
                  ) : null}

                  {isFailed ? (
                    <>
                      <div className="schedule-alert is-danger" role="alert">
                        <Icon name="alert" />
                        <div>
                          <p>
                            <strong>Thanh toán không thành công</strong>
                          </p>
                          <p>{payment.message}</p>
                        </div>
                      </div>
                      {retryAction.error ? (
                        <p className="form-error" role="alert">
                          {retryAction.error}
                        </p>
                      ) : null}
                      <div className="payment-actions">
                        <Button
                          variant="primary"
                          type="button"
                          aria-disabled={retryAction.busy ? 'true' : undefined}
                          onClick={handleRetryPayment}
                        >
                          {retryAction.busy ? 'Đang tạo giao dịch mới…' : 'Thử thanh toán lại'}
                        </Button>
                        <Button variant="secondary" to="/lich-chup">
                          Về lịch chụp của tôi
                        </Button>
                        {payment.kind === 'remainder' ? (
                          <Button variant="secondary" to={`/lich-chup/${payment.bookingId}/anh`}>
                            Quay lại trang chọn ảnh
                          </Button>
                        ) : null}
                      </div>
                    </>
                  ) : null}

                  {isRaceClash ? (
                    <>
                      <div className="schedule-alert is-danger" role="status">
                        <Icon name="alert" />
                        <div>
                          <p>
                            <strong>Đã ghi nhận tiền cọc, nhưng khung giờ đã được giữ bởi khách khác</strong>
                          </p>
                          <p>{payment.message}</p>
                        </div>
                      </div>
                      <div className="payment-actions">
                        <Button variant="primary" to="/tu-van">
                          Nhắn với studio
                        </Button>
                        <Button variant="secondary" to="/lich-chup">
                          Về lịch chụp của tôi
                        </Button>
                      </div>
                    </>
                  ) : null}

                  {isHeldSuccess ? (
                    <>
                      <div className="schedule-alert is-free" role="status">
                        <Icon name="check" />
                        <div>
                          <p>
                            <strong>Thanh toán thành công</strong>
                          </p>
                          <p>{payment.message}</p>
                        </div>
                      </div>
                      <div className="payment-actions">
                        {payment.kind === 'remainder' ? (
                          <>
                            <Button variant="primary" to={`/lich-chup/${payment.bookingId}/anh`}>
                              Quay lại để Nhận ảnh
                            </Button>
                            <Button variant="secondary" to="/lich-chup">
                              Về lịch chụp của tôi
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="primary" to="/lich-chup">
                              Về lịch chụp của tôi
                            </Button>
                            <Button variant="secondary" to={`/lich-chup/${payment.bookingId}/anh`}>
                              Trang ảnh buổi chụp
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  ) : null}

                  <dl className="deposit-list">
                    <div className="deposit-row">
                      <dt>Khoản thanh toán</dt>
                      <dd>{kindLabel}</dd>
                    </div>
                    <div className="deposit-row">
                      <dt>Số tiền</dt>
                      <dd className="gs-tnum">{formatVND(payment.amount)}</dd>
                    </div>
                    <div className="deposit-row">
                      <dt>Gói chụp</dt>
                      <dd>{booking.packageName}</dd>
                    </div>
                    <div className="deposit-row">
                      <dt>Ngày chụp</dt>
                      <dd>{vnDateLong(booking.date)}</dd>
                    </div>
                    {payment.completedAt ? (
                      <div className="deposit-row">
                        <dt>Thời gian ghi nhận</dt>
                        <dd className="gs-tnum">{formatMoment(payment.completedAt)}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              );
            }}
          </DataState>
        )}
      </DataState>
    </CustomerLayout>
  );
}
