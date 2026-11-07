import CustomerLayout from '../layouts/CustomerLayout.jsx';
import BookingSummary from '../components/BookingSummary.jsx';
import { booking } from '../data.js';

// Placeholder for Khánh's page.
export default function LichChup() {
  return (
    <CustomerLayout current="schedule">
      <h1 className="page-title">Lịch chụp của tôi</h1>
      <BookingSummary booking={booking} />
    </CustomerLayout>
  );
}
