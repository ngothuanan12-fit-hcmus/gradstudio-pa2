import { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import BookingForm from '../components/BookingForm.jsx';
import ChatPanel from '../components/ChatPanel.jsx';
import ConversationList from '../components/ConversationList.jsx';
import ResourceSchedule from '../components/ResourceSchedule.jsx';
import {
  booking,
  bookingAddons,
  conversations,
  freeSlots,
  messages,
  services,
  scheduleRows,
} from '../data.js';
import '../styles/admin.css';

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'new', label: 'Chưa trả lời' },
  { id: 'advising', label: 'Đang tư vấn' },
  { id: 'agreed', label: 'Đã chốt lịch' },
  { id: 'done', label: 'Hoàn thành' },
];

// The page opens in the state the brief asks for: Linh has agreed to 14:00,
// with a visible note that 09:00 clashed because Mai is busy 08:00–12:00.
export default function QuanLy() {
  const [activeId, setActiveId] = useState('linh');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [start, setStart] = useState(booking.agreed);

  const conflict = start !== booking.agreed;
  const picked = conflict ? null : freeSlots[0].id;
  const active = conversations.find((item) => item.id === activeId) || conversations[0];
  const status = conflict
    ? '09:00 trùng lịch: Mai (makeup) bận 08:00–12:00. Chọn 14:00 để tạo booking.'
    : `GS-1024: Giờ 09:00 Linh hỏi ban đầu bị trùng vì Mai (makeup) bận 08:00–12:00. Linh đã chốt ${booking.agreed} ngày ${booking.date} — tạo booking để mở lịch chụp của khách.`;

  const visibleConversations = conversations.filter((item) => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const keyword = query.trim().toLowerCase();
    const matchesQuery = !keyword
      || item.name.toLowerCase().includes(keyword)
      || item.last.toLowerCase().includes(keyword);
    return matchesFilter && matchesQuery;
  });

  function countForFilter(filterId) {
    if (filterId === 'all') return conversations.length;
    return conversations.filter((item) => item.status === filterId).length;
  }

  function handleResetFilters() {
    setQuery('');
    setFilter('all');
  }

  return (
    <AdminLayout>
      <h1 className="page-title">Quản lý booking</h1>
      <p className="page-lede">
        Admin {booking.admin} · Hội thoại khách hàng, xử lý trùng lịch 09:00 của thợ makeup Mai và tạo booking mới cho buổi chụp 14:00.
      </p>
      <p className="status-line" role="status">{status}</p>

      <div className="admin-grid">
        <section className="panel admin-convs" aria-labelledby="convs-title">
          <div className="panel-head">
            <h2 id="convs-title">Hội thoại</h2>
            <p className="meta-line">{visibleConversations.length}/{conversations.length} cuộc trò chuyện</p>
          </div>
          <div className="toolbar">
            <p className="field">
              <label className="field-label" htmlFor="conv-search">Tìm hội thoại</label>
              <input
                className="input"
                id="conv-search"
                type="search"
                value={query}
                placeholder="Tìm tên hoặc tin nhắn"
                onChange={(event) => setQuery(event.target.value)}
              />
            </p>
            <p className="field">
              <label className="field-label" htmlFor="conv-filter">Lọc trạng thái</label>
              <select
                className="input"
                id="conv-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                {FILTERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} ({countForFilter(item.id)})
                  </option>
                ))}
              </select>
            </p>
          </div>
          <ConversationList
            items={visibleConversations}
            activeId={activeId}
            onSelect={setActiveId}
            onReset={handleResetFilters}
          />
        </section>

        <div className="admin-chat">
          <ChatPanel
            id="admin-chat"
            title={`Chat với ${active.name}`}
            subtitle={`${active.statusLabel} · ${active.time}`}
            label="Tin nhắn trả lời khách"
            placeholder="Nhập tin nhắn"
            messages={activeId === 'linh' ? messages : []}
            disabled
            note="Chưa gửi được tin nhắn trong bản mẫu."
          />
        </div>

        <BookingForm
          booking={booking}
          services={services}
          addons={bookingAddons}
          conflict={conflict}
          start={start}
          onStartChange={setStart}
          slots={freeSlots}
          picked={picked}
          onPickSlot={(slot) => setStart(slot.time)}
        />

        <ResourceSchedule
          title="Lịch thợ và phòng"
          date="Thứ Bảy, 24/10/2026"
          start={start}
          rows={scheduleRows}
        />
      </div>
    </AdminLayout>
  );
}
