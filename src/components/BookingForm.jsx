import { defaultPackageTitle } from '../data.js';
import {
  candidateHours,
  formatDateDisplay,
  formatTimeMinutes,
  getDayOfWeek,
  getResourceName,
} from '../utils/scheduling.js';
import { StatusBadge } from './ChatStream.jsx';

export function FormField({ label, htmlFor, children, helper, className = '' }) {
  return (
    <div className={`st-form-field ${className}`.trim()}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="st-form-label">
          {label}
        </label>
      ) : (
        <span className="st-form-label">{label}</span>
      )}
      {children}
      {helper ? <span className="st-form-helper">{helper}</span> : null}
    </div>
  );
}

export default function BookingForm({
  isLinh,
  bookingDate,
  startTime,
  onStartTimeChange,
  hasMakeup,
  onToggleMakeup,
  hasCostume,
  onToggleCostume,
  price,
  onPriceChange,
  validation,
  initialValidation,
  isAgreed,
  isBookingCreated,
  onSendQuote,
  onCreateBooking,
  onCancelBooking,
  formRef,
  onClose,
}) {
  const isLocked = isBookingCreated;
  const currentValidation = isAgreed ? validation : initialValidation;
  const isMaiConflict = hasMakeup && !currentValidation.makeupArtist;

  if (!isLinh) {
    return (
      <section className="st-card st-booking-empty">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng form booking"
            className="st-close-btn st-close-abs"
          >
            ✕
          </button>
        ) : null}
        <p className="st-kicker">Booking</p>
        <h2 className="st-card-title">Chưa có booking</h2>
        <p className="st-card-sub">
          Trả lời khách trước, sau đó tạo booking trực tiếp từ cuộc chat này.
        </p>
      </section>
    );
  }

  return (
    <section ref={formRef} className="st-card st-booking-card">
      <div className="st-booking-head">
        <div>
          <p className="st-kicker">Booking mới từ hội thoại</p>
          <h2 className="st-card-title">Chụp ảnh tốt nghiệp</h2>
        </div>
        <div className="st-booking-head-right">
          {isBookingCreated ? (
            <div className="st-booking-code-wrap">
              <span className="st-booking-code">#GS-1024</span>
              <StatusBadge tone="pending">Chờ cọc 30%</StatusBadge>
            </div>
          ) : null}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng form booking"
              className="st-close-btn"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {isBookingCreated ? (
        <p className="st-booking-created-note">
          Đã chuyển sang Lịch chụp của Linh. Khách đã thống nhất giờ trong chat — lịch chỉ được giữ chính thức khi khách thanh toán cọc 30%.
        </p>
      ) : null}

      <div className="st-booking-grid">
        <FormField label="Khách hàng">
          <div className="st-field-readonly st-field-split">
            <span className="st-field-strong">Nguyễn Thùy Linh</span>
            <span className="st-field-muted">0901 234 567</span>
          </div>
        </FormField>

        <FormField label="Loại buổi chụp" htmlFor="booking-shoot-type">
          <select
            id="booking-shoot-type"
            name="shoot-type"
            disabled={isLocked}
            defaultValue="ca-nhan"
            className="st-select"
          >
            <option value="ca-nhan">Tốt nghiệp cá nhân</option>
            <option value="nhom">Tốt nghiệp nhóm</option>
          </select>
        </FormField>

        <FormField label="Gói chụp" htmlFor="booking-package-id" className="is-span-2">
          <select
            id="booking-package-id"
            name="package-id"
            disabled={isLocked}
            defaultValue="premium"
            className="st-select"
          >
            <option value="premium">{defaultPackageTitle}</option>
            <option value="basic">Gói Tốt nghiệp Cơ bản · 1 giờ · 15 ảnh chỉnh</option>
          </select>
        </FormField>

        <FormField label="Ngày chụp">
          <div className="st-field-readonly">
            {formatDateDisplay(bookingDate)} ({getDayOfWeek(bookingDate)})
          </div>
        </FormField>

        <FormField
          label="Giờ bắt đầu chụp"
          htmlFor="booking-start-time"
          helper={
            <span className={currentValidation.ok ? 'st-helper-status is-ok' : 'st-helper-status is-conflict'}>
              <span aria-hidden="true">{currentValidation.ok ? '✓' : '⚠'}</span>
              <span>
                {currentValidation.ok
                  ? 'Đủ thợ chụp, thợ makeup và phòng'
                  : isMaiConflict
                  ? 'Trùng lịch: thợ makeup Mai đang bận (08:00–11:00)'
                  : 'Trùng lịch tài nguyên'}
              </span>
            </span>
          }
        >
          <select
            id="booking-start-time"
            name="start-time"
            disabled={isLocked}
            value={startTime}
            aria-invalid={!currentValidation.ok}
            onChange={(e) => onStartTimeChange(Number(e.target.value))}
            className={currentValidation.ok ? 'st-select' : 'st-select is-conflict'}
          >
            {candidateHours.map((h) => (
              <option key={h} value={h}>
                {formatTimeMinutes(h)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Dịch vụ thêm" className="is-span-2">
          <div className="st-addon-group">
            <label className="st-checkbox-label">
              <input
                type="checkbox"
                name="addon-makeup"
                disabled={isLocked}
                checked={hasMakeup}
                onChange={(e) => onToggleMakeup(e.target.checked)}
                className="st-checkbox"
              />
              <span>Makeup (60 phút trước giờ chụp)</span>
            </label>

            <label className="st-checkbox-label">
              <input
                type="checkbox"
                name="addon-costume"
                disabled={isLocked}
                checked={hasCostume}
                onChange={(e) => onToggleCostume(e.target.checked)}
                className="st-checkbox"
              />
              <span>Thuê áo cử nhân</span>
            </label>
          </div>
        </FormField>

        <FormField label="Giá chốt" htmlFor="booking-final-price" helper="Giá tham khảo: từ 1.800.000đ">
          <input
            id="booking-final-price"
            type="text"
            name="final-price"
            value={price}
            disabled={isLocked}
            onChange={(e) => onPriceChange(e.target.value)}
            className="st-input"
          />
        </FormField>

        <FormField label="Phân công dự kiến">
          <div className="st-allocation-row">
            {hasMakeup ? (
              <span className="st-alloc-item">
                <span
                  aria-hidden="true"
                  className={validation.makeupArtist ? 'st-alloc-glyph is-ok' : 'st-alloc-glyph is-conflict'}
                >
                  {validation.makeupArtist ? '✓' : '⚠'}
                </span>
                <span>
                  Makeup: <strong>Mai</strong>
                </span>
              </span>
            ) : null}
            <span className="st-alloc-item">
              <span
                aria-hidden="true"
                className={validation.photographer ? 'st-alloc-glyph is-ok' : 'st-alloc-glyph is-conflict'}
              >
                {validation.photographer ? '✓' : '⚠'}
              </span>
              <span>
                Thợ chụp: <strong>{getResourceName(validation.photographer)}</strong>
              </span>
            </span>
            <span className="st-alloc-item">
              <span
                aria-hidden="true"
                className={validation.room ? 'st-alloc-glyph is-ok' : 'st-alloc-glyph is-conflict'}
              >
                {validation.room ? '✓' : '⚠'}
              </span>
              <span>
                Phòng: <strong>{validation.room ? getResourceName(validation.room) : '—'}</strong>
              </span>
            </span>
          </div>
        </FormField>
      </div>

      <div className="st-booking-actions">
        {isBookingCreated ? (
          <>
            <button
              type="button"
              onClick={() => onCancelBooking(true)}
              className="st-btn-ghost"
            >
              Hủy booking
            </button>
            <button
              type="button"
              onClick={() => onCancelBooking(false)}
              className="st-btn-outline"
            >
              Sửa booking
            </button>
            <a href="lich-chup.html" className="st-btn-filled">
              Mở Lịch chụp của Linh →
            </a>
          </>
        ) : (
          <>
            {!validation.ok ? (
              <span className="st-disabled-reason">
                ⚠ Chưa thể tạo booking vì còn trùng lịch tài nguyên.
              </span>
            ) : !isAgreed ? (
              <span className="st-disabled-reason">
                ◷ Chọn khung giờ trống bên phải và chờ khách chốt giờ trong chat.
              </span>
            ) : null}

            <button
              type="button"
              onClick={onSendQuote}
              className="st-btn-outline"
            >
              Gửi báo giá vào chat
            </button>

            <button
              type="button"
              disabled={!validation.ok || !isAgreed}
              onClick={onCreateBooking}
              className="st-btn-filled"
            >
              Tạo booking
            </button>
          </>
        )}
      </div>
    </section>
  );
}
