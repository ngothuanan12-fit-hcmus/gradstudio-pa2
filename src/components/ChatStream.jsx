import { useState } from 'react';
import { statusConfig } from '../data.js';
import { Avatar } from './ConversationList.jsx';

const BADGE_GLYPHS = {
  conflict: '⚠',
  success: '✓',
  pending: '◷',
  outline: '◷',
  neutral: '○',
  dark: '○',
};

export function StatusBadge({ tone = 'neutral', children, className = '' }) {
  const glyph = BADGE_GLYPHS[tone] ?? '○';
  return (
    <span className={`st-badge st-badge-${tone} ${className}`.trim()}>
      <span className="st-badge-glyph" aria-hidden="true">
        {glyph}
      </span>
      <span>{children}</span>
    </span>
  );
}

export function ChatBubble({ message, customerName = 'Khách hàng', viewer = 'studio' }) {
  const isSelf = message.from === viewer;
  return (
    <div className={isSelf ? 'st-bubble-row is-self' : 'st-bubble-row is-other'}>
      <div className={isSelf ? 'st-bubble is-self' : 'st-bubble is-other'}>
        <strong className="st-bubble-who">{isSelf ? 'Studio · Thảo' : customerName}</strong>
        <span>{message.text}</span>
      </div>
      <span className="st-bubble-time">{message.time}</span>
    </div>
  );
}

export function ChatInput({
  onSend,
  placeholder = 'Nhập tin nhắn trả lời khách…',
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
          aria-expanded={isBookingOpen}
          className={isBookingOpen ? 'st-booking-toggle is-active' : 'st-booking-toggle'}
        >
          <span>Tạo booking</span>
        </button>
      ) : null}

      <input
        id="studio-chat-message"
        type="text"
        name="chat-message"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        aria-label="Tin nhắn trả lời khách"
        className="st-chat-text-input"
      />

      <button type="submit" className="st-chat-send-btn">
        <span>Gửi</span>
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
      <div className="st-chat-header">
        <Avatar
          src={customer.avatar}
          initials={customer.initials}
          alt={`Ảnh đại diện ${customer.name}`}
          size={44}
        />
        <div className="st-chat-cust-info">
          <h1 className="st-chat-cust-name">{customer.name}</h1>
          <p className="st-chat-cust-meta">
            {isLinh ? '0901 234 567 · Gói Tốt nghiệp Premium' : 'Khách hàng GradStudio'}
          </p>
        </div>

        {onToggleResource ? (
          <button
            type="button"
            onClick={onToggleResource}
            aria-expanded={isResourceOpen}
            className={isResourceOpen ? 'st-res-toggle is-active' : 'st-res-toggle'}
          >
            <span className="st-res-toggle-label">Lịch tài nguyên</span>
            {hasConflict && !isResourceOpen ? (
              <span className="st-res-conflict-flag">⚠ Trùng lịch</span>
            ) : null}
          </button>
        ) : null}

        <StatusBadge tone={statusInfo.tone}>{statusInfo.label}</StatusBadge>
      </div>

      <div className="st-chat-messages" aria-live="polite">
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
                customerName={customer.name}
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
                <p role="status" className="st-system-msg">
                  {msg.text}
                </p>
              </div>
            );
          }

          if (msg.kind === 'quote') {
            return (
              <div key={msg.id} className="st-bubble-row is-self">
                <div className="st-quote-card">
                  <p className="st-quote-kicker">Báo giá gửi khách</p>
                  <p className="st-quote-title">Chụp ảnh tốt nghiệp</p>
                  <dl className="st-quote-dl">
                    {[
                      ['Gói', msg.pkg],
                      ['Ngày chụp', msg.date],
                      ['Giờ chụp', msg.start],
                    ].map(([dtLabel, ddVal]) => (
                      <div key={dtLabel} className="st-quote-dl-row">
                        <dt>{dtLabel}</dt>
                        <dd>{ddVal}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="st-quote-footer">
                    <span className="st-quote-note">Cọc 30% để giữ lịch</span>
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

      {isLinh && proposedTime !== null && !isAgreed ? (
        <div className="st-sim-bar">
          <span className="st-sim-kicker">Phản hồi của Linh trong chat:</span>
          <button
            type="button"
            onClick={() => onSimulateAgree(true)}
            className="st-sim-btn-agree"
          >
            ✓ Chốt giờ này
          </button>
          <button
            type="button"
            onClick={() => onSimulateAgree(false)}
            className="st-sim-btn-reject"
          >
            Đổi giờ khác
          </button>
        </div>
      ) : null}

      {bookingFormNode ? (
        <div className={isBookingOpen ? 'st-booking-drawer is-open' : 'st-booking-drawer'}>
          {bookingFormNode}
        </div>
      ) : null}

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
