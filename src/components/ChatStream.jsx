import { useState } from 'react';
import { statusConfig } from '../data.js';
import { Avatar } from './ConversationList.jsx';

export function StatusBadge({ tone = 'neutral', children, className = '' }) {
  return (
    <span className={`st-badge st-badge-${tone} ${className}`}>
      <span className="st-badge-dot" />
      <span>{children}</span>
    </span>
  );
}

export function ChatBubble({ message, viewer = 'studio' }) {
  const isSelf = message.from === viewer;
  return (
    <div className={isSelf ? 'st-bubble-row is-self' : 'st-bubble-row is-other'}>
      <div className={isSelf ? 'st-bubble is-self' : 'st-bubble is-other'}>
        {message.text}
      </div>
      <span className="st-bubble-time">{message.time}</span>
    </div>
  );
}

export function ChatInput({
  onSend,
  placeholder = 'Nhập tin nhắn…',
  isBookingOpen = false,
  onToggleBookingForm,
}) {
  const [val, setVal] = useState('');

  const submit = () => {
    if (val.trim()) {
      onSend(val.trim());
      setVal('');
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="st-chat-input-bar"
    >
      {onToggleBookingForm ? (
        <button
          type="button"
          onClick={onToggleBookingForm}
          className={isBookingOpen ? 'st-booking-toggle is-active' : 'st-booking-toggle'}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2.2" y="3" width="11.6" height="10.8" rx="1.8" stroke="currentColor" strokeWidth="1.35" />
            <path d="M5.2 1.8v2.2M10.8 1.8v2.2M2.2 6.2h11.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          </svg>
          <span>Tạo booking</span>
        </button>
      ) : null}

      <input
        type="text"
        name="chat-message"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="st-chat-text-input"
      />

      <button type="submit" aria-label="Gửi tin nhắn" className="st-chat-send-btn">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 8h10m-4-4 4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
}

export default function ChatStream({
  customer,
  statusKey,
  messages = [],
  onSendMessage,
  proposedTime,
  isAgreed,
  onSimulateAgree,
  scrollBottomRef,
  isBookingOpen = false,
  onToggleBookingForm,
  bookingFormNode,
  isResourceOpen = false,
  onToggleResource,
  hasConflict = false,
}) {
  const statusInfo = statusConfig[statusKey] ?? statusConfig.consulting;
  const isLinh = customer.id === 'linh';

  return (
    <div className="st-chat-stream">
      {/* Top sticky customer info bar */}
      <div className="st-chat-header">
        <Avatar src={customer.avatar} initials={customer.initials} alt={customer.name} size={42} />
        <div className="st-chat-cust-info">
          <h1 className="st-chat-cust-name">{customer.name}</h1>
          <p className="st-chat-cust-meta">
            {isLinh ? 'linh.nguyen@email.com · 0901 234 567' : 'Khách hàng GradStudio'}
          </p>
        </div>

        {onToggleResource ? (
          <button
            type="button"
            onClick={onToggleResource}
            className={isResourceOpen ? 'st-res-toggle is-active' : 'st-res-toggle'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2 4h12M2 8h8M2 12h10"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <span className="st-res-toggle-label">Lịch tài nguyên</span>
            {hasConflict && !isResourceOpen ? <span className="st-res-conflict-dot" /> : null}
          </button>
        ) : null}

        <StatusBadge tone={statusInfo.tone}>{statusInfo.label}</StatusBadge>
      </div>

      {/* Scrollable message history */}
      <div className="st-chat-messages">
        <div className="st-chat-day-divider">
          <span className="st-chat-day-line" />
          <span className="st-chat-day-label">Hôm nay · 23/10</span>
          <span className="st-chat-day-line" />
        </div>

        {messages.map((msg) => {
          if (msg.kind === 'text') {
            return (
              <ChatBubble
                key={msg.id}
                viewer="studio"
                message={{
                  id: msg.id,
                  from: msg.from ?? 'me',
                  text: msg.text ?? '',
                  time: msg.time ?? '',
                }}
              />
            );
          }

          if (msg.kind === 'system') {
            return (
              <div key={msg.id} className="st-system-msg-row">
                <span className="st-system-msg">{msg.text}</span>
              </div>
            );
          }

          if (msg.kind === 'quote') {
            return (
              <div key={msg.id} className="st-bubble-row is-self">
                <div className="st-quote-card">
                  <p className="st-quote-kicker">Báo giá</p>
                  <p className="st-quote-title">Chụp ảnh tốt nghiệp</p>
                  <dl className="st-quote-dl">
                    {[
                      ['Gói', msg.pkg],
                      ['Ngày', msg.date],
                      ['Giờ', msg.start],
                    ].map(([dtLabel, ddVal]) => (
                      <div key={dtLabel} className="st-quote-dl-row">
                        <dt>{dtLabel}</dt>
                        <dd>{ddVal}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="st-quote-footer">
                    <span className="st-quote-note">Giá chốt sẽ ghi trên booking</span>
                    <span className="st-quote-price">{msg.price}</span>
                  </div>
                </div>
                <span className="st-bubble-time">{msg.time}</span>
              </div>
            );
          }

          return null;
        })}

        <div ref={scrollBottomRef} />
      </div>

      {/* Simulated customer response strip */}
      {isLinh && proposedTime !== null && !isAgreed ? (
        <div className="st-sim-bar">
          <span className="st-sim-kicker">Mô phỏng phản hồi của Linh</span>
          <button
            type="button"
            onClick={() => onSimulateAgree(true)}
            className="st-sim-btn-agree"
          >
            Chốt giờ này
          </button>
          <button
            type="button"
            onClick={() => onSimulateAgree(false)}
            className="st-sim-btn-reject"
          >
            Từ chối
          </button>
        </div>
      ) : null}

      {/* Booking Form collapsible panel */}
      {bookingFormNode ? (
        <div className={isBookingOpen ? 'st-booking-drawer is-open' : 'st-booking-drawer'}>
          {bookingFormNode}
        </div>
      ) : null}

      {/* Chat input box anchored at bottom */}
      <div className="st-chat-footer">
        <ChatInput
          onSend={onSendMessage}
          isBookingOpen={isBookingOpen}
          onToggleBookingForm={onToggleBookingForm}
        />
      </div>
    </div>
  );
}
