import { Link, useLocation } from 'react-router';
import useAuth from '../auth/useAuth.js';
import AccountBar from '../components/AccountBar.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

// The studio's screens (Admin, staff, Superadmin), light theme. Access is checked by RequireRole on the route; this is
// only the layout. Admin routes show Hội thoại + Booking in both workspace and page variants; staff and superadmin
// never see Admin links.
export default function AdminLayout({
  title = 'Quản lý booking: GradStudio',
  sections = [],
  variant = 'page',
  scheduleOpen = false,
  onOpenSchedule,
  scheduleTriggerRef,
  children,
}) {
  usePageMeta(title, 'studio');
  const auth = useAuth();
  const { pathname } = useLocation();
  const isAdmin = auth.user?.role === 'admin';
  const isConvRoute = pathname === '/quan-ly' || pathname.startsWith('/quan-ly/hoi-thoai');
  const isBookingRoute = pathname === '/quan-ly/booking' || pathname.startsWith('/quan-ly/booking/');

  if (variant === 'workspace') {
    return (
      <div className="admin-shell">
        <header className="admin-header">
          <div className="admin-header-left">
            <Link className="page-brand" to="/">
              GradStudio
            </Link>
            <span className="page-role">Quản lý studio · {auth.user?.name || 'Admin'}</span>
          </div>
          <nav className="admin-nav" aria-label="Điều hướng quản lý">
            {isAdmin ? (
              <>
                <Link
                  to="/quan-ly"
                  className={isConvRoute ? 'admin-nav-link is-active' : 'admin-nav-link'}
                  aria-current={isConvRoute ? 'page' : undefined}
                >
                  Hội thoại
                </Link>
                <Link
                  to="/quan-ly/booking"
                  className={isBookingRoute ? 'admin-nav-link is-active' : 'admin-nav-link'}
                  aria-current={isBookingRoute ? 'page' : undefined}
                >
                  Booking
                </Link>
              </>
            ) : null}
            {onOpenSchedule ? (
              <button
                ref={scheduleTriggerRef}
                type="button"
                className="page-nav-btn"
                aria-haspopup="dialog"
                aria-expanded={scheduleOpen}
                aria-controls="schedule-sheet"
                onClick={onOpenSchedule}
              >
                Lịch thợ và phòng
              </button>
            ) : null}
            <Link className="admin-nav-link" to="/">
              Trang khách
            </Link>
            <AccountBar />
          </nav>
        </header>
        <main className="admin-workspace-main">{children}</main>
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <Link className="page-brand" to="/">
          GradStudio
        </Link>
        {isAdmin ? (
          <nav className="page-nav" aria-label="Điều hướng quản lý">
            <ul>
              <li>
                <Link
                  to="/quan-ly"
                  className={isConvRoute ? 'is-active' : undefined}
                  aria-current={isConvRoute ? 'page' : undefined}
                >
                  Hội thoại
                </Link>
              </li>
              <li>
                <Link
                  to="/quan-ly/booking"
                  className={isBookingRoute ? 'is-active' : undefined}
                  aria-current={isBookingRoute ? 'page' : undefined}
                >
                  Booking
                </Link>
              </li>
              <li>
                <Link to="/">Trang khách</Link>
              </li>
            </ul>
          </nav>
        ) : sections.length ? (
          <nav className="page-nav" aria-label="Các phần của trang">
            <ul>
              {sections.map((s) => (
                <li key={s.href}>
                  <a href={s.href}>{s.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <AccountBar />
      </header>
      <main className="page-main admin-main">{children}</main>
      <footer className="page-footer">GradStudio. Bản mẫu cho môn CSC13008, dữ liệu minh họa.</footer>
    </>
  );
}
