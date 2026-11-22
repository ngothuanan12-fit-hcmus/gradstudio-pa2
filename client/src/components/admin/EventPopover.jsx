import { useEffect } from 'react';
import { vnDateLong } from '../../utils/date.js';
import Icon from '../Icon.jsx';

// Detail card shown inside the resource schedule modal when clicking a block.
export default function EventPopover({ event, popoverRef, onClose }) {
  useEffect(() => {
    if (!event) return undefined;
    function handleOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && !e.target.closest('[data-schedule-event]')) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [event, popoverRef, onClose]);

  if (!event) return null;

  return (
    <div
      ref={popoverRef}
      className={`event-popover kind-${event.kind || 'busy'}`}
      role="dialog"
      aria-label={`Chi tiết ${event.title}`}
    >
      <div className="ep-head">
        <div>
          <p className="ep-status">{event.statusLabel}</p>
          <h3 className="ep-title">{event.title}</h3>
        </div>
        <button type="button" className="ep-close-btn" aria-label="Đóng chi tiết lịch" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>

      <dl className="ep-kv">
        <div>
          <dt>Dịch vụ</dt>
          <dd>{event.service || 'Lịch studio'}</dd>
        </div>
        <div>
          <dt>Thời gian</dt>
          <dd>
            {vnDateLong(event.date)} · {event.from}–{event.to}
          </dd>
        </div>
        <div>
          <dt>Nhân sự</dt>
          <dd>{event.staff || '—'}</dd>
        </div>
        <div>
          <dt>Phòng</dt>
          <dd>{event.room || 'Không dùng phòng'}</dd>
        </div>
        {event.note ? (
          <div>
            <dt>Ghi chú</dt>
            <dd>{event.note}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
