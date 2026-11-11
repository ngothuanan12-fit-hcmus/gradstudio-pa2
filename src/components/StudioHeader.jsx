import { staffThaoAvatar } from '../data.js';

export default function StudioHeader({
  onToggleBooking,
  onToggleResource,
  isBookingOpen = false,
  isResourceOpen = false,
}) {
  return (
    <header className="st-header">
      <div className="st-header-brand">
        <a href="index.html" className="st-logo">
          Grad<span>Studio</span>
        </a>
        <span className="st-brand-tag">Studio</span>
      </div>

      <nav className="st-header-nav" aria-label="Điều hướng studio">
        <button type="button" className="st-nav-item is-active">
          <span>Hội thoại</span>
          <span className="st-nav-count">3</span>
        </button>

        <button
          type="button"
          onClick={onToggleBooking}
          className={isBookingOpen ? 'st-nav-item is-active' : 'st-nav-item'}
        >
          <span>Booking</span>
          {isBookingOpen ? <span className="st-nav-dot" /> : null}
        </button>

        <button
          type="button"
          onClick={onToggleResource}
          className={isResourceOpen ? 'st-nav-item is-active' : 'st-nav-item'}
        >
          <span>Lịch studio</span>
          {isResourceOpen ? <span className="st-nav-dot" /> : null}
        </button>

        <button
          type="button"
          onClick={onToggleResource}
          className={isResourceOpen ? 'st-nav-item is-active' : 'st-nav-item'}
        >
          <span>Tài nguyên</span>
        </button>

        <a href="lich-chup.html" className="st-nav-item">
          <span>Lịch chụp khách</span>
        </a>
      </nav>

      <div className="st-header-user">
        <button type="button" aria-label="Thông báo" className="st-bell-btn">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M5 8a5 5 0 0 1 10 0c0 4 1.5 5.5 1.5 5.5h-13S5 12 5 8ZM8.5 16.5a1.6 1.6 0 0 0 3 0"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="st-bell-dot" />
        </button>

        <div className="st-staff-profile">
          <img src={staffThaoAvatar} alt="Thảo" className="st-staff-avatar" />
          <span className="st-staff-name">
            <strong>Thảo</strong>
            <span className="st-staff-role"> · Quản lý studio</span>
          </span>
        </div>
      </div>
    </header>
  );
}
