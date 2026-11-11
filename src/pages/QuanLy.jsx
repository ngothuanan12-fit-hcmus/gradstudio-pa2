import { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/admin.css';
import BookingForm from '../components/BookingForm.jsx';
import ChatStream from '../components/ChatStream.jsx';
import ConversationList from '../components/ConversationList.jsx';
import ResourceSchedule from '../components/ResourceSchedule.jsx';
import StudioHeader from '../components/StudioHeader.jsx';
import {
  createInitialMessages,
  defaultPackageTitle,
  initialCustomers,
} from '../data.js';
import {
  checkScheduleConflict,
  formatDateDisplay,
  formatTimeMinutes,
  generateSlotSuggestions,
  getDayOfWeek,
} from '../utils/scheduling.js';

let messageSeq = 100;

function Toast({ text }) {
  if (!text) return null;
  return (
    <div role="status" className="st-toast">
      <span className="st-toast-icon">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="m2.5 6.2 2.3 2.3 4.7-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="st-toast-text">{text}</span>
    </div>
  );
}

export default function QuanLy() {
  // Customer selection & filtering
  const [activeId, setActiveId] = useState('linh');
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [linhStatus, setLinhStatus] = useState('consulting');

  // Chat messages
  const [chatMap, setChatMap] = useState(createInitialMessages);

  // Booking parameters
  const [bookingDate, setBookingDate] = useState(24);
  const [timelineDate, setTimelineDate] = useState(24);
  const [startTime, setStartTime] = useState(540); // 09:00
  const [initialSlotTime, setInitialSlotTime] = useState(540);
  const [hasMakeup, setHasMakeup] = useState(true);
  const [hasCostume, setHasCostume] = useState(false);
  const [price, setPrice] = useState('1.800.000đ');

  // Conflict resolution & simulation states
  const [proposedTime, setProposedTime] = useState(null);
  const [isCustomerAgreed, setIsCustomerAgreed] = useState(false);
  const [rejectedSlots, setRejectedSlots] = useState(() => new Set());
  const [isBookingCreated, setIsBookingCreated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // DOM Refs
  const chatBottomRef = useRef(null);
  const bookingFormRef = useRef(null);

  // Panels visibility state
  const [isResourceOpen, setIsResourceOpen] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Validation
  const validation = useMemo(
    () => checkScheduleConflict(startTime, bookingDate, hasMakeup),
    [startTime, bookingDate, hasMakeup]
  );

  const initialValidation = useMemo(
    () => checkScheduleConflict(initialSlotTime, 24, hasMakeup),
    [initialSlotTime, hasMakeup]
  );

  const suggestions = useMemo(
    () => generateSlotSuggestions(startTime, bookingDate, hasMakeup, rejectedSlots),
    [startTime, bookingDate, hasMakeup, rejectedSlots]
  );

  // Customers data with dynamic Linh status
  const customers = useMemo(() => {
    return initialCustomers.map((c) =>
      c.id === 'linh' ? { ...c, status: linhStatus } : c
    );
  }, [linhStatus]);

  const counts = useMemo(
    () => ({
      all: customers.length,
      unanswered: customers.filter((c) => c.status === 'unanswered').length,
      consulting: customers.filter((c) => c.status === 'consulting').length,
    }),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchTab = filterTab === 'all' || c.status === filterTab;
      const matchSearch = c.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchTab && matchSearch;
    });
  }, [customers, filterTab, searchQuery]);

  const activeCustomer = useMemo(
    () => customers.find((c) => c.id === activeId) ?? customers[0],
    [customers, activeId]
  );

  const activeMessages = chatMap[activeId] ?? [];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeMessages.length]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(null), 2600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const appendMessage = (customerId, item) => {
    setChatMap((prev) => ({
      ...prev,
      [customerId]: [...(prev[customerId] ?? []), item],
    }));
  };

  const getNowTimeString = () =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

  const handlePickSuggestion = (day, time) => {
    setBookingDate(day);
    setTimelineDate(day);
    setStartTime(time);

    if (isCustomerAgreed) {
      setIsBookingOpen(true);
      bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (checkScheduleConflict(time, day, hasMakeup).ok) {
      const dayPrefix = day === 24 ? '' : `${day}/10 · `;
      setToastMessage(`Đã đổi sang ${dayPrefix}${formatTimeMinutes(time)} — đủ nhân sự`);

      const planNote = hasMakeup
        ? `Makeup ${formatTimeMinutes(time - 60)}–${formatTimeMinutes(time)}, chụp ${formatTimeMinutes(time)}–${formatTimeMinutes(time + 120)}.`
        : `Chụp ${formatTimeMinutes(time)}–${formatTimeMinutes(time + 120)}.`;

      appendMessage('linh', {
        id: messageSeq++,
        kind: 'text',
        from: 'studio',
        text: `${formatTimeMinutes(time)} còn lịch nha Linh. ${planNote} Bạn chốt giờ này không?`,
        time: getNowTimeString(),
      });

      if (!isCustomerAgreed) {
        setProposedTime(time);
      }
    }
  };

  const handleSimulateAgree = (agreed) => {
    const time = proposedTime;
    setProposedTime(null);

    appendMessage('linh', {
      id: messageSeq++,
      kind: 'text',
      from: 'me',
      text: agreed
        ? `Dạ em chốt lịch ${formatTimeMinutes(time ?? startTime)} ạ.`
        : 'Dạ giờ này chưa phù hợp ạ, cho em giờ khác nhé.',
      time: getNowTimeString(),
    });

    if (!agreed) {
      setRejectedSlots((prev) => new Set(prev).add(`${bookingDate}-${time}`));
      setStartTime(initialSlotTime);
      setBookingDate(24);
      setTimelineDate(24);
      return;
    }

    setIsCustomerAgreed(true);
    setLinhStatus('agreed');
    setIsBookingOpen(true);

    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleSendQuote = () => {
    appendMessage('linh', {
      id: messageSeq++,
      kind: 'quote',
      time: getNowTimeString(),
      pkg: defaultPackageTitle,
      date: `${formatDateDisplay(bookingDate)} (${getDayOfWeek(bookingDate)})`,
      start: formatTimeMinutes(startTime),
      price,
    });
  };

  const handleCreateBooking = () => {
    setIsSubmitting(true);
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsBookingCreated(true);
      setLinhStatus('pending');

      appendMessage('linh', {
        id: messageSeq++,
        kind: 'system',
        text: `Booking #GS-1024 · Chụp ảnh tốt nghiệp · ${formatDateDisplay(bookingDate)} ${formatTimeMinutes(startTime)} · Chờ thanh toán cọc 30%`,
      });

      setToastMessage('Đã tạo Booking #GS-1024 và gửi tới Lịch chụp của Linh');
    }, 600);
  };

  const handleCancelBooking = (canceled) => {
    setIsBookingCreated(false);
    setLinhStatus('agreed');
    if (canceled) {
      appendMessage('linh', {
        id: messageSeq++,
        kind: 'system',
        text: 'Booking #GS-1024 đã được hủy',
      });
    }
  };

  const isLinh = activeId === 'linh';

  return (
    <div className="st-app">
      <StudioHeader
        onToggleBooking={() => setIsBookingOpen((v) => !v)}
        onToggleResource={() => setIsResourceOpen((v) => !v)}
        isBookingOpen={isBookingOpen}
        isResourceOpen={isResourceOpen}
      />

      <div className="st-workspace">
        <ConversationList
          customers={filteredCustomers}
          activeId={activeId}
          onSelect={setActiveId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterTab={filterTab}
          onFilterChange={setFilterTab}
          counts={counts}
        />

        <main className="st-center-pane">
          <ChatStream
            customer={activeCustomer}
            statusKey={activeCustomer.status}
            messages={activeMessages}
            proposedTime={proposedTime}
            isAgreed={isCustomerAgreed}
            onSimulateAgree={handleSimulateAgree}
            onSendMessage={(text) =>
              appendMessage(activeId, {
                id: messageSeq++,
                kind: 'text',
                from: 'studio',
                text,
                time: getNowTimeString(),
              })
            }
            scrollBottomRef={chatBottomRef}
            isResourceOpen={isResourceOpen}
            onToggleResource={() => setIsResourceOpen((v) => !v)}
            isBookingOpen={isBookingOpen}
            onToggleBookingForm={() => setIsBookingOpen((v) => !v)}
            hasConflict={isLinh && !isBookingCreated && !validation.ok}
            bookingFormNode={
              <BookingForm
                isLinh={isLinh}
                bookingDate={bookingDate}
                startTime={isCustomerAgreed ? startTime : initialSlotTime}
                onStartTimeChange={(t) => {
                  setStartTime(t);
                  if (!isCustomerAgreed) setInitialSlotTime(t);
                }}
                hasMakeup={hasMakeup}
                onToggleMakeup={setHasMakeup}
                hasCostume={hasCostume}
                onToggleCostume={setHasCostume}
                price={price}
                onPriceChange={setPrice}
                validation={validation}
                initialValidation={initialValidation}
                isAgreed={isCustomerAgreed}
                isBookingCreated={isBookingCreated}
                isSubmitting={isSubmitting}
                onSendQuote={handleSendQuote}
                onCreateBooking={handleCreateBooking}
                onCancelBooking={handleCancelBooking}
                formRef={bookingFormRef}
                onClose={() => setIsBookingOpen(false)}
              />
            }
          />
        </main>

        {isResourceOpen ? (
          <div
            onClick={() => setIsResourceOpen(false)}
            className="st-drawer-backdrop"
            aria-hidden="true"
          />
        ) : null}

        <div className={isResourceOpen ? 'st-right-pane is-open' : 'st-right-pane'}>
          <div className="st-right-pane-inner">
            <ResourceSchedule
              timelineDate={timelineDate}
              onTimelineDateChange={(delta) => setTimelineDate((d) => d + delta)}
              bookingDate={bookingDate}
              startTime={startTime}
              isLinh={isLinh}
              validation={validation}
              suggestions={suggestions}
              hasMakeup={hasMakeup}
              isBookingCreated={isBookingCreated}
              onPickSuggestion={handlePickSuggestion}
              onClose={() => setIsResourceOpen(false)}
            />
          </div>
        </div>
      </div>

      <Toast text={toastMessage} />
    </div>
  );
}
