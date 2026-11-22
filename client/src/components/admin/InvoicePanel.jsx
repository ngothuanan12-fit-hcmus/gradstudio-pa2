import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/client.js';
import useAction from '../../forms/useAction.js';
import useApi from '../../hooks/useApi.js';
import { formatMoment, vnDate } from '../../utils/moment.js';
import { formatVND } from '../../utils/money.js';
import { formatInvoiceMessage } from '../../utils/pricing.js';
import { BOOKING_TONE } from '../../utils/status.js';
import Button from '../Button.jsx';
import DataState from '../DataState.jsx';
import Icon from '../Icon.jsx';
import StatusBadge from '../StatusBadge.jsx';

const PAY_STATUS_VI = {
  succeeded: 'Thành công',
  failed: 'Chưa thành công',
  pending: 'Đang chờ',
};

function EmptyInvoiceView({ customerName }) {
  return (
    <div className="inspector-body">
      <div className="inspector-head">
        <div>
          <h2>Chi tiết đơn hàng &amp; Thanh toán</h2>
          <p className="inspector-sub">{customerName}</p>
        </div>
        <StatusBadge tone="done">Hoàn thành</StatusBadge>
      </div>

      <div className="inspector-section">
        <h3 className="inspector-label">Thông tin booking</h3>
        <div className="empty-dashed-box">
          <strong>Chưa có hồ sơ booking cho {customerName}</strong>
          <p>
            Dữ liệu mã đơn, lịch chụp và nhân sự sẽ hiển thị tại đây khi hội thoại được gắn với một booking trong hệ
            thống.
          </p>
        </div>
      </div>

      <div className="inspector-section">
        <div className="inspector-subhead">
          <h3 className="inspector-label">Chi tiết thanh toán</h3>
          <StatusBadge tone="neutral">Chưa có dữ liệu thanh toán</StatusBadge>
        </div>
        <div className="empty-dashed-box">
          <strong>Chưa có dữ liệu thanh toán</strong>
          <p>
            Trạng thái hội thoại Hoàn thành không tự xác nhận đã thanh toán đủ. Dữ liệu cọc và công nợ chỉ hiển thị khi
            có chứng từ thực tế.
          </p>
        </div>
      </div>

      <div className="inspector-section">
        <h3 className="inspector-label">Lịch sử thanh toán</h3>
        <p className="field-hint">Chưa ghi nhận giao dịch thanh toán trong hệ thống.</p>
      </div>

      <div className="inspector-grid-2">
        <Button variant="secondary" disabled aria-describedby="invoice-empty-note">
          Xem hóa đơn
        </Button>
        <Button variant="secondary" disabled aria-describedby="invoice-empty-note">
          Gửi hóa đơn cho khách
        </Button>
      </div>
      <p id="invoice-empty-note" className="field-hint">
        Chưa có dữ liệu đơn hàng gắn với hội thoại này để xem hoặc gửi hóa đơn.
      </p>
    </div>
  );
}

