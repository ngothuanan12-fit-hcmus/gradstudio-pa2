import { Link, useParams } from 'react-router';
import { api } from '../api/client.js';
import Button from '../components/Button.jsx';
import MessageList from '../components/chat/MessageList.jsx';
import DataState from '../components/DataState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TextField from '../components/TextField.jsx';
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

// Step G3 (and G6 on the customer's side, next): one conversation with the studio. What was sent shows here, from the
// API's answer, with no page reload; the message box sits under the messages, in the page's own flow.
export default function Conversation() {
  const { id } = useParams();
  const conversation = useApi(`/conversations/${id}`);

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
            <p className="conv-status-line">
              Trạng thái: <StatusBadge tone={CONVERSATION_TONE[c.status]}>{c.status}</StatusBadge>
            </p>
            <section className="chat-block" aria-label="Tin nhắn">
              {c.messages.length ? (
                <MessageList messages={c.messages} viewer="customer" />
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
