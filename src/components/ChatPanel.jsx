import { useState } from 'react';
import Button from './Button.jsx';

// `onSend` keeps the message on this page. Without it the form uses `action`,
// which is how index.html reaches the management page. Empty text never posts.
export default function ChatPanel({
  id = 'chat',
  title = 'Chat với studio',
  label = 'Tin nhắn',
  placeholder = 'Nhập tin nhắn cho studio',
  messages = [],
  onSend,
  action,
  sendVariant = 'primary',
  emptyText = 'Chưa có tin nhắn trong hội thoại này.',
}) {
  const [text, setText] = useState('');
  const inputId = `${id}-input`;

  function handleSubmit(event) {
    if (!onSend) return;
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText('');
  }

  return (
    <section className="panel chat" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{title}</h2>
      <div className="chat-log" role="log" aria-live="polite">
        {messages.length ? messages.map((message) => (
          <article key={message.id} className={message.me ? 'chat-msg chat-msg-me' : 'chat-msg'}>
            {!message.me && message.who ? <span className="chat-who">{message.who}</span> : null}
            <p className="chat-text">{message.text}</p>
            {message.time ? <time className="chat-time">{message.time}</time> : null}
          </article>
        )) : <p className="empty">{emptyText}</p>}
      </div>
      <form className="chat-form" action={action} onSubmit={handleSubmit}>
        <label className="field-label" htmlFor={inputId}>{label}</label>
        <div className="chat-row">
          <input
            className="input chat-input"
            id={inputId}
            type="text"
            placeholder={placeholder}
            autoComplete="off"
            required
            value={onSend ? text : undefined}
            onChange={onSend ? (event) => setText(event.target.value) : undefined}
          />
          <Button variant={sendVariant} type="submit">Gửi</Button>
        </div>
      </form>
    </section>
  );
}