import { useRef, useState } from 'react';
import { useParams } from 'react-router';
import AdminChatWindow from '../components/admin/AdminChatWindow.jsx';
import AdminConversationList from '../components/admin/AdminConversationList.jsx';
import AdminInspector from '../components/admin/AdminInspector.jsx';
import ScheduleSheet from '../components/admin/ScheduleSheet.jsx';
import useApi from '../hooks/useApi.js';
import AdminLayout from '../layouts/AdminLayout.jsx';
import '../styles/admin.css';

// Steps G4–G6 (Admin side): 3-column studio workspace on /quan-ly and /quan-ly/hoi-thoai/:id.
export default function QuanLy() {
  const { id: routeConvId } = useParams();

  const conversationsQuery = useApi('/conversations');
  const servicesQuery = useApi('/services');
  const extrasQuery = useApi('/extras');
  const staffQuery = useApi('/staff');
  const roomsQuery = useApi('/rooms');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [panelOpen, setPanelOpen] = useState(true);
  const [createdBookings, setCreatedBookings] = useState({});

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleContext, setScheduleContext] = useState({ date: null, draftSlot: null });
  const [schedulePick, setSchedulePick] = useState(null);

  const headerSchedTriggerRef = useRef(null);
  const activeModalTriggerRef = useRef(null);

  const activeId = routeConvId || conversationsQuery.data?.[0]?.id || null;
  const convQuery = useApi(activeId ? `/conversations/${activeId}` : null);
  const activeConv = activeId && convQuery.data?.id === activeId ? convQuery.data : null;

  const bookingId = activeConv?.bookingId || null;
  const cachedBooking = bookingId ? createdBookings[bookingId] : null;
  const fetchedBookingQuery = useApi(bookingId && !cachedBooking ? `/bookings/${bookingId}` : null);
  const matchedFetchedBooking =
    bookingId && fetchedBookingQuery.data && fetchedBookingQuery.data.id !== bookingId
      ? { ...fetchedBookingQuery, data: null }
      : fetchedBookingQuery;
  const bookingQuery = cachedBooking
    ? { status: 'ready', data: cachedBooking, error: null, retry: () => {} }
    : matchedFetchedBooking;
  const activeBooking = bookingId && bookingQuery.data?.id === bookingId ? bookingQuery.data : null;

  const hasConversations = Boolean(conversationsQuery.data && conversationsQuery.data.length > 0);

  function handleConversationUpdated(updatedConv) {
    if (!updatedConv) return;
    convQuery.setData(updatedConv);
    conversationsQuery.setData((prev) => {
      if (!prev) return prev;
      const summary = {
        id: updatedConv.id,
        customer: updatedConv.customer,
        status: updatedConv.status,
        lastMessage: updatedConv.lastMessage,
        updatedAt: updatedConv.updatedAt,
        bookingId: updatedConv.bookingId,
      };
      const exists = prev.some((c) => c.id === updatedConv.id);
      const next = exists ? prev.map((c) => (c.id === updatedConv.id ? summary : c)) : [summary, ...prev];
      return [...next].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  }

  function handleBookingCreated(booking) {
    if (!booking) return;
    setCreatedBookings((prev) => ({ ...prev, [booking.id]: booking }));
    convQuery.setData((prev) => (prev ? { ...prev, bookingId: booking.id } : prev));
    conversationsQuery.setData((prev) =>
      prev ? prev.map((c) => (c.id === booking.conversationId ? { ...c, bookingId: booking.id } : c)) : prev,
    );
  }

  function resolveActiveConvDate() {
    if (activeBooking?.date) return activeBooking.date;
    const msgs = activeConv?.messages || [];
    const prop = [...msgs].reverse().find((m) => m.proposal)?.proposal;
    if (prop?.date) return prop.date;
    const req = [...msgs].reverse().find((m) => m.kind === 'request' && m.request)?.request;
    if (req?.date) return req.date;
    return '2026-10-24';
  }

  function resolveActiveDraftSlot() {
    if (!activeConv || activeConv.bookingId) return null;
    const msgs = activeConv.messages || [];
    const prop = [...msgs].reverse().find((m) => m.proposal)?.proposal;
    if (!prop) return null;
    return {
      date: prop.date,
      makeup: prop.makeup,
      shoot: prop.shoot,
    };
  }

  function openSchedule(date = null, draftSlot = null, triggerRef = null) {
    activeModalTriggerRef.current = triggerRef?.current || headerSchedTriggerRef.current;
    setScheduleContext({
      date: date || resolveActiveConvDate(),
      draftSlot: draftSlot || resolveActiveDraftSlot(),
    });
    setScheduleOpen(true);
  }

  function handleScheduleSlotPick(slot) {
    setSchedulePick({ ...slot, token: Date.now() });
  }

  return (
    <AdminLayout
      title="Quản lý hội thoại: GradStudio"
      variant="workspace"
      scheduleOpen={scheduleOpen}
      scheduleTriggerRef={headerSchedTriggerRef}
      onOpenSchedule={() => openSchedule(null, null, headerSchedTriggerRef)}
    >
      <div className="admin-workspace" data-panel-open={panelOpen ? 'true' : 'false'}>
        <AdminConversationList
          conversationsQuery={conversationsQuery}
          activeId={activeId}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />

        <AdminChatWindow
          activeId={activeId}
          convQuery={convQuery}
          conversationsStatus={conversationsQuery.status}
          hasConversations={hasConversations}
          bookingDate={activeBooking?.date || null}
          panelOpen={panelOpen}
          onTogglePanel={() => setPanelOpen((v) => !v)}
          services={servicesQuery.data || []}
          onConversationUpdated={handleConversationUpdated}
          onOpenSchedule={openSchedule}
        />

        <AdminInspector
          activeId={activeId}
          convQuery={convQuery}
          conversationsStatus={conversationsQuery.status}
          hasConversations={hasConversations}
          bookingQuery={bookingQuery}
          servicesQuery={servicesQuery}
          extrasQuery={extrasQuery}
          staffQuery={staffQuery}
          roomsQuery={roomsQuery}
          panelOpen={panelOpen}
          onConversationUpdated={handleConversationUpdated}
          onBookingCreated={handleBookingCreated}
          onOpenSchedule={openSchedule}
          schedulePick={schedulePick}
        />
      </div>

      <ScheduleSheet
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        triggerRef={activeModalTriggerRef}
        initialDate={scheduleContext.date}
        draftSlot={scheduleContext.draftSlot}
        staffQuery={staffQuery}
        roomsQuery={roomsQuery}
        onSelectSlot={handleScheduleSlotPick}
      />
    </AdminLayout>
  );
}
