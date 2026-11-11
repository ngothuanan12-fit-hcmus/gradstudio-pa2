import Button from './Button.jsx';

// A plain conversation. Sending a message has no next page in PA#2, so the
// send button is disabled with a visible note. `action` is only for the landing
// page, where the form opens the management page. `viewer` says whose side the
// page is on: messages from that side sit on the right, with no name.
export default function ChatPanel({
  id,
  title = 'Chat với studio',
  label,
  messages = [],
  action,
  placeholder,
  disabled = false,
  note,
  emptyText = 'Chưa có tin nhắn trong hội thoại này.',
  viewer = 'studio',
  afterMessages = null,
}) {
  const inputId = `${id}-input`;
  const noteId = `${id}-note`;
  return (
    <section className="chat" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="summary-title">{title}</h2>
      {messages.length ? (
        <ol className="chat-log">
          {messages.map((message) => {
            const own = viewer === 'studio' ? message.me : !message.me;
            return (
              <li key={message.id} className={own ? 'chat-msg chat-msg-me' : 'chat-msg'}>
                {!own && message.who ? <span className="chat-who">{message.who}</span> : null}
                <p>{message.text}</p>
                {message.time ? <time className="chat-time">{message.time}</time> : null}
              </li>
            );
          })}
        </ol>
      ) : <p className="empty">{emptyText}</p>}
      {/* Something that belongs to the conversation, such as the management page's booking card. */}
      {afterMessages}
      <form className="chat-form" action={action}>
        <label className="chat-label" htmlFor={inputId}>{label}</label>
        <div className="chat-row">
          <input
            className="chat-input"
            id={inputId}
            type="text"
            placeholder={placeholder}
            autoComplete="off"
            disabled={disabled}
            aria-describedby={note ? noteId : undefined}
          />
          <Button type="submit" disabled={disabled}>Gửi</Button>
        </div>
        {note ? <p className="chat-note" id={noteId}>{note}</p> : null}
      </form>
    </section>
  );
}
