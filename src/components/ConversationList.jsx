// Each row is a button, at least 44px tall. Selection is aria-current, so it
// survives a screen reader and a greyscale screenshot. The status shows twice: an icon on the avatar for a quick
// scan (its own shape per status), and its name beside the time, so it never rests on colour alone.
import Icon from './Icon.jsx';
import StatusBadge from './StatusBadge.jsx';
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
            <span className="conv-body">
              {/* Time and status travel together: beside the name when there is room, under it when there is not,
                  so the name is never squeezed. */}
              <span className="conv-top">
                <span className="conv-name">{item.name}</span>
                <span className="conv-meta">
                  <span className="conv-time">{item.time}</span>
                  <StatusBadge tone={item.tone}>{item.statusLabel}</StatusBadge>
                  {item.unread ? (
                    <span className="conv-unread">
                      {item.unread}
                      <span className="sr-only"> tin chưa đọc</span>
                    </span>
                  ) : null}
                </span>
              </span>
              <span className="conv-last">{item.last}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
