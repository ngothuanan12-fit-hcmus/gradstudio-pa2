import { Link } from 'react-router';
import AccountBar from '../components/AccountBar.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

// The studio's screens (Admin, staff, Superadmin), light theme. Access is checked by RequireRole on the route; this is
// only the layout. `sections` are links within a long page, given by the page that has those sections, so no screen
// shows a link to a part it does not have.
export default function AdminLayout({ title = 'Quản lý booking: GradStudio', sections = [], children }) {
  usePageMeta(title, 'studio');
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
