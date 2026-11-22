import { useState } from 'react';
import { Link } from 'react-router';
import BookingSummary from '../components/BookingSummary.jsx';
import DataState from '../components/DataState.jsx';
import DepositCard from '../components/DepositCard.jsx';
import ReminderList from '../components/ReminderList.jsx';
import WeekCalendar from '../components/WeekCalendar.jsx';
import useApi from '../hooks/useApi.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import { vnDateLong } from '../utils/date.js';
import '../styles/schedule.css';

function buildStatusSummary(booking) {
  const isRaceClash = booking.status === 'Chờ cọc 30%' && booking.payment?.depositStatus === 'paid';
  if (isRaceClash) {
    return `${booking.id} đã ghi nhận tiền cọc 30%, nhưng khung giờ đã có khách khác giữ trước. Lịch chưa được giữ; hãy nhắn với studio để đổi giờ.`;
  }
  if (booking.status === 'Chờ cọc 30%') {
    return `${booking.id} đã thống nhất ${booking.shoot.from} ngày ${vnDateLong(booking.date)}, đang chờ cọc 30%. Lịch chỉ được giữ sau khi cọc thành công.`;
  }
  if (booking.status === 'Đã đặt lịch') {
    const remNote =
      booking.payment?.remainderStatus === 'paid'
        ? 'Đã thanh toán đủ 100%, sẵn sàng Nhận ảnh.'
        : 'Chọn ảnh và thanh toán 70% còn lại sau buổi chụp.';
    return `${booking.id} đã đặt lịch ngày ${vnDateLong(booking.date)} (${booking.shoot.from}–${booking.shoot.to}). ${remNote}`;
  }
  if (booking.status === 'Hoàn thành') {
    return `${booking.id} đã hoàn thành. Bạn có thể mở lại link ảnh hoàn chỉnh bất cứ lúc nào.`;
  }
  return `${booking.id} đã hủy. Nhân sự và phòng chụp đã được giải phóng.`;
}

// Step G7 (docs/api/05-bookings.md, 06-payments.md, 07-reminders.md): customer's bookings, calendar, reminders, and deposit flow.
export default function LichChup() {
  const bookingsQuery = useApi('/bookings');
  const remindersQuery = useApi('/reminders');
  const paymentsQuery = useApi('/payments');
  const [selectedId, setSelectedId] = useState(null);

  return (
    <CustomerLayout title="Lịch chụp của tôi: GradStudio">
      <h1 className="page-title">Lịch chụp của tôi</h1>

      <DataState
        query={bookingsQuery}
        emptyText={
          <>
            Bạn chưa có buổi chụp nào. Hãy mở <Link to="/tu-van">Hội thoại với studio</Link> để tư vấn và đặt lịch.
          </>
        }
        loadingLabel="Đang tải lịch chụp…"
      >
        {(list) => {
          const booking = list.find((b) => b.id === selectedId) || list[0];
          return (
            <>
              {list.length > 1 ? (
                <div className="booking-switcher" role="group" aria-label="Chọn buổi chụp của bạn">
                  {list.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="booking-switch-btn"
                      aria-pressed={item.id === booking.id}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <span>{item.id}</span>
                      <span className="booking-switch-meta">
                        {vnDateLong(item.date)} · {item.status}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              <p className="status-line" role="status">
                {buildStatusSummary(booking)}
              </p>

              {/* .schedule-main sits first in DOM and left at >=1280px so Tab order matches visual order at 360, 768, 1280px. */}
              <div className="schedule-layout">
                <div className="schedule-main">
                  <WeekCalendar booking={booking} />
                  <ReminderList booking={booking} remindersQuery={remindersQuery} />
                </div>
                <div className="schedule-side">
                  <BookingSummary booking={booking} />
                  <DepositCard booking={booking} paymentsQuery={paymentsQuery} />
                </div>
              </div>
            </>
          );
        }}
      </DataState>
    </CustomerLayout>
  );
}
