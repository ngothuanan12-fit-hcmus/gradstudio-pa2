import { useState } from 'react';
import { Link } from 'react-router';
import DataState from '../components/DataState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TextField from '../components/TextField.jsx';
import Select from '../components/ui/Select.jsx';
import useApi from '../hooks/useApi.js';
import AdminLayout from '../layouts/AdminLayout.jsx';
import { vnWeekdayAndDate } from '../utils/date.js';
import { formatVND } from '../utils/money.js';
import { BOOKING_TONE } from '../utils/status.js';
import '../styles/admin.css';
import '../styles/admin-pages.css';

const BOOKING_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Chờ cọc 30%', label: 'Chờ cọc 30%' },
  { id: 'Đã đặt lịch', label: 'Đã đặt lịch' },
  { id: 'Hoàn thành', label: 'Hoàn thành' },
  { id: 'Đã hủy', label: 'Đã hủy' },
];

const PAYMENT_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Chưa cọc', label: 'Chưa cọc' },
  { value: 'Đã cọc · Chờ 70%', label: 'Đã cọc · Chờ 70%' },
  { value: 'Đã thanh toán đủ', label: 'Đã thanh toán đủ' },
  { value: 'Cọc trùng lịch chờ xử lý', label: 'Cọc trùng lịch chờ xử lý' },
];

function getPaymentBadge(booking) {
  if (booking.status === 'Chờ cọc 30%' && booking.payment?.depositStatus === 'paid') {
    return { label: 'Cọc trùng lịch chờ xử lý', tone: 'conflict' };
  }
  if (booking.payment?.depositStatus !== 'paid') {
    return { label: 'Chưa cọc', tone: 'neutral' };
  }
  if (booking.payment?.remainderStatus === 'paid') {
    return { label: 'Đã thanh toán đủ', tone: 'confirmed' };
  }
  return { label: 'Đã cọc · Chờ 70%', tone: 'pending' };
}

// Step G10 (docs/api/05-bookings.md): Admin booking list with live status, payment, and search filters.
export default function QuanLyBookings() {
  const bookingsQuery = useApi('/bookings');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');

  return (
    <AdminLayout title="Quản lý booking: GradStudio">
      <h1 className="page-title">Quản lý booking</h1>

      <DataState query={bookingsQuery} emptyText="Chưa có booking nào." loadingLabel="Đang tải danh sách booking…">
        {(list) => {
          const kw = search.trim().toLowerCase();
          const visible = list.filter((b) => {
            if (statusFilter !== 'all' && b.status !== statusFilter) return false;
            const pay = getPaymentBadge(b);
            if (paymentFilter !== 'all' && pay.label !== paymentFilter) return false;
            if (kw && !b.id.toLowerCase().includes(kw) && !b.customer.name.toLowerCase().includes(kw)) {
              return false;
            }
            return true;
          });

          return (
            <div className="bookings-page">
              <div className="panel bookings-toolbar">
                <div className="bookings-toolbar-inputs">
                  <TextField
                    id="bookings-search"
                    type="search"
                    label="Tìm theo mã booking hoặc tên khách"
                    placeholder="Ví dụ: GS-1024 hoặc Nguyễn Thùy Linh"
                    autoComplete="off"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Select
                    id="bookings-payment-filter"
                    label="Trạng thái thanh toán"
                    value={paymentFilter}
                    options={PAYMENT_OPTIONS}
                    onChange={setPaymentFilter}
                  />
                </div>

                <div className="bookings-filter-row">
                  <p className="field-label" id="bookings-status-label">
                    Trạng thái booking
                  </p>
                  <div className="filter-group" role="group" aria-labelledby="bookings-status-label">
                    {BOOKING_FILTERS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className="filter-pill"
                        aria-pressed={statusFilter === opt.id}
                        onClick={() => setStatusFilter(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {visible.length ? (
                <ul className="bookings-grid">
                  {visible.map((b) => {
                    const pay = getPaymentBadge(b);
                    return (
                      <li key={b.id} className="panel booking-card">
                        <div className="panel-head">
                          <div>
                            <h2 className="job-title">
                              {b.id} · {b.customer.name}
                            </h2>
                            <p className="meta-line">
                              {b.packageName} · {b.sessionType} · {b.people} người
                            </p>
                          </div>
                          <div className="badge-pair">
                            <StatusBadge tone={BOOKING_TONE[b.status] || 'neutral'}>{b.status}</StatusBadge>
                            <StatusBadge tone={pay.tone}>{pay.label}</StatusBadge>
                          </div>
                        </div>

                        <dl className="detail-grid">
                          <div className="detail-row">
                            <dt>Ngày &amp; lịch</dt>
                            <dd>
                              {vnWeekdayAndDate(b.date)} ·{' '}
                              {b.makeup ? `Makeup ${b.makeup.from}–${b.makeup.to} (${b.makeup.staffName}) · ` : ''}
                              <span className="gs-tnum">
                                Chụp {b.shoot.from}–{b.shoot.to}
                              </span>{' '}
                              ({b.shoot.staffName} · {b.shoot.roomName})
                            </dd>
                          </div>
                          <div className="detail-row">
                            <dt>Chi phí</dt>
                            <dd className="gs-tnum">
                              Tổng {formatVND(b.pricing.total)} · Cọc {formatVND(b.pricing.deposit)} · Còn{' '}
                              {formatVND(b.pricing.remainder)}
                            </dd>
                          </div>
                          <div className="detail-row">
                            <dt>Link ảnh hoàn chỉnh</dt>
                            <dd>
                              {b.fileLink
                                ? 'Đã gắn link ảnh'
                                : b.status === 'Đã đặt lịch'
                                  ? 'Chưa gắn link ảnh'
                                  : 'Chưa áp dụng'}
                            </dd>
                          </div>
                        </dl>

                        <div className="booking-card-actions">
                          <Link className="btn btn-secondary" to={`/quan-ly/booking/${b.id}`}>
                            Chi tiết &amp; quản lý
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState>Không có booking khớp bộ lọc hiện tại.</EmptyState>
              )}
            </div>
          );
        }}
      </DataState>
    </AdminLayout>
  );
}
