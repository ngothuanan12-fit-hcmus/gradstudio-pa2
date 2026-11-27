import DataState from './DataState.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatMoment } from '../utils/moment.js';

const CHANNEL_LABEL = {
  inApp: 'Trong tài khoản',
  email: 'E-mail',
};

// Displays automatic reminders for the selected booking inside .schedule-main.
export default function ReminderList({ booking, remindersQuery }) {
  const emptyExplanation =
    booking.status === 'Chờ cọc 30%'
      ? 'Chưa có nhắc lịch vì booking chưa giữ được lịch (cần cọc 30% thành công).'
      : booking.status === 'Đã hủy'
        ? 'Booking đã hủy nên không có nhắc lịch.'
        : 'Chưa có nhắc lịch nào cho booking này.';

  return (
    <section className="panel reminders" aria-labelledby="reminders-title">
      <div className="panel-head">
        <h2 id="reminders-title">Nhắc lịch buổi chụp</h2>
      </div>
      <DataState
        query={remindersQuery}
        isEmpty={(list) => !list.some((r) => r.bookingId === booking.id)}
        emptyText={emptyExplanation}
        loadingLabel="Đang tải nhắc lịch…"
      >
        {(list) => {
          const items = list.filter((r) => r.bookingId === booking.id);
          return (
            <ul className="reminder-list">
              {items.map((r) => (
                <li key={r.id} className="reminder-item">
                  <div className="reminder-top">
                    <p className="reminder-due">
                      Thời điểm nhắc:{' '}
                      <time className="gs-tnum" dateTime={r.dueAt}>
                        {formatMoment(r.dueAt)}
                      </time>{' '}
                      <span className="meta-line">(Trước {r.hoursBefore} giờ)</span>
                    </p>
                    <StatusBadge tone={r.emailStatus === 'sent' ? 'confirmed' : 'pending'}>
                      {r.emailStatus === 'sent' ? 'Đã gửi' : 'Chờ gửi'}
                    </StatusBadge>
                  </div>
                  <p className="reminder-msg">{r.message}</p>
                  <p className="reminder-meta">
                    Kênh: {r.channels.map((ch) => CHANNEL_LABEL[ch] || ch).join(' · ')}
                    {r.emailStatus === 'sent' && r.emailSentAt
                      ? ` · Đã gửi e-mail lúc ${formatMoment(r.emailSentAt)}`
                      : ' · E-mail đang chờ đến giờ gửi'}
                  </p>
                </li>
              ))}
            </ul>
          );
        }}
      </DataState>
    </section>
  );
}
