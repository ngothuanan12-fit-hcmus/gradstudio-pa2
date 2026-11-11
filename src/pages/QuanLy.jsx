import { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import Button from '../components/Button.jsx';
import BookingForm from '../components/BookingForm.jsx';
import ChatPanel from '../components/ChatPanel.jsx';
import ConversationList from '../components/ConversationList.jsx';
import ResourceSchedule from '../components/ResourceSchedule.jsx';
import {
  booking,
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

// The page opens in the state the brief asks for: Linh has agreed to 14:00.
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
    : `GS-1024: Linh đã chốt ${booking.agreed} ngày ${booking.date}. Tạo booking để mở lịch chụp của khách.`;

  const visibleConversations = conversations.filter((item) => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const keyword = query.trim().toLowerCase();
    const matchesQuery = !keyword
      || item.name.toLowerCase().includes(keyword)
      || item.last.toLowerCase().includes(keyword);
    return matchesFilter && matchesQuery;
  });

  return (
    <AdminLayout>
      <h1 className="page-title">Quản lý booking</h1>
      <p className="page-lede">
        Admin Thảo · Hội thoại, lịch thợ makeup, thợ chụp, phòng chụp và form booking mới của studio.
      </p>
      <p className="status-line" role="status">{status}</p>

      <div className="admin-grid">
        <section className="panel admin-convs" id="hoi-thoai" aria-labelledby="convs-title">
          <h2 id="convs-title">Hội thoại</h2>
          <div className="toolbar">
            <p className="field">
              <label className="field-label" htmlFor="conv-search">Tìm hội thoại</label>
              <input
                className="input"
                id="conv-search"
                type="search"
                value={query}
                placeholder="Tên hoặc tin nhắn"
                onChange={(event) => setQuery(event.target.value)}
              />
            </p>
            <div className="field">
              <p className="field-label" id="conv-filter-label">Lọc theo trạng thái</p>
              <div className="filter-chips" role="group" aria-labelledby="conv-filter-label">
                {FILTERS.map((item) => {
                  const count = item.id === 'all' ? conversations.length : conversations.filter((c) => c.status === item.id).length;
                  return (
                    <Button
                      key={item.id}
                      variant={filter === item.id ? 'primary' : 'secondary'}
                      aria-pressed={filter === item.id}
                      onClick={() => setFilter(item.id)}
                    >
                      {item.id !== 'all' && <span className={`conv-dot conv-dot-${item.id}`} aria-hidden="true" />}
                      {item.label} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <ConversationList
            items={visibleConversations}
            activeId={activeId}
            onSelect={setActiveId}
          />
        </section>

        <div className="admin-chat">
          <ChatPanel
            id="admin-chat"
            title={`Chat với ${active.name}`}
            label="Tin nhắn"
            placeholder="Bản mẫu chưa gửi được tin nhắn"
            messages={activeId === 'linh' ? messages : []}
            disabled
            note="Chưa gửi được tin nhắn trong bản mẫu."
          />
        </div>

        <BookingForm
          booking={booking}
          services={services}
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
          rows={scheduleRows}
        />
      </div>
    </AdminLayout>
  );
}
