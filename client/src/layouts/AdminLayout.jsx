import { Link } from 'react-router';
import AccountBar from '../components/AccountBar.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

// Studio management screens, light theme. Access is checked by RequireRole on the route; this is only the layout.
export default function AdminLayout({ title = 'Quản lý booking: GradStudio', children }) {
  usePageMeta(title, 'studio');
  return (
    <>
      <header className="page-header">
        <Link className="page-brand" to="/">
          GradStudio
        </Link>
        {/* Links within this page: it is long on a phone. Each one opens a section that is really there. */}
        <nav className="page-nav" aria-label="Các phần của trang quản lý">
          <ul>
            <li>
              <a href="#hoi-thoai">Hội thoại</a>
            </li>
            <li>
              <a href="#booking-moi">Booking mới</a>
            </li>
            <li>
              <a href="#lich-tai-nguyen">Lịch tài nguyên</a>
            </li>
          </ul>
        </nav>
        <AccountBar />
      </header>
      <main className="page-main admin-main">{children}</main>
      <footer className="page-footer">GradStudio. Bản mẫu cho môn CSC13008, dữ liệu minh họa.</footer>
    </>
  );
}
