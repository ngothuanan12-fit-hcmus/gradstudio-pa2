import { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import Button from '../components/Button.jsx';
import Icon from '../components/Icon.jsx';
import { STATUS_ICON } from '../utils/status.js';
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
  const [cardOpen, setCardOpen] = useState(true);

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
      {/* A short page top: the heading and the pinned status of GS-1024 side by side on wide screens. */}
      <div className="admin-top">
        <h1 className="page-title">Quản lý booking</h1>
        <p className="status-line" role="status">{status}</p>
      </div>

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
                      variant="secondary"
                      aria-pressed={filter === item.id}
                      onClick={() => setFilter(item.id)}
                    >
                      {item.id !== 'all' && <span className={`conv-status st-${item.id}`}><Icon name={STATUS_ICON[item.id]} /></span>}
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

        {/* The chat looks like the landing page's chat window, seen from the studio's side. */}
        <div className="admin-chat">
          <div className="chat-window-bar">
            <span className="conv-avatar" aria-hidden="true">
              {active.name.charAt(0)}
              <span className={`conv-status st-${active.status}`}><Icon name={STATUS_ICON[active.status]} /></span>
            </span>
            <div className="chat-window-who">
              <p className="chat-window-name">{active.name}</p>
              <p className="chat-window-status">{active.statusLabel}</p>
            </div>
          </div>
          <ChatPanel
            id="admin-chat"
            title={`Chat với ${active.name}`}
            label="Tin nhắn"
            placeholder="Nhập tin nhắn"
            messages={activeId === 'linh' ? messages : []}
            disabled
            note="Chưa gửi được tin nhắn trong bản mẫu."
            afterMessages={activeId === 'linh' ? (
              <BookingForm
                booking={booking}
                services={services}
                conflict={conflict}
                start={start}
                onStartChange={setStart}
                open={cardOpen}
                onToggle={() => setCardOpen(!cardOpen)}
              />
            ) : null}
          />
        </div>



        <ResourceSchedule
          title="Lịch thợ và phòng"
          date="Thứ Bảy, 24/10/2026"
          rows={scheduleRows}
          start={start}
          slots={freeSlots}
          picked={picked}
          conflict={conflict}
          onPick={(slot) => { setStart(slot.time); setCardOpen(true); }}
        />
      </div>
    </AdminLayout>
  );
}
