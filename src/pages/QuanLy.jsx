import { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import BookingForm from '../components/BookingForm.jsx';
import ChatPanel from '../components/ChatPanel.jsx';
import ConversationList from '../components/ConversationList.jsx';
import ResourceSchedule from '../components/ResourceSchedule.jsx';
import Button from '../components/Button.jsx';
import {
  booking,
  conversations,
  formatVND,
  freeSlots,
  messages as initialMessages,
  scheduleRows,
  services,
} from '../data.js';

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'neutral', label: 'Mới' },
  { id: 'pending', label: 'Chờ cọc' },
  { id: 'confirmed', label: 'Đã xác nhận' },
  { id: 'conflict', label: 'Trùng lịch' },
];

const PROPOSAL = 'Studio gợi ý 14:00 ngày 24/10/2026: makeup 13:00–14:00 với Mai, chụp 14:00–16:00 với Tuấn tại Phòng B.';
const SIMULATED_IDS = ['proposal', 'linh-accept', 'linh-decline', 'quote'];

function now() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function QuanLy() {
  const [activeId, setActiveId] = useState('linh');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [threads, setThreads] = useState({ linh: initialMessages });
  const [start, setStart] = useState(booking.requested);
  const [picked, setPicked] = useState(null);
  const [reply, setReply] = useState(null);
  const [status, setStatus] = useState('Đang mở hội thoại của Nguyễn Thùy Linh.');

  const conflict = start === booking.requested;
  const agreed = reply === 'accepted';
  const active = conversations.find((item) => item.id === activeId) || conversations[0];
  const activeMessages = threads[activeId] || [];

  const visibleConversations = conversations.filter((item) => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const keyword = query.trim().toLowerCase();
    const matchesQuery = !keyword
      || item.name.toLowerCase().includes(keyword)
      || item.last.toLowerCase().includes(keyword);
    return matchesFilter && matchesQuery;
  });

  function addLinhMessage(message) {
    setThreads((previous) => {
      const list = previous.linh || [];
      const exists = list.some((item) => item.id === message.id);
      return {
        ...previous,
        linh: exists
          ? list.map((item) => (item.id === message.id ? message : item))
          : [...list, message],
      };
    });
  }

  function chooseStart(value) {
    setStart(value);
    setReply(null);
    setPicked(value === booking.agreed ? 'slot-1400' : null);
    setThreads((previous) => ({
      ...previous,
      linh: (previous.linh || []).filter((item) => !SIMULATED_IDS.includes(item.id)),
    }));

    if (value === booking.agreed) {
      addLinhMessage({ id: 'proposal', who: 'Studio', me: true, text: PROPOSAL, time: '09:44' });
      setStatus('Đã chọn 14:00 và thêm lời đề xuất vào chat. Gửi báo giá hoặc mô phỏng câu trả lời của Linh.');
    } else {
      setStatus('09:00 trùng lịch: Mai (makeup) bận 08:00–12:00.');
    }
  }

  function sendQuote() {
    addLinhMessage({
      id: 'quote',
      who: 'Studio',
      me: true,
      text: `Báo giá ${booking.pkg}: ${formatVND(booking.price)}. Cọc ${formatVND(booking.deposit)}, còn lại ${formatVND(booking.rest)}. Lịch 14:00 ngày ${booking.date}: makeup ${booking.makeup.from}–${booking.makeup.to} với ${booking.makeup.who}, chụp ${booking.shoot.from}–${booking.shoot.to} với ${booking.shoot.who} tại ${booking.shoot.room}.`,
      time: '09:46',
    });
    setStatus('Đã gửi báo giá vào chat.');
  }

  function respond(kind) {
    setReply(kind);
    setThreads((previous) => {
      const list = (previous.linh || []).filter(
        (item) => item.id !== 'linh-accept' && item.id !== 'linh-decline',
      );
      const accepted = kind === 'accepted';
      return {
        ...previous,
        linh: [
          ...list,
          {
            id: accepted ? 'linh-accept' : 'linh-decline',
            who: 'Linh',
            text: accepted ? 'Dạ em chốt lịch 14:00 ạ.' : 'Dạ em chưa chốt được giờ này ạ.',
            time: '09:47',
          },
        ],
      };
    });
    setStatus(
      kind === 'accepted'
        ? 'Linh đã chốt 14:00. Nút Tạo booking mới đã bật.'
        : 'Linh chưa đồng ý. Nút Tạo booking mới vẫn tắt.',
    );
  }

  function sendMessage(text) {
    setThreads((previous) => ({
      ...previous,
      [activeId]: [
        ...(previous[activeId] || []),
        { id: `local-${Date.now()}`, who: 'Studio', me: true, text, time: now() },
      ],
    }));
  }

  return (
    <AdminLayout>
      <h1 className="page-title">Quản lý booking</h1>
      <p className="page-lede">
        Admin Thảo · Hội thoại, lịch thợ makeup, thợ chụp, phòng chụp và form booking mới của studio.
      </p>
      <p className="status-line" role="status">{status}</p>

      <div className="admin-grid">
        <section className="panel admin-convs" aria-labelledby="convs-title">
          <h2 id="convs-title">Hội thoại</h2>
          <div className="toolbar">
            <p className="field">
              <label className="field-label" htmlFor="conv-search">Tìm hội thoại</label>
              <input
                className="input"
                id="conv-search"
                type="search"
                value={query}
                placeholder="Tên khách hoặc tin nhắn"
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
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </p>
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
            placeholder="Nhập tin nhắn cho khách"
            messages={activeMessages}
            onSend={sendMessage}
            sendVariant="secondary"
          />

          {picked && activeId === 'linh' ? (
            <section className="panel sim" aria-labelledby="sim-title">
              <h2 id="sim-title">Mô phỏng phản hồi của Linh</h2>
              <p>Chọn câu trả lời để thử luồng chốt lịch. Không có tin nhắn thật nào được gửi.</p>
              <div className="button-row">
                <Button variant="secondary" type="button" onClick={() => respond('accepted')}>
                  Chốt giờ này
                </Button>
                <Button variant="ghost" type="button" onClick={() => respond('declined')}>
                  Từ chối
                </Button>
              </div>
            </section>
          ) : null}
        </div>

        <BookingForm
          booking={booking}
          services={services}
          conflict={conflict}
          start={start}
          onStartChange={chooseStart}
          slots={freeSlots}
          picked={picked}
          onPickSlot={(slot) => chooseStart(slot.time)}
          agreed={agreed}
          onSendQuote={sendQuote}
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