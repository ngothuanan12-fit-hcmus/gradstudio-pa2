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
          {messages.map((message, i) => {
            const own = viewer === 'studio' ? message.me : !message.me;
            // Messages in a row from the same side form a group: the name only on the first, the time only on the last.
            const first = !messages[i - 1] || messages[i - 1].me !== message.me;
            const last = !messages[i + 1] || messages[i + 1].me !== message.me;
            const place = `${first ? ' is-first' : ''}${last ? ' is-last' : ''}`;
            return (
              <li key={message.id} className={`${own ? 'chat-msg chat-msg-me' : 'chat-msg'}${place}`}>
                {!own && message.who && first ? <span className="chat-who">{message.who}</span> : null}
                {message.quote ? (
                  <>
                    <p className="chat-quote-title">Báo giá</p>
                    <dl className="chat-quote">
                      {message.quote.map(([term, value]) => (
                        <div key={term}><dt>{term}</dt><dd>{value}</dd></div>
                      ))}
                    </dl>
                  </>
                ) : <p>{message.text}</p>}
                {message.time && last ? <time className="chat-time">{message.time}</time> : null}
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
          {/* While sending is not available the button is not styled as the page's primary action. */}
          <Button variant={disabled ? 'secondary' : 'primary'} type="submit" disabled={disabled}>Gửi</Button>
        </div>
        {note ? <p className="chat-note" id={noteId}>{note}</p> : null}
      </form>
    </section>
  );
}
