import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/client.js';
import useAction from '../../forms/useAction.js';
import useForm from '../../forms/useForm.js';
import { formatChatSeparator, vnWeekdayAndDate } from '../../utils/date.js';
import { formatDepositPolicyMessage, formatPriceListMessage, parseQuoteMessage } from '../../utils/pricing.js';
import { CONV_DOT_META } from '../../utils/status.js';
import Button from '../Button.jsx';
import ProposalCard from '../chat/ProposalCard.jsx';
import RequestCard from '../chat/RequestCard.jsx';
import EmptyState from '../EmptyState.jsx';
import ErrorState from '../ErrorState.jsx';
import Icon from '../Icon.jsx';
import LoadingState from '../LoadingState.jsx';

function validateMessage({ text }) {
  if (!text.trim()) return { text: 'Vui lòng nhập nội dung tin nhắn trước khi gửi.' };
  if (text.length > 1000) return { text: 'Tin nhắn tối đa 1000 ký tự.' };
  return {};
}

function ComposerForm({ convId, onConversationUpdated }) {
  const form = useForm({
    initial: { text: '' },
    validate: validateMessage,
    onSubmit: async ({ text }) => {
      const updated = await api(`/conversations/${convId}/messages`, {
        method: 'POST',
        body: { text: text.trim() },
      });
      onConversationUpdated(updated);
      form.reset();
    },
  });

  const errorText = form.errors.text || form.formError || null;

  return (
    <form className="chat-composer" noValidate onSubmit={form.handleSubmit}>
      {errorText ? (
        <p id="admin-chat-error" className="chat-composer-error" role="alert">
          {errorText}
        </p>
      ) : null}
      <div className="chat-composer-row">
        <label className="sr-only" htmlFor="admin-chat-input">
          Tin nhắn cho khách
        </label>
        <input
          id="admin-chat-input"
          className="chat-composer-input"
          type="text"
          placeholder="Nhập tin nhắn cho khách..."
          autoComplete="off"
          aria-invalid={errorText ? 'true' : undefined}
          aria-describedby={errorText ? 'admin-chat-error' : undefined}
          {...form.field('text')}
        />
        <Button variant="secondary" className="chat-send-btn" {...form.submitProps}>
          {form.busy ? 'Đang gửi…' : 'Gửi'}
        </Button>
      </div>
    </form>
  );
}

