// Customer pages. Includes the header, menu and footer landmarks.
// `wide` lets a page run edge to edge and set its own section widths.
export default function CustomerLayout({ current, wide = false, children }) {
  return (
    <>
      <header className="page-header">
        <a className="page-brand" href="index.html">GradStudio</a>
        <nav className="page-nav" aria-label="Trang khách">
          <ul>
            <li><a href="index.html" aria-current={current === 'home' ? 'page' : undefined}>Trang chủ</a></li>
            <li><a href="lich-chup.html" aria-current={current === 'schedule' ? 'page' : undefined}>Lịch chụp của tôi</a></li>
          </ul>
        </nav>
      </header>
      <main className={wide ? 'page-main-wide' : 'page-main'}>{children}</main>
      <footer className="page-footer">GradStudio. Bản mẫu cho môn CSC13008, dữ liệu minh họa.</footer>
    </>
  );
}
