import StatusBadge from './StatusBadge.jsx';

// Each row is a button, at least 44px tall. Selection is aria-current, so it
// survives a screen reader and a greyscale screenshot.
export default function ConversationList({ items = [], activeId, onSelect }) {
  if (!items.length) {
    return <p className="empty">Không có hội thoại khớp. Thử từ khóa khác hoặc bỏ bộ lọc.</p>;
  }

  return (
    <ul className="conv-list" aria-label="Hội thoại">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className="conv"
            aria-current={item.id === activeId ? 'true' : undefined}
            onClick={() => onSelect(item.id)}
          >
            <span className="conv-avatar" aria-hidden="true">{item.name.charAt(0)}</span>
            <span className="conv-body">
              <span className="conv-top">
                <span className="conv-name">{item.name}</span>
                <StatusBadge tone={item.status}>{item.statusLabel}</StatusBadge>
              </span>
              <span className="conv-last">{item.last}</span>
            </span>
            <span className="conv-meta">
              <span className="conv-time">{item.time}</span>
              {item.unread ? (
                <span className="conv-unread">
                  {item.unread}
                  <span className="sr-only"> tin chưa đọc</span>
                </span>
              ) : null}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}