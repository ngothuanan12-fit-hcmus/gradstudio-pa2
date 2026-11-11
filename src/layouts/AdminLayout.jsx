// Studio management page. A separate layout, not access control: anyone can open this path.
export default function AdminLayout({ children }) {
  return (
    <>
      <header className="page-header">
        <a className="page-brand" href="index.html">GradStudio</a>
        <p className="page-role">Quản lý studio · Thảo</p>
        {/* Links within this page: it is long on a phone. Each one opens a section that is really there. */}
        <nav className="page-nav" aria-label="Các phần của trang quản lý">
          <ul>
            <li><a href="#hoi-thoai">Hội thoại</a></li>
            <li><a href="#booking-moi">Booking mới</a></li>
            <li><a href="#lich-tai-nguyen">Lịch tài nguyên</a></li>
          </ul>
        </nav>
      </header>
      <main className="page-main">{children}</main>
      <footer className="page-footer">GradStudio. Bản mẫu cho môn CSC13008, dữ liệu minh họa.</footer>
    </>
  );
}
