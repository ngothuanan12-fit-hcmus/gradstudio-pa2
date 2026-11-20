import { Link, NavLink } from 'react-router';
import usePageMeta from '../hooks/usePageMeta.js';

// Customer screens, dark theme. Includes the header, menu and footer landmarks.
// `wide` lets a page run edge to edge and set its own section widths.
export default function CustomerLayout({ title = 'GradStudio: chụp ảnh tốt nghiệp', wide = false, children }) {
  usePageMeta(title, 'cinema');
  return (
    <>
      <header className="page-header">
        <Link className="page-brand" to="/">
          GradStudio
        </Link>
        <nav className="page-nav" aria-label="Trang khách">
          <ul>
            <li>
              <NavLink to="/" end>
                Trang chủ
              </NavLink>
            </li>
            <li>
              <NavLink to="/lich-chup">Lịch chụp của tôi</NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <main className={wide ? 'page-main-wide' : 'page-main'}>{children}</main>
      <footer className="page-footer">GradStudio. Bản mẫu cho môn CSC13008, dữ liệu minh họa.</footer>
    </>
  );
}
