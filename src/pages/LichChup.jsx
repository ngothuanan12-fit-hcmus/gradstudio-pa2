import { useState } from 'react';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import BookingSummary from '../components/BookingSummary.jsx';
import Button from '../components/Button.jsx';
import DepositCard from '../components/DepositCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import WeekCalendar from '../components/WeekCalendar.jsx';
import { booking, formatVND, packages, weekDays } from '../data.js';
import '../styles/schedule.css';

const TABS = [
  { id: 'all', label: 'Tất cả (1)' },
  { id: 'pending', label: 'Chờ thanh toán cọc (1)' },
  { id: 'confirmed', label: 'Đã xác nhận (0)' },
  { id: 'done', label: 'Hoàn thành (0)' },
];

// Screen 3: Customer schedule page in its opening state after Admin Thảo creates
// booking GS-1024 for 14:00 on Saturday 24/10/2026.
export default function LichChup() {
  const [activeTab, setActiveTab] = useState('all');
  const [featuredId, setFeaturedId] = useState('tot-nghiep');

  const featuredPkg = packages.find((item) => item.id === featuredId) || packages[1];
  const { name, small, large, width, height } = featuredPkg.photo;
  const showBooking = activeTab === 'all' || activeTab === 'pending';

  return (
    <CustomerLayout current="schedule">
      <div className="schedule-header">
        <div>
          <h1 className="page-title">Lịch chụp của tôi</h1>
          <p className="page-lede">
            Khách hàng {booking.customer} · Mã đặt lịch {booking.id} · {booking.dayOfWeek}, {booking.date}.
          </p>
        </div>
        <StatusBadge tone="pending">Đã thống nhất lịch · Chờ cọc 30%</StatusBadge>
      </div>

      <p className="status-line" role="status">
        Booking {booking.id}: Giờ {booking.requested} bạn hỏi ban đầu bị trùng vì {booking.makeup.who} (makeup) bận 08:00–12:00. Bạn và studio đã thống nhất makeup {booking.makeup.from}–{booking.makeup.to}, chụp {booking.shoot.from}–{booking.shoot.to} tại {booking.shoot.room} — lịch chỉ được giữ chính thức sau khi đặt cọc 30% ({formatVND(booking.deposit)}) thành công.
      </p>

      <section className="panel schedule-showcase" aria-labelledby="showcase-title">
        <div className="panel-head">
          <div>
            <h2 id="showcase-title">Bộ sưu tập gói chụp GradStudio</h2>
            <p className="meta-line">
              Gói đang đặt trên {booking.id}: <b>{booking.pkg}</b> ({booking.pkgDetail} · {formatVND(booking.price)})
            </p>
          </div>
          <div className="showcase-tabs" role="group" aria-label="Xem ảnh minh họa các gói chụp">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                className="btn btn-secondary"
                aria-pressed={pkg.id === featuredPkg.id}
                onClick={() => setFeaturedId(pkg.id)}
              >
                {pkg.name}
                {pkg.id === 'tot-nghiep' ? ' · Đang đặt' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="showcase-body">
          <img
            className="showcase-photo"
            src={`./photos/${name}-${small}.webp`}
            srcSet={`./photos/${name}-${small}.webp ${small}w, ./photos/${name}-${large}.webp ${large}w`}
            sizes="(min-width: 768px) 60vw, 100vw"
            width={width}
            height={height}
            alt={featuredPkg.alt}
            loading="lazy"
          />
          <div className="showcase-info">
            <StatusBadge tone={featuredPkg.id === 'tot-nghiep' ? 'confirmed' : 'neutral'}>
              {featuredPkg.id === 'tot-nghiep' ? 'Gói của booking GS-1024' : 'Gói tham khảo tại studio'}
            </StatusBadge>
            <h3 className="showcase-pkg-title">{featuredPkg.name}</h3>
            <p className="showcase-pkg-line">{featuredPkg.line}</p>
            <p>{featuredPkg.text}</p>
            <p className="showcase-pkg-price">
              {featuredPkg.id === 'tot-nghiep'
                ? `Giá chốt GS-1024: ${formatVND(booking.price)} (cọc 30%: ${formatVND(booking.deposit)})`
                : `Giá tham khảo: từ ${formatVND(featuredPkg.price)}${featuredPkg.unit}`}
            </p>
          </div>
        </div>
      </section>

      <div className="schedule-filter-bar" role="group" aria-label="Lọc buổi chụp theo trạng thái">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="btn btn-secondary"
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!showBooking ? (
        <div className="empty schedule-filter-empty">
          <p>
            Chưa có buổi chụp ở trạng thái <b>{ activeTab === 'confirmed' ? 'Đã xác nhận' : 'Hoàn thành' }</b>. Booking {booking.id} của bạn đang chờ thanh toán cọc 30% ({formatVND(booking.deposit)}).
          </p>
          <Button variant="secondary" onClick={() => setActiveTab('all')}>
            Xem buổi chụp GS-1024 đang chờ cọc
          </Button>
        </div>
      ) : null}

      <div className="schedule-grid">
        <WeekCalendar days={weekDays} defaultDayId="2026-10-24" />
        <div className="schedule-side">
          <BookingSummary booking={booking} />
          <DepositCard booking={booking} />
          <nav className="panel schedule-links" aria-label="Điều hướng luồng bản mẫu">
            <h2 className="schedule-links-title">Đi tiếp trong bản mẫu</h2>
            <a className="btn btn-secondary" href="quan-ly.html">
              Nhân viên studio: mở lại trang quản lý
            </a>
            <a className="btn btn-secondary" href="index.html">
              Khách hàng: về trang chủ
            </a>
          </nav>
        </div>
      </div>
    </CustomerLayout>
  );
}
