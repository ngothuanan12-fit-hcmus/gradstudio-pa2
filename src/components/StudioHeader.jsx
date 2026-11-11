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
          GradStudio
        </a>
        <span className="st-brand-tag">Quản lý studio</span>
      </div>

      <nav className="st-header-nav" aria-label="Điều hướng studio">
        <a href="quan-ly.html" aria-current="page" className="st-nav-item is-active">
          <span>Hội thoại</span>
          <span className="st-nav-count">5</span>
        </a>

        <button
          type="button"
          onClick={onToggleBooking}
          aria-expanded={isBookingOpen}
          className={isBookingOpen ? 'st-nav-item is-active' : 'st-nav-item'}
        >
          <span>Booking mới</span>
        </button>

        <button
          type="button"
          onClick={onToggleResource}
          aria-expanded={isResourceOpen}
          className={isResourceOpen ? 'st-nav-item is-active' : 'st-nav-item'}
        >
          <span>Lịch tài nguyên</span>
        </button>

        <a href="lich-chup.html" className="st-nav-item">
          <span>Khách hàng: Lịch chụp GS-1024</span>
        </a>
      </nav>

      <div className="st-header-user">
        <div className="st-staff-profile">
          <img
            src={staffThaoAvatar}
            alt="Ảnh đại diện nhân viên Thảo"
            width="36"
            height="36"
            className="st-staff-avatar"
          />
          <span className="st-staff-name">
            <strong>Thảo</strong>
            <span className="st-staff-role"> · Quản lý studio</span>
          </span>
        </div>
      </div>
    </header>
  );
}
