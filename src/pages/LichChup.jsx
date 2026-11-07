import { useState } from 'react';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import BookingSummary from '../components/BookingSummary.jsx';
import DepositCard from '../components/DepositCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import WeekCalendar from '../components/WeekCalendar.jsx';
import { booking, weekDays } from '../data.js';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ cọc' },
  { id: 'confirmed', label: 'Đã đặt lịch' },
  { id: 'done', label: 'Hoàn thành' },
];

export default function LichChup() {
  const [paid, setPaid] = useState(false);
  const [tab, setTab] = useState('all');
  const [status, setStatus] = useState('Booking GS-1024 đang chờ cọc 30%.');

  const currentStatus = paid ? 'confirmed' : 'pending';
  const statusLabel = paid ? 'Đã đặt lịch' : 'Chờ cọc';
  const counts = {
    all: 1,
    pending: paid ? 0 : 1,
    confirmed: paid ? 1 : 0,
    done: 0,
  };
  const showBooking = tab === 'all' || tab === currentStatus;

  function moveTab(event, index) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = TABS.length - 1;
    setTab(TABS[next].id);
    document.getElementById(`booking-tab-${TABS[next].id}`)?.focus();
  }

  function handlePaid() {
    setPaid(true);
    setTab('confirmed');
    setStatus('Đã ghi nhận cọc mô phỏng. Booking GS-1024 chuyển sang Đã đặt lịch, hẹn 13:00 ngày 24/10/2026.');
  }

  return (
    <CustomerLayout current="schedule">
      <h1 className="page-title">Lịch chụp của tôi</h1>
      <p className="page-lede">
        Lịch tuần, thông tin booking và tiền cọc cho buổi chụp ngày 24/10/2026.
      </p>
      <p className="status-line" role="status">{status}</p>

      <div className="tabs" role="tablist" aria-label="Lọc lịch chụp">
        {TABS.map((item, index) => (
          <button
            key={item.id}
            id={`booking-tab-${item.id}`}
            type="button"
            role="tab"
            className="tab"
            aria-selected={tab === item.id}
            aria-controls="booking-panel"
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            onKeyDown={(event) => moveTab(event, index)}
          >
            {item.label}
            <span className="tab-count">
              {counts[item.id]}
              <span className="sr-only"> lịch</span>
            </span>
          </button>
        ))}
      </div>

      <div id="booking-panel" role="tabpanel" aria-labelledby={`booking-tab-${tab}`}>
        {showBooking ? (
          <div className="schedule-layout">
            <div className="schedule-main">
              <WeekCalendar
                title="19 – 25/10/2026"
                days={weekDays}
                initialSelected="2026-10-24"
              />
              <BookingSummary
                booking={booking}
                title="Buổi chụp GS-1024"
                time={`${booking.makeup.from}–${booking.shoot.to}`}
                note={paid ? 'Đã đặt lịch · hẹn 13:00' : 'Đang chờ cọc 30%'}
                badge={<StatusBadge tone={currentStatus}>{statusLabel}</StatusBadge>}
              />
            </div>

            <aside className="schedule-side">
              <DepositCard booking={booking} paid={paid} onPaid={handlePaid} />

              <section className="panel map-panel" aria-labelledby="map-title">
                <h2 id="map-title">Đường đến studio</h2>
                <figure className="map-figure">
                  <svg viewBox="0 0 320 180" role="img" aria-label="Bản đồ minh họa vị trí GradStudio tại Phòng B">
                    <path className="map-road" d="M0 112H320M126 0V180" />
                    <rect className="map-block" x="16" y="20" width="82" height="62" rx="4" />
                    <rect className="map-block" x="152" y="16" width="142" height="66" rx="4" />
                    <rect className="map-block" x="16" y="138" width="86" height="30" rx="4" />
                    <rect className="map-block map-studio" x="196" y="128" width="108" height="40" rx="4" />
                    <circle className="map-marker" cx="250" cy="148" r="6" />
                    <text className="map-label" x="152" y="104">GradStudio · Phòng B</text>
                  </svg>
                  <figcaption>Bản đồ minh họa, chưa phải chỉ đường thật.</figcaption>
                </figure>
                <a
                  className="btn btn-secondary"
                  href="https://www.google.com/maps/search/?api=1&query=GradStudio"
                  target="_blank"
                  rel="noreferrer"
                >
                  Xem đường đi
                </a>
              </section>
            </aside>
          </div>
        ) : (
          <p className="empty">Chưa có lịch chụp nào ở trạng thái này.</p>
        )}
      </div>
    </CustomerLayout>
  );
}