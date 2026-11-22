import EmptyState from '../EmptyState.jsx';
import LoadingState from '../LoadingState.jsx';
import AdminBookingForm from './AdminBookingForm.jsx';
import ConsultationPanel from './ConsultationPanel.jsx';
import InvoicePanel from './InvoicePanel.jsx';

// Right column #booking-panel: switches cleanly across the 4 conversation statuses without duplicating shell chrome.
export default function AdminInspector({
  activeId,
  convQuery,
  conversationsStatus,
  hasConversations,
  bookingQuery,
  servicesQuery,
  extrasQuery,
  staffQuery,
  roomsQuery,
  panelOpen,
  onConversationUpdated,
  onBookingCreated,
  onOpenSchedule,
  schedulePick,
}) {
  const conv = activeId && convQuery.data?.id === activeId ? convQuery.data : null;

  let content = null;
  if (!activeId) {
    if (conversationsStatus === 'loading' || conversationsStatus === 'idle') {
      content = (
        <div className="inspector-body">
          <LoadingState label="Đang tải bảng chi tiết…" />
        </div>
      );
    } else if (conversationsStatus === 'error') {
      content = (
        <div className="inspector-body">
          <p className="state state-empty">Chưa tải được danh sách hội thoại. Hãy nhấn Thử lại ở cột bên trái.</p>
        </div>
      );
    } else if (!hasConversations) {
      content = (
        <div className="inspector-body">
          <EmptyState>Chọn một hội thoại để xem thông tin chi tiết.</EmptyState>
        </div>
      );
    }
  } else if (convQuery.status === 'error') {
    content = (
      <div className="inspector-body">
        <EmptyState>Không thể hiển thị bảng chi tiết khi hội thoại chưa tải được.</EmptyState>
      </div>
    );
  } else if (!conv) {
    content = (
      <div className="inspector-body">
        <LoadingState label="Đang tải bảng chi tiết…" />
      </div>
    );
  } else if (conv.status === 'Chưa trả lời' || conv.status === 'Đang tư vấn') {
    content = (
      <ConsultationPanel
        key={conv.id}
        conv={conv}
        servicesQuery={servicesQuery}
        extrasQuery={extrasQuery}
        staffQuery={staffQuery}
        roomsQuery={roomsQuery}
        onConversationUpdated={onConversationUpdated}
        onOpenSchedule={onOpenSchedule}
        schedulePick={schedulePick}
      />
    );
  } else if (conv.status === 'Đã chốt lịch') {
    content = (
      <AdminBookingForm
        key={`${conv.id}:${conv.bookingId || 'draft'}`}
        conv={conv}
        bookingQuery={bookingQuery}
        servicesQuery={servicesQuery}
        extrasQuery={extrasQuery}
        staffQuery={staffQuery}
        roomsQuery={roomsQuery}
        onBookingCreated={onBookingCreated}
        onConversationUpdated={onConversationUpdated}
        onOpenSchedule={onOpenSchedule}
        schedulePick={schedulePick}
      />
    );
  } else {
    content = (
      <InvoicePanel
        key={`${conv.id}:${conv.bookingId || 'empty'}`}
        conv={conv}
        bookingQuery={bookingQuery}
        onConversationUpdated={onConversationUpdated}
      />
    );
  }

  return (
    <aside
      id="booking-panel"
      className="admin-card admin-inspector"
      aria-label="Thông tin tư vấn và booking"
      aria-hidden={!panelOpen}
      inert={panelOpen ? undefined : true}
    >
      <div className="admin-inspector-inner">{content}</div>
    </aside>
  );
}
