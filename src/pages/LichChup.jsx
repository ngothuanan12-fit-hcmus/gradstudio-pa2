import CustomerLayout from '../layouts/CustomerLayout.jsx';
import BookingSummary from '../components/BookingSummary.jsx';
import DepositCard from '../components/DepositCard.jsx';
import WeekCalendar from '../components/WeekCalendar.jsx';
import { booking, weekDays } from '../data.js';
import '../styles/schedule.css';

// The page opens in the brief's one state: GS-1024 is agreed for 14:00 and is
// waiting for the 30% deposit. No tab, demo switch or payment simulation.
export default function LichChup() {
  return (
    <CustomerLayout current="schedule">
      <h1 className="page-title">Lịch chụp của tôi</h1>
      <p className="page-lede">
        Tuần chụp, thông tin GS-1024 và tiền cọc cho buổi chụp ngày 24/10/2026.
      </p>
      <p className="status-line" role="status">
        GS-1024 đã thống nhất 14:00 ngày 24/10/2026, đang chờ cọc 30%. Lịch chỉ được giữ
        sau khi cọc thành công.
      </p>

      <div className="schedule-layout">
        <div className="schedule-main">
          <WeekCalendar days={weekDays} today="2026-10-24" />
          <BookingSummary booking={booking} />
        </div>
        <aside className="schedule-side" aria-label="Thanh toán">
          <DepositCard booking={booking} />
        </aside>
      </div>
    </CustomerLayout>
  );
}
