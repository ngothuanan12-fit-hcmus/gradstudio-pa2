import { useEffect, useRef } from 'react';
import Icon from '../Icon.jsx';
import AdminResourceSchedule from './AdminResourceSchedule.jsx';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// Accessible modal dialog wrapping AdminResourceSchedule with backdrop blur, strict focus trap, and focus restoration.
export default function ScheduleSheet({
  open,
  onClose,
  triggerRef,
  initialDate,
  draftSlot,
  staffQuery,
  roomsQuery,
  onSelectSlot,
}) {
  const backdropRef = useRef(null);
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const popoverOpenRef = useRef(false);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = triggerRef?.current || document.activeElement;
    document.body.classList.add('modal-open');

    const focusFrame = requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        if (popoverOpenRef.current) {
          event.preventDefault();
          popoverOpenRef.current = false;
          const closePopoverBtn = dialogRef.current?.querySelector('.ep-close-btn');
          if (closePopoverBtn) {
            closePopoverBtn.click();
            return;
          }
        }
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
          (el) => el.getClientRects().length > 0,
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey) {
          if (document.activeElement === first || !dialogRef.current.contains(document.activeElement)) {
            event.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last || !dialogRef.current.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="sheet-backdrop"
      onMouseDown={(event) => {
        if (event.target === backdropRef.current) onClose();
      }}
    >
      <div
        ref={dialogRef}
        id="schedule-sheet"
        className="sheet-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-sheet-title"
      >
        <div className="sheet-header">
          <h2 id="schedule-sheet-title" className="heading">
            Lịch thợ và phòng
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="sheet-close-btn"
            aria-label="Đóng lịch thợ và phòng"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="sheet-content">
          <AdminResourceSchedule
            key={initialDate || '2026-10-24'}
            initialDate={initialDate}
            draftSlot={draftSlot}
            staffQuery={staffQuery}
            roomsQuery={roomsQuery}
            onSelectSlot={onSelectSlot}
            popoverOpenRef={popoverOpenRef}
          />
        </div>
      </div>
    </div>
  );
}
