import { defaultPackageTitle } from '../data.js';
import {
  candidateHours,
  formatDateDisplay,
  formatTimeMinutes,
  getDayOfWeek,
  getResourceName,
} from '../utils/scheduling.js';
import { StatusBadge } from './ChatStream.jsx';

export function FormField({ label, children, helper, className = '' }) {
  return (
    <div className={`st-form-field ${className}`}>
      <span className="st-form-label">{label}</span>
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
  isSubmitting,
  onSendQuote,
  onCreateBooking,
  onCancelBooking,
  formRef,
  onClose,
}) {
  const isLocked = isBookingCreated || isSubmitting;
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
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
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
          <p className="st-kicker">Booking mới</p>
          <h2 className="st-card-title">Chụp ảnh tốt nghiệp</h2>
        </div>
        <div className="st-booking-head-right">
          {isBookingCreated ? (
            <div className="st-booking-code-wrap">
              <span className="st-booking-code">#GS-1024</span>
              <StatusBadge tone="pending">Chờ thanh toán cọc 30%</StatusBadge>
            </div>
          ) : null}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng form booking"
              className="st-close-btn"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {isBookingCreated ? (
        <p className="st-booking-created-note">
          Đã gửi tới Lịch chụp của Linh. Khách đã chốt lịch trong chat — lịch được giữ chính thức khi khách thanh toán cọc 30%.
        </p>
      ) : null}

      <div className="st-booking-grid">
        <FormField label="Khách hàng">
          <div className="st-field-readonly st-field-split">
            <span className="st-field-strong">Nguyễn Thùy Linh</span>
            <span className="st-field-muted">0901 234 567</span>
          </div>
        </FormField>

        <FormField label="Loại buổi chụp">
          <select name="shoot-type" disabled={isLocked} defaultValue="ca-nhan" aria-label="Loại buổi chụp" className="st-select">
            <option value="ca-nhan">Tốt nghiệp cá nhân</option>
            <option value="nhom">Tốt nghiệp nhóm</option>
          </select>
        </FormField>

        <FormField label="Gói" className="is-span-2">
          <select name="package-id" disabled={isLocked} defaultValue="premium" aria-label="Gói chụp" className="st-select">
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
          helper={
            <span className={currentValidation.ok ? 'st-helper-status is-ok' : 'st-helper-status is-conflict'}>
              <span className="st-helper-dot" />
              {currentValidation.ok
                ? 'Đủ thợ chụp, thợ makeup và phòng'
                : isMaiConflict
                ? 'Trùng lịch: thợ makeup Mai đang bận'
                : 'Trùng lịch tài nguyên'}
            </span>
          }
        >
          <select
            name="start-time"
            disabled={isLocked}
            value={startTime}
            aria-label="Giờ bắt đầu chụp"
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

        <FormField label="Giá chốt" helper="Giá tham khảo: từ 1.800.000đ">
          <input
            type="text"
            name="final-price"
            value={price}
            disabled={isLocked}
            aria-label="Giá chốt"
            onChange={(e) => onPriceChange(e.target.value)}
            className="st-input"
          />
        </FormField>

        <FormField label="Phân công dự kiến">
          <div className="st-allocation-row">
            {hasMakeup ? (
              <span className="st-alloc-item">
                <span className={validation.makeupArtist ? 'st-alloc-dot is-ok' : 'st-alloc-dot is-conflict'} />
                Makeup: <strong>Mai</strong>
              </span>
            ) : null}
            <span className="st-alloc-item">
              <span className={validation.photographer ? 'st-alloc-dot is-ok' : 'st-alloc-dot is-conflict'} />
              Thợ chụp: <strong>{getResourceName(validation.photographer)}</strong>
            </span>
            <span className="st-alloc-item">
              <span className={validation.room ? 'st-alloc-dot is-ok' : 'st-alloc-dot is-conflict'} />
              Phòng: <strong>{validation.room ? getResourceName(validation.room) : '—'}</strong>
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
              Hủy
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
            <button
              type="button"
              onClick={onSendQuote}
              className="st-btn-outline"
            >
              Gửi báo giá vào chat
            </button>

            <span className="st-tooltip-wrap">
              <button
                type="button"
                disabled={!validation.ok || isSubmitting || !isAgreed}
                onClick={onCreateBooking}
                className="st-btn-filled"
              >
                {isSubmitting ? <span className="st-spinner" /> : 'Tạo booking'}
              </button>
              {!validation.ok ? (
                <span className="st-btn-tooltip">Còn trùng lịch tài nguyên</span>
              ) : null}
            </span>
          </>
        )}
      </div>
    </section>
  );
}
