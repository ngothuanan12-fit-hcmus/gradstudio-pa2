import { Link, NavLink, useLocation } from 'react-router';
import useAuth from '../auth/useAuth.js';
import AccountBar from '../components/AccountBar.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

// The studio's screens (Admin, staff, Superadmin), light theme. Access is checked by RequireRole on the route; this is
// only the layout. Default mode preserves sections links for QuanTri and ComingSoon; variant="workspace" renders the
// 3-column Admin management header without a footer pushing the viewport grid off-screen.
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

  if (variant === 'workspace') {
    const isConvRoute = pathname.startsWith('/quan-ly');
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
            <NavLink
              to="/quan-ly"
              className={() => (isConvRoute ? 'admin-nav-link is-active' : 'admin-nav-link')}
              aria-current={isConvRoute ? 'page' : undefined}
            >
              Hội thoại
            </NavLink>
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
        {sections.length ? (
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
