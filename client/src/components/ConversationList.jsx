// Each row is a button, at least 44px tall. Selection is aria-current, so it
// survives a screen reader and a greyscale screenshot. The status shows twice: an icon on the avatar for a quick
// scan (its own shape per status), and its name beside the time, so it never rests on colour alone.
import Icon from './Icon.jsx';
import { STATUS_ICON } from '../utils/status.js';

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
            <span className="conv-avatar" aria-hidden="true">
              {item.name.charAt(0)}
              <span className={`conv-status st-${item.status}`}><Icon name={STATUS_ICON[item.status]} /></span>
            </span>
            {/* Like a messaging app: name and time on the first line, the last message and the unread count on the
                second, the status (icon and name) on the third. Only the short time sits beside the name, so a long
                name wraps instead of being squeezed. */}
            <span className="conv-body">
              <span className="conv-line">
                <span className="conv-name">{item.name}</span>
                <span className="conv-time">{item.time}</span>
              </span>
              <span className="conv-line">
                <span className="conv-last">{item.last}</span>
                {item.unread ? (
                  <span className="conv-unread">
                    {item.unread}
                    <span className="sr-only"> tin chưa đọc</span>
                  </span>
                ) : null}
              </span>
              <span className={`conv-state st-${item.status}`}>
                <Icon name={STATUS_ICON[item.status]} /> {item.statusLabel}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