// Handles "Hoàn thành": booking summary + payment breakdown + transaction list + invoice preview & send to chat.
export default function InvoicePanel({ conv, bookingQuery, onConversationUpdated }) {
  const paymentsQuery = useApi(conv.bookingId ? `/payments?bookingId=${conv.bookingId}` : null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sentDone, setSentDone] = useState('');
  const sendInvoice = useAction();

  if (!conv.bookingId) {
    return <EmptyInvoiceView customerName={conv.customer.name} />;
  }

  const matchedBookingQuery =
    bookingQuery.data && bookingQuery.data.id !== conv.bookingId ? { ...bookingQuery, data: null } : bookingQuery;

  return (
    <DataState
      query={matchedBookingQuery}
      isEmpty={(b) => !b}
      emptyText="Không tìm thấy hồ sơ booking cho hội thoại này."
      loadingLabel="Đang tải chi tiết đơn hàng…"
    >
      {(booking) => {
        const paymentList = paymentsQuery.data || [];
        const succeededSum = paymentList.filter((p) => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0);

        // If payments list is empty (e.g. MOCK_MODE=empty), fall back strictly to booking.payment flags without inventing extras.
        const paidTotal = paymentList.length
          ? succeededSum
          : (booking.payment?.depositStatus === 'paid' ? booking.pricing.deposit : 0) +
            (booking.payment?.remainderStatus === 'paid' ? booking.pricing.remainder : 0);

        const remaining = Math.max(0, booking.pricing.total - paidTotal);
        const isFullyPaid = booking.payment?.depositStatus === 'paid' && booking.payment?.remainderStatus === 'paid';
        const isPartial = booking.payment?.depositStatus === 'paid' && !isFullyPaid;

        const isClashedPaidDeposit = booking.status === 'Chờ cọc 30%' && booking.payment?.depositStatus === 'paid';
        const payTone = isClashedPaidDeposit
          ? 'conflict'
          : isFullyPaid
            ? 'confirmed'
            : isPartial
              ? 'pending'
              : 'neutral';
        const payLabel = isClashedPaidDeposit
          ? 'Đã nhận cọc (trùng lịch)'
          : isFullyPaid
            ? 'Đã thanh toán đủ'
            : isPartial
              ? 'Thanh toán một phần'
              : 'Chưa thanh toán';

        function handleSendInvoice() {
          setSentDone('');
          sendInvoice.run(async () => {
            const text = formatInvoiceMessage(booking, paidTotal);
            const updated = await api(`/conversations/${conv.id}/messages`, {
              method: 'POST',
              body: { text },
            });
            onConversationUpdated(updated);
            setSentDone(`Đã gửi thông tin hóa đơn ${booking.id} vào hội thoại.`);
          });
        }

        return (
          <div className="inspector-body">
            <div className="inspector-head">
              <div>
                <h2>Chi tiết đơn hàng &amp; Thanh toán</h2>
                <p className="inspector-sub">
                  {booking.id} · {booking.customer.name}
                </p>
              </div>
              <StatusBadge tone={BOOKING_TONE[booking.status] || 'done'}>{booking.status}</StatusBadge>
            </div>

            <div className="inspector-section">
              <h3 className="inspector-label">Thông tin booking</h3>
              <dl className="detail-kv">
                <div>
                  <dt>Mã đơn</dt>
                  <dd>{booking.id}</dd>
                </div>
                <div>
                  <dt>Gói chụp</dt>
                  <dd>{booking.packageName}</dd>
                </div>
                <div>
                  <dt>Ngày chụp</dt>
                  <dd>{vnDate(booking.date)}</dd>
                </div>
                <div>
                  <dt>Makeup</dt>
                  <dd>
                    {booking.makeup
                      ? `${booking.makeup.from}–${booking.makeup.to} · ${booking.makeup.staffName}`
                      : 'Không'}
                  </dd>
                </div>
                <div>
                  <dt>Chụp</dt>
                  <dd>
                    {booking.shoot.from}–{booking.shoot.to} · {booking.shoot.staffName} · {booking.shoot.roomName}
                  </dd>
                </div>
                {booking.fileLink ? (
                  <div>
                    <dt>File ảnh</dt>
                    <dd>
                      <a href={booking.fileLink} target="_blank" rel="noreferrer">
                        {booking.fileLink}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="inspector-section">
              <div className="inspector-subhead">
                <h3 className="inspector-label">Chi tiết thanh toán</h3>
                <StatusBadge tone={payTone}>{payLabel}</StatusBadge>
              </div>
              <div className="price-summary-box">
                <dl className="price-summary-list">
                  <div className="price-summary-row">
                    <dt>Giá gói</dt>
                    <dd>{formatVND(booking.pricing.total)}</dd>
                  </div>
                  <div className="price-summary-row">
                    <dt>Tiền cọc (30%)</dt>
                    <dd>{formatVND(booking.pricing.deposit)}</dd>
                  </div>
                  <div className="price-summary-row">
                    <dt>Tổng đã thanh toán</dt>
                    <dd>{formatVND(paidTotal)}</dd>
                  </div>
                  <div className="price-summary-row is-sep is-remainder">
                    <dt>Số dư còn lại</dt>
                    <dd className={remaining === 0 ? 'price-free' : 'price-accent'}>{formatVND(remaining)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="inspector-section">
              <h3 className="inspector-label">Lịch sử thanh toán</h3>
              <DataState
                query={paymentsQuery}
                emptyText="Chưa ghi nhận giao dịch thanh toán trong hệ thống."
                loadingLabel="Đang tải lịch sử thanh toán…"
              >
                {(items) => (
                  <ul className="payment-history">
                    {items.map((pay) => (
                      <li key={pay.id} className="payment-row">
                        <div className="payment-row-top">
                          <strong>{pay.kind === 'deposit' ? 'Cọc 30%' : 'Phần còn lại 70%'}</strong>
                          <span className="payment-amount">{formatVND(pay.amount)}</span>
                        </div>
                        <div className="payment-row-meta">
                          <span>{PAY_STATUS_VI[pay.status] || pay.status}</span>
                          <time dateTime={pay.completedAt || pay.createdAt}>
                            {formatMoment(pay.completedAt || pay.createdAt)}
                          </time>
                        </div>
                        {pay.message ? <p className="payment-row-note">{pay.message}</p> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </DataState>
            </div>

            {sendInvoice.error ? (
              <p className="form-error" role="alert">
                {sendInvoice.error}
              </p>
            ) : null}
            {sentDone ? (
              <p className="form-done" role="status">
                {sentDone}
              </p>
            ) : null}

            <div className="inspector-grid-2">
              <Button variant="secondary" onClick={() => setPreviewOpen((v) => !v)}>
                {previewOpen ? 'Ẩn hóa đơn' : 'Xem hóa đơn'}
              </Button>
              <Button
                variant="primary"
                aria-disabled={sendInvoice.busy ? 'true' : undefined}
                onClick={handleSendInvoice}
              >
                {sendInvoice.busy ? 'Đang gửi…' : 'Gửi hóa đơn cho khách'}
              </Button>
            </div>
            <Link className="btn btn-secondary" to={`/quan-ly/booking/${booking.id}`}>
              Quản lý booking {booking.id}
            </Link>

            {previewOpen ? (
              <div className="invoice-preview" role="region" aria-label={`Bản xem hóa đơn ${booking.id}`}>
                <div className="invoice-preview-head">
                  <strong>Hóa đơn GradStudio · {booking.id}</strong>
                  <span>{vnDate(booking.date)}</span>
                </div>
                <p>Khách hàng: {booking.customer.name}</p>
                <p>Gói: {booking.packageName}</p>
                <ul className="invoice-items">
                  {booking.pricing.items.map((it) => (
                    <li key={it.label}>
                      <span>{it.label}</span>
                      <span>{it.included ? '0đ' : typeof it.amount === 'number' ? formatVND(it.amount) : '—'}</span>
                    </li>
                  ))}
                </ul>
                <p className="invoice-total">
                  <span>Tổng đã thanh toán / Còn lại</span>
                  <strong>
                    {formatVND(paidTotal)} / {formatVND(remaining)}
                  </strong>
                </p>
                {booking.fileLink ? (
                  <p className="invoice-link">
                    <Icon name="check" /> File hoàn thiện:{' '}
                    <a href={booking.fileLink} target="_blank" rel="noreferrer">
                      {booking.fileLink}
                    </a>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      }}
    </DataState>
  );
}
