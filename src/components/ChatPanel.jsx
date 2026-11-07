import Button from './Button.jsx';

// `action` is the next page in the main flow. The form submits normally, with no preventDefault.
// The input has no name, so nothing is added to the address.
export default function ChatPanel({ id, label, messages = [], action, placeholder }) {
  const inputId = `${id}-input`;
  return (
    <section className="chat" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="summary-title">Chat với studio</h2>
      <ol className="chat-log">
        {messages.map((message) => (
          <li key={message.id} className={message.me ? 'chat-msg chat-msg-me' : 'chat-msg'}>
            <span className="chat-who">{message.who}</span>
            <p>{message.text}</p>
            <time className="chat-time">{message.time}</time>
          </li>
        ))}
      </ol>
      <form className="chat-form" action={action}>
        <label className="chat-label" htmlFor={inputId}>{label}</label>
        <div className="chat-row">
          <input className="chat-input" id={inputId} type="text" placeholder={placeholder} autoComplete="off" />
          <Button type="submit">Gửi</Button>
        </div>
      </form>
    </section>
  );
}
