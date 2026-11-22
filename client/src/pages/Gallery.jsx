import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../api/client.js';
import Button from '../components/Button.jsx';
import DataState from '../components/DataState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PreviewImage from '../components/PreviewImage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import useAction from '../forms/useAction.js';
import useApi from '../hooks/useApi.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import { formatVND } from '../utils/money.js';
import { vnDate } from '../utils/moment.js';
import { BOOKING_TONE } from '../utils/status.js';
import '../styles/gallery.css';

const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

// Step G9 (docs/api/09-gallery.md): choose the photos to be edited, pay the remaining 70%, then Nhận ảnh. Each step
// says why it cannot be done yet, instead of a silent disabled button. Moving on to the payment page is a form's
// submit (CLAUDE.md, NEVER 5).
export default function Gallery() {
  const { id } = useParams();
  const navigate = useNavigate();
  const booking = useApi(`/bookings/${id}`);
  const gallery = useApi(`/bookings/${id}/previews`);
  const [picked, setPicked] = useState(null); // null: what the API has saved
  const [done, setDone] = useState('');
  const save = useAction();
  const pay = useAction();
  const receive = useAction();
  const statusLine = useRef(null);

  return (
    <CustomerLayout title={`Ảnh buổi chụp ${id}: GradStudio`}>
      <p className="back-link">
        <Link to="/lich-chup">‹ Lịch chụp của tôi</Link>
      </p>
      <h1 className="page-title">Ảnh buổi chụp {id}</h1>
      <p className="form-done" role="status">
        {done}
      </p>
      <DataState query={booking} isEmpty={() => false} loadingLabel="Đang tải booking…">
        {(b) => (
          <DataState query={gallery} isEmpty={() => false} loadingLabel="Đang tải ảnh xem trước…">
            {(g) => {
              const chosen = picked ?? g.selected;
              const dirty = picked !== null && !same(picked, g.selected);
              const booked = b.status === 'Đã đặt lịch';
              const canChoose = booked && !g.locked && g.limit !== null;
              const paid = b.payment.remainderStatus === 'paid';
              const saved = g.selected.length > 0;
              const tooMany = g.limit !== null && chosen.length > g.limit;

              const payWhy = !booked
                ? 'Booking không ở trạng thái thanh toán.'
                : paid
                  ? 'Đã thanh toán 70% còn lại.'
                  : !saved
                    ? 'Lưu lựa chọn ảnh trước khi thanh toán.'
                    : dirty
                      ? 'Lưu thay đổi lựa chọn trước khi thanh toán.'
                      : null;
              const receiveWhy =
                b.status === 'Hoàn thành'
                  ? 'Bạn đã nhận ảnh.'
                  : !booked
                    ? 'Booking không nhận ảnh được.'
                    : !paid
                      ? 'Cần thanh toán 70% còn lại trước.'
                      : !b.fileLink
                        ? 'Studio chưa gửi link ảnh.'
                        : null;

              function toggle(previewId) {
                if (!canChoose) return;
                setDone('');
                setPicked(chosen.includes(previewId) ? chosen.filter((x) => x !== previewId) : [...chosen, previewId]);
              }

              function saveChoice(event) {
                event.preventDefault();
                if (!canChoose || !dirty || tooMany || chosen.length === 0) return;
                save.run(async () => {
                  const updated = await api(`/bookings/${id}/selection`, {
                    method: 'PUT',
                    body: { previewIds: chosen },
                  });
                  gallery.setData(updated);
                  setPicked(null);
                  setDone(`Đã lưu ${updated.selected.length} ảnh để chỉnh sửa.`);
                });
              }

              function payRemainder(event) {
                event.preventDefault();
                if (payWhy) return;
                pay.run(async () => {
                  const payment = await api('/payments', {
                    method: 'POST',
                    body: { bookingId: id, kind: 'remainder' },
                  });
                  navigate(`/thanh-toan/${payment.id}`);
                });
              }

              function receivePhotos(event) {
                event.preventDefault();
                if (receiveWhy) return;
                receive.run(async () => {
                  const updated = await api(`/bookings/${id}/receive`, { method: 'POST' });
                  booking.setData(updated);
                  setDone('Đã nhận ảnh. Booking đã hoàn thành.');
                  statusLine.current?.focus();
                });
              }

              return (
                <>
                  <p className="conv-status-line" ref={statusLine} tabIndex={-1}>
                    {b.packageName}, ngày {vnDate(b.date)}. Trạng thái:{' '}
                    <StatusBadge tone={BOOKING_TONE[b.status]}>{b.status}</StatusBadge>
                  </p>

                  <section className="gallery-steps" aria-labelledby="gallery-steps-title">
                    <h2 className="section-heading" id="gallery-steps-title">
                      Các bước
                    </h2>
                    <ol className="step-list">
                      <li>
                        <p className="step-name">1. Chọn ảnh để chỉnh sửa</p>
                        <p className="step-note">
                          {g.limit === null
                            ? 'Gói này chưa có số ảnh chỉnh, studio sẽ báo lại.'
                            : g.locked
                              ? `Đã chốt ${g.selected.length} ảnh. Sau khi thanh toán 70%, lựa chọn không đổi được nữa.`
                              : `Chọn từ 1 đến ${g.limit} ảnh. Đổi được cho tới khi thanh toán 70%.`}
                        </p>
                      </li>
                      <li>
                        <p className="step-name">2. Thanh toán 70% còn lại: {formatVND(b.pricing.remainder)}</p>
                        <form className="step-form" noValidate onSubmit={payRemainder}>
                          {pay.error ? (
                            <p className="form-error" role="alert">
                              {pay.error}
                            </p>
                          ) : null}
                          <Button
                            type="submit"
                            aria-disabled={payWhy || pay.busy ? 'true' : undefined}
                            aria-describedby={payWhy ? 'pay-why' : undefined}
                          >
                            {pay.busy ? 'Đang tạo thanh toán…' : 'Thanh toán 70%'}
                          </Button>
                          {payWhy ? (
                            <span className="field-hint" id="pay-why">
                              {payWhy}
                            </span>
                          ) : null}
                        </form>
                      </li>
                      <li>
                        <p className="step-name">3. Nhận ảnh</p>
                        <form className="step-form" noValidate onSubmit={receivePhotos}>
                          {receive.error ? (
                            <p className="form-error" role="alert">
                              {receive.error}
                            </p>
                          ) : null}
                          <Button
                            type="submit"
                            aria-disabled={receiveWhy || receive.busy ? 'true' : undefined}
                            aria-describedby={receiveWhy ? 'receive-why' : undefined}
                          >
                            {receive.busy ? 'Đang xác nhận…' : 'Nhận ảnh'}
                          </Button>
                          {receiveWhy ? (
                            <span className="field-hint" id="receive-why">
                              {receiveWhy}
                            </span>
                          ) : null}
                          {b.fileLink && b.status === 'Hoàn thành' ? (
                            <a className="file-link" href={b.fileLink}>
                              Mở link ảnh đã chỉnh
                            </a>
                          ) : null}
                        </form>
                      </li>
                    </ol>
                  </section>

                  <section className="chat-block" aria-labelledby="previews-title">
                    <h2 className="section-heading" id="previews-title">
                      Ảnh xem trước
                    </h2>
                    {g.previews.length === 0 ? (
                      <EmptyState>Studio chưa tải ảnh xem trước lên.</EmptyState>
                    ) : (
                      <form className="choice-form" noValidate onSubmit={saveChoice}>
                        <p className={tooMany ? 'choice-count choice-over' : 'choice-count'} aria-live="polite">
                          Đã chọn {chosen.length}
                          {g.limit !== null ? `/${g.limit}` : ''} ảnh
                          {tooMany ? `: bỏ bớt ${chosen.length - g.limit} ảnh` : ''}
                          {dirty ? ' (chưa lưu)' : ''}
                        </p>
                        {save.error ? (
                          <p className="form-error" role="alert">
                            {save.error}
                          </p>
                        ) : null}
                        <ul className="preview-grid">
                          {g.previews.map((p, i) => (
                            <li key={p.id}>
                              <label className="preview-pick" htmlFor={`pick-${p.id}`}>
                                <PreviewImage url={p.url} alt={`Ảnh xem trước ${i + 1}`} />
                                <span className="preview-check">
                                  <input
                                    id={`pick-${p.id}`}
                                    type="checkbox"
                                    checked={chosen.includes(p.id)}
                                    disabled={!canChoose}
                                    onChange={() => toggle(p.id)}
                                  />
                                  Ảnh {i + 1}
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                        {canChoose ? (
                          <Button
                            type="submit"
                            aria-disabled={!dirty || tooMany || chosen.length === 0 || save.busy ? 'true' : undefined}
                          >
                            {save.busy ? 'Đang lưu…' : `Lưu lựa chọn (${chosen.length} ảnh)`}
                          </Button>
                        ) : null}
                      </form>
                    )}
                  </section>
                </>
              );
            }}
          </DataState>
        )}
      </DataState>
    </CustomerLayout>
  );
}
