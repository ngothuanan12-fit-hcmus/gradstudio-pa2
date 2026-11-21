import { useRef } from 'react';
import { Link, useParams } from 'react-router';
import { api } from '../api/client.js';
import Button from '../components/Button.jsx';
import MessageList from '../components/chat/MessageList.jsx';
import DataState from '../components/DataState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TextField from '../components/TextField.jsx';
import useAction from '../forms/useAction.js';
import useForm from '../forms/useForm.js';
import useApi from '../hooks/useApi.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import { CONVERSATION_TONE } from '../utils/status.js';
import '../styles/chat.css';

function validate({ text }) {
  if (!text.trim()) return { text: 'Nhập tin nhắn.' };
  if (text.length > 1000) return { text: 'Tin nhắn tối đa 1000 ký tự.' };
  return {};
}

// Steps G3 and G6 (the customer's side): one conversation with the studio, and the answer to a proposed time.
// What was sent shows here, from the API's answer, with no page reload; the message box sits under the messages, in
// the page's own flow.
export default function Conversation() {
  const { id } = useParams();
  const conversation = useApi(`/conversations/${id}`);
  const answer = useAction();
  const statusLine = useRef(null);

  // Agree or decline the open proposal; the screen shows the API's answer. The two buttons go away with the open
  // proposal, so the focus moves to the conversation's status line, which now reads the new status.
  function reply(proposal, choice) {
    answer.run(async () => {
      const updated = await api(`/conversations/${id}/proposals/${proposal.id}/answer`, {
        method: 'POST',
        body: { answer: choice },
      });
      conversation.setData(updated);
      statusLine.current?.focus();
    });
  }

  const proposalActions = (proposal) => (
    <div className="proposal-actions">
      {answer.error ? (
        <p className="form-error" role="alert">
          {answer.error}
        </p>
      ) : null}
      <Button aria-disabled={answer.busy ? 'true' : undefined} onClick={() => reply(proposal, 'agree')}>
        Đồng ý giờ này
      </Button>
      <Button
        variant="secondary"
        aria-disabled={answer.busy ? 'true' : undefined}
        onClick={() => reply(proposal, 'decline')}
      >
        Chưa đồng ý
      </Button>
    </div>
  );

  const form = useForm({
    initial: { text: '' },
    validate,
    onSubmit: async ({ text }) => {
      const updated = await api(`/conversations/${id}/messages`, { method: 'POST', body: { text: text.trim() } });
      conversation.setData(updated);
      form.reset();
    },
  });

  return (
    <CustomerLayout title="Hội thoại với studio: GradStudio">
      <p className="back-link">
        <Link to="/tu-van">‹ Tất cả hội thoại</Link>
      </p>
      <h1 className="page-title">Hội thoại với GradStudio</h1>
      <DataState query={conversation} isEmpty={() => false} loadingLabel="Đang tải hội thoại…">
        {(c) => (
          <>
            <p className="conv-status-line" ref={statusLine} tabIndex={-1}>
              Trạng thái: <StatusBadge tone={CONVERSATION_TONE[c.status]}>{c.status}</StatusBadge>
            </p>
            <section className="chat-block" aria-label="Tin nhắn">
              {c.messages.length ? (
                <MessageList messages={c.messages} viewer="customer" proposalActions={proposalActions} />
              ) : (
                <EmptyState>Chưa có tin nhắn nào.</EmptyState>
              )}
            </section>
            <form className="chat-form" noValidate onSubmit={form.handleSubmit}>
              {form.formError ? (
                <p className="form-error" role="alert">
                  {form.formError}
                </p>
              ) : null}
              <TextField id="reply-text" as="textarea" rows={3} label="Tin nhắn cho studio" {...form.field('text')} />
              <Button {...form.submitProps}>{form.busy ? 'Đang gửi…' : 'Gửi'}</Button>
            </form>
          </>
        )}
      </DataState>
    </CustomerLayout>
  );
}