// Center column of the Admin workspace: chat bar with panel toggle, Messenger-grouped bubbles, contextual quick chips,
// and validated message composer.
export default function AdminChatWindow({
  activeId,
  convQuery,
  conversationsStatus,
  hasConversations,
  bookingDate,
  panelOpen,
  onTogglePanel,
  services,
  onConversationUpdated,
  onOpenSchedule,
}) {
  const scrollRef = useRef(null);
  const schedChipRef = useRef(null);
  const quickAction = useAction();
  const [usedChipsByConv, setUsedChipsByConv] = useState({});

  const conv = activeId && convQuery.data?.id === activeId ? convQuery.data : null;
  const messages = conv?.messages || [];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const frameId = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(frameId);
  }, [conv?.id, messages.length]);

  if (!activeId) {
    if (conversationsStatus === 'loading' || conversationsStatus === 'idle') {
      return (
        <section className="admin-card admin-chat" aria-label="Cửa sổ hội thoại">
          <div className="chat-empty-center">
            <LoadingState label="Đang tải hội thoại…" />
          </div>
        </section>
      );
    }
    if (conversationsStatus === 'error') {
      return (
        <section className="admin-card admin-chat" aria-label="Cửa sổ hội thoại">
          <div className="chat-empty-center">
            <p className="state state-empty">Chưa tải được danh sách hội thoại. Hãy nhấn Thử lại ở cột bên trái.</p>
          </div>
        </section>
      );
    }
    if (!hasConversations) {
      return (
        <section className="admin-card admin-chat" aria-label="Cửa sổ hội thoại">
          <div className="chat-empty-center">
            <EmptyState>Chưa có hội thoại để hiển thị.</EmptyState>
          </div>
        </section>
      );
    }
  }

  if (convQuery.status === 'error') {
    return (
      <section className="admin-card admin-chat" aria-label="Cửa sổ hội thoại">
        <div className="chat-empty-center">
          <ErrorState error={convQuery.error} onRetry={convQuery.retry} />
          <Link className="btn btn-secondary" to="/quan-ly">
            Quay lại danh sách hội thoại
          </Link>
        </div>
      </section>
    );
  }

  if (!conv) {
    return (
      <section className="admin-card admin-chat" aria-label="Cửa sổ hội thoại">
        <div className="chat-empty-center">
          <LoadingState label="Đang tải nội dung hội thoại…" />
        </div>
      </section>
    );
  }

  const dot = CONV_DOT_META[conv.status] || CONV_DOT_META['Chưa trả lời'];
  const activeProposal = [...messages]
    .reverse()
    .find((m) => m.proposal && (m.proposal.status === 'agreed' || m.proposal.status === 'open'))?.proposal;
  const latestRequest = [...messages].reverse().find((m) => m.kind === 'request' && m.request)?.request;
  const refDate = bookingDate || activeProposal?.date || null;
  const refLine = conv.bookingId
    ? refDate
      ? `${conv.bookingId} · ${vnWeekdayAndDate(refDate)}`
      : conv.bookingId
    : activeProposal?.date
      ? `Đề xuất ${vnWeekdayAndDate(activeProposal.date)}`
      : null;

  const usedSet = usedChipsByConv[conv.id] || [];
  const firstName = conv.customer.name.trim().split(/\s+/).slice(-1)[0] || conv.customer.name;

  function markUsed(chipId) {
    setUsedChipsByConv((prev) => {
      const current = prev[conv.id] || [];
      if (current.includes(chipId)) return prev;
      return { ...prev, [conv.id]: [...current, chipId] };
    });
  }

  function sendQuickText(chipId, text) {
    quickAction.run(async () => {
      const updated = await api(`/conversations/${conv.id}/messages`, {
        method: 'POST',
        body: { text },
      });
      markUsed(chipId);
      onConversationUpdated(updated);
    });
  }

  const newChips = [
    {
      id: 'greet',
      label: 'Chào khách',
      onClick: () =>
        sendQuickText(
          'greet',
          `Chào ${firstName}, cảm ơn bạn đã nhắn GradStudio. Studio có thể hỗ trợ lịch chụp và tư vấn gói cho bạn nhé.`,
        ),
    },
    {
      id: 'ask-need',
      label: 'Hỏi nhu cầu',
      onClick: () =>
        sendQuickText('ask-need', 'Bạn cho studio biết thêm bạn muốn chụp gói nào, ngày dự kiến và đi mấy người nhé?'),
    },
    {
      id: 'check-avail-note',
      label: 'Tư vấn lịch trống',
      onClick: () =>
        sendQuickText(
          'check-avail-note',
          'Để studio kiểm tra lịch thợ makeup, thợ chụp và phòng trống rồi báo lại bạn ngay ạ.',
        ),
    },
  ];

  const advisingChips = [
    {
      id: 'price-list',
      label: 'Gửi bảng giá',
      disabled: !services?.length,
      onClick: () => {
        if (!services?.length) return;
        sendQuickText('price-list', formatPriceListMessage(services));
      },
    },
    {
      id: 'open-schedule',
      label: 'Kiểm tra lịch trống',
      ref: schedChipRef,
      onClick: () => {
        onOpenSchedule(latestRequest?.date || activeProposal?.date || '2026-10-24', null, schedChipRef);
      },
    },
    {
      id: 'deposit-policy',
      label: 'Gửi chính sách đặt cọc',
      onClick: () => sendQuickText('deposit-policy', formatDepositPolicyMessage()),
    },
  ];

  const chips = conv.status === 'Chưa trả lời' ? newChips : conv.status === 'Đang tư vấn' ? advisingChips : [];

  return (
    <section className="admin-card admin-chat" aria-labelledby="chat-customer-heading">
      <div className="chat-window-bar">
        <div className="chat-window-who">
          <span className="conv-avatar">
            <span aria-hidden="true">{conv.customer.name.charAt(0)}</span>
            <span className={`conv-status-dot ${dot.cls}`}>
              <Icon name={dot.icon} />
              <span className="sr-only">{conv.status}</span>
            </span>
          </span>
          <div className="chat-window-meta">
            <h2 id="chat-customer-heading" className="chat-window-name">
              {conv.customer.name}
            </h2>
            {refLine ? <p className="chat-window-ref">{refLine}</p> : null}
          </div>
        </div>
        <button
          type="button"
          className="panel-toggle"
          aria-expanded={panelOpen}
          aria-controls="booking-panel"
          aria-label={panelOpen ? 'Ẩn booking' : 'Mở booking'}
          onClick={onTogglePanel}
        >
          <Icon name="sidebar" />
          <span className="panel-tooltip" aria-hidden="true">
            {panelOpen ? 'Ẩn booking' : 'Mở booking'}
          </span>
        </button>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.length ? (
          <ol className="chat-log" aria-label={`Tin nhắn với ${conv.customer.name}`}>
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const prevMs = prev ? new Date(prev.at).getTime() : 0;
              const currMs = new Date(m.at).getTime();
              const nextMs = next ? new Date(next.at).getTime() : 0;
              const diffDayPrev = !prev || prev.at.slice(0, 10) !== m.at.slice(0, 10);
              const showSep = i === 0 || diffDayPrev || currMs - prevMs >= 4 * 60 * 1000;
              const diffDayNext = !next || next.at.slice(0, 10) !== m.at.slice(0, 10);
              const nextHasSep = Boolean(next) && (diffDayNext || nextMs - currMs >= 4 * 60 * 1000);
              const isFirst = !prev || prev.from !== m.from || showSep;
              const isLast = !next || next.from !== m.from || nextHasSep;
              const isMe = m.from === 'studio';
              const quoteRows = isMe && m.kind === 'text' ? parseQuoteMessage(m.text) : null;

              const cls = [
                'chat-msg',
                isMe ? 'chat-msg-me' : 'chat-msg-them',
                isFirst ? 'is-first' : '',
                isLast ? 'is-last' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <Fragment key={m.id}>
                  {showSep ? (
                    <li className="chat-time-sep">
                      <time dateTime={m.at}>{formatChatSeparator(m.at, diffDayPrev)}</time>
                    </li>
                  ) : null}
                  <li className={cls}>
                    {quoteRows ? (
                      <div className="chat-quote-card">
                        <p className="chat-quote-title">Báo giá</p>
                        <dl className="chat-quote">
                          {quoteRows.map(([term, val]) => (
                            <div key={term}>
                              <dt>{term}</dt>
                              <dd>{val}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ) : (
                      <p className="msg-text">{m.text}</p>
                    )}
                    {m.kind === 'request' && m.request ? <RequestCard request={m.request} /> : null}
                    {m.kind === 'proposal' && m.proposal ? (
                      <ProposalCard proposal={m.proposal} viewer="studio" />
                    ) : null}
                  </li>
                </Fragment>
              );
            })}
          </ol>
        ) : (
          <EmptyState>Chưa có tin nhắn trong hội thoại này.</EmptyState>
        )}
      </div>

      <div className="chat-bottom">
        {chips.length ? (
          <div className="chat-quick-wrap">
            {quickAction.error ? (
              <p className="form-error" role="alert">
                {quickAction.error}
              </p>
            ) : null}
            <div className="chat-quick-actions" role="group" aria-label="Phản hồi nhanh">
              {chips.map((chip) => {
                const used = usedSet.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    ref={chip.ref}
                    type="button"
                    className={`quick-chip${used ? ' is-used' : ''}`}
                    aria-disabled={quickAction.busy || chip.disabled ? 'true' : undefined}
                    onClick={chip.onClick}
                  >
                    {used ? `✓ ${chip.label}` : chip.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <ComposerForm key={conv.id} convId={conv.id} onConversationUpdated={onConversationUpdated} />
      </div>
    </section>
  );
}
