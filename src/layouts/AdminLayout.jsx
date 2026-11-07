// Studio management page. A separate layout, not access control: anyone can open this path.
export default function AdminLayout({ children }) {
  return (
    <>
      <header className="page-header">
        <a className="page-brand" href="index.html">GradStudio</a>
        <nav className="page-nav" aria-label="Trang quản lý">
          <ul>
            <li><a href="quan-ly.html" aria-current="page">Quản lý booking</a></li>
          </ul>
        </nav>
      </header>
      <main className="page-main">{children}</main>
      <footer className="page-footer">GradStudio. Bản mẫu cho môn CSC13008, dữ liệu minh họa.</footer>
    </>
  );
}
