import { useState } from 'react';

const GALLERY_IMAGES = [
  {
    url: './photos/tot-nghiep-960.webp',
    thumb: './photos/tot-nghiep-480.webp',
    title: 'Tốt nghiệp cá nhân',
    category: 'Gói Chụp Premium · Cử nhân',
  },
  {
    url: './photos/ky-yeu-960.webp',
    thumb: './photos/ky-yeu-480.webp',
    title: 'Ảnh kỷ yếu tập thể',
    category: 'Kỷ yếu nhóm & Bạn bè · Ngoài trời',
  },
  {
    url: './photos/chan-dung-960.webp',
    thumb: './photos/chan-dung-480.webp',
    title: 'Ảnh CV & Profile chuyên nghiệp',
    category: 'Studio Portrait · Chân dung công sở',
  },
];

const DAYS_IN_WEEK = [
  { label: 'T2', date: 19 },
  { label: 'T3', date: 20 },
  { label: 'T4', date: 21 },
  { label: 'T5', date: 22 },
  { label: 'T6', date: 23 },
  { label: 'T7', date: 24, isShootDay: true },
  { label: 'CN', date: 25 },
];

export default function LichChup() {
  const [activeTab, setActiveTab] = useState('all');
  const [isDepositPaid, setIsDepositPaid] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const currentImage = GALLERY_IMAGES[activeImageIndex];

  const tabCounts = {
    all: 1,
    pending: isDepositPaid ? 0 : 1,
    confirmed: isDepositPaid ? 1 : 0,
    done: 0,
  };

  const hasItemsForTab =
    activeTab === 'all' ||
    (activeTab === 'pending' && !isDepositPaid) ||
    (activeTab === 'confirmed' && isDepositPaid);

  const tabs = [
    ['all', 'Tất cả', tabCounts.all],
    ['pending', 'Chờ cọc', tabCounts.pending],
    ['confirmed', 'Đã đặt lịch', tabCounts.confirmed],
    ['done', 'Hoàn thành', tabCounts.done],
  ];

  return (
    <div className="ps-page">
      {/* Header */}
      <header className="ps-header">
        <div className="ps-header-brand">
          <a href="index.html" className="ps-logo">
            Grad<span>Studio</span>
          </a>
          <span className="ps-brand-tag">Khách hàng</span>
        </div>

        <nav className="ps-header-nav" aria-label="Điều hướng khách hàng">
          <a href="index.html" className="ps-nav-link">
            Trang chủ
          </a>
          <span className="ps-nav-active">Lịch chụp của tôi</span>
          <a href="quan-ly.html" className="ps-nav-studio-pill">
            Quản lý Studio
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="ps-main">
        {/* Title & Introduction */}
        <div className="ps-title-row">
          <div>
            <h1 className="ps-title">Lịch chụp của tôi</h1>
            <p className="ps-subtitle">
              Xem lại lịch đã thống nhất với studio và thanh toán cọc để giữ lịch.
            </p>
          </div>
        </div>

        {/* Tab filters */}
        <div role="tablist" aria-label="Lọc trạng thái lịch chụp" className="ps-tabs">
          {tabs.map(([tabKey, tabLabel, count]) => (
            <button
              key={tabKey}
              type="button"
              role="tab"
              aria-selected={activeTab === tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={activeTab === tabKey ? 'ps-tab is-active' : 'ps-tab'}
            >
              <span>{tabLabel}</span>
              <span className="ps-tab-count">{count}</span>
            </button>
          ))}
        </div>

        {/* Content Section or Empty State */}
        {!hasItemsForTab ? (
          <div className="ps-empty-card">
            <div className="ps-empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <h2 className="ps-empty-title">
              {activeTab === 'done'
                ? 'Chưa có buổi chụp nào hoàn thành'
                : activeTab === 'confirmed'
                ? 'Chưa có lịch chụp đã đặt'
                : 'Không có lịch chụp chờ cọc'}
            </h2>
            <p className="ps-empty-desc">
              {activeTab === 'done'
                ? 'Sau khi buổi chụp diễn ra và studio bàn giao ảnh hoàn thiện, các bộ ảnh lưu niệm sẽ được lưu tại đây.'
                : activeTab === 'confirmed'
                ? 'Hãy hoàn tất thanh toán cọc 30% cho booking đang chờ để xác nhận giữ lịch chính thức.'
                : 'Bạn đã hoàn tất thanh toán cọc hoặc chưa có yêu cầu chụp nào đang chờ xử lý.'}
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="ps-empty-btn"
            >
              Xem tất cả lịch chụp ({tabCounts.all})
            </button>
          </div>
        ) : (
          /* Editorial 2-column layout: 68% Left | 32% Right */
          <div className="ps-editorial-grid">
            {/* Left Column (68%): Editorial Hero Gallery + Week Calendar & Timeline */}
            <div className="ps-left-col">
              {/* Hero Image Gallery */}
              <div className="ps-hero-gallery">
                <img
                  src={currentImage.url}
                  alt={currentImage.title}
                  key={currentImage.url}
                  className="ps-hero-img"
                />

                {/* Editorial bottom gradient & title */}
                <div className="ps-hero-overlay">
                  <div className="ps-hero-caption">
                    <p className="ps-hero-kicker">{currentImage.category}</p>
                    <p className="ps-hero-title">{currentImage.title}</p>
                  </div>

                  {/* 3 Thumbnails in bottom right corner */}
                  <div className="ps-hero-thumbs">
                    {GALLERY_IMAGES.map((img, idx) => (
                      <button
                        key={img.title}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={activeImageIndex === idx ? 'ps-thumb-btn is-active' : 'ps-thumb-btn'}
                        aria-label={`Xem ảnh: ${img.title}`}
                      >
                        <img src={img.thumb} alt={img.title} className="ps-thumb-img" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Calendar & Timeline */}
              <div className="ps-calendar-section">
                {/* Month & Week Row */}
                <div className="ps-month-head">
                  <div>
                    <h2 className="ps-month-title">Tháng 10, 2026</h2>
                    <p className="ps-month-sub">Lịch chụp dự kiến tại Studio</p>
                  </div>
                  <span className="ps-week-tag">Tuần 43</span>
                </div>

                {/* Week Days Strip */}
                <div className="ps-week-strip">
                  {DAYS_IN_WEEK.map((d) => {
                    const isSelected = Boolean(d.isShootDay);
                    const cellClass = isSelected
                      ? isDepositPaid
                        ? 'ps-day-cell is-selected is-paid'
                        : 'ps-day-cell is-selected'
                      : 'ps-day-cell';
                    return (
                      <div key={d.date} className={cellClass}>
                        <span className="ps-day-label">{d.label}</span>
                        <span className="ps-day-num">{d.date}</span>
                        <span className={isSelected ? 'ps-day-dot is-visible' : 'ps-day-dot'} />
                      </div>
                    );
                  })}
                </div>

                {/* Timeline Milestones */}
                <div className="ps-milestones-section">
                  <div className="ps-milestones-head">
                    <p className="ps-milestones-kicker">
                      Thứ Bảy, 24/10 · Lịch trình của Linh
                    </p>
                    <span className="ps-milestones-count">3 mốc thời gian</span>
                  </div>

                  <div className="ps-milestones-list">
                    {/* 09:00 Initial slot */}
                    <div className="ps-milestone-row">
                      <span className="ps-milestone-time is-struck">09:00</span>
                      <div className="ps-milestone-body is-dashed">
                        <p className="ps-milestone-title is-muted">Giờ bạn yêu cầu ban đầu</p>
                        <p className="ps-milestone-sub is-muted">Thợ makeup đã kín lịch lúc này</p>
                      </div>
                    </div>

                    {/* 13:00 Makeup */}
                    <div className="ps-milestone-row">
                      <span className={isDepositPaid ? 'ps-milestone-time is-paid' : 'ps-milestone-time is-gold'}>
                        13:00
                      </span>
                      <div className="ps-milestone-body is-gold">
                        <div className="ps-milestone-top">
                          <p className="ps-milestone-title">Makeup với Mai</p>
                          <span className="ps-milestone-range">13:00 – 14:00</span>
                        </div>
                        <p className="ps-milestone-sub">
                          Có mặt sớm 10 phút để chuẩn bị trang phục
                        </p>
                      </div>
                    </div>

                    {/* 14:00 Shoot */}
                    <div className="ps-milestone-row">
                      <span className={isDepositPaid ? 'ps-milestone-time is-paid' : 'ps-milestone-time is-accent'}>
                        14:00
                      </span>
                      <div className="ps-milestone-body is-accent">
                        <div className="ps-milestone-top">
                          <p className="ps-milestone-title">Chụp ảnh tốt nghiệp tại Phòng B</p>
                          <span className="ps-milestone-range">14:00 – 16:00</span>
                        </div>
                        <p className="ps-milestone-sub">
                          Thợ chụp: Tuấn · Gói Premium 2 giờ · 30 ảnh chỉnh
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (32%): Resort Booking Folio */}
            <aside className="ps-folio" aria-label="Thông tin đặt lịch #GS-1024">
              <div className="ps-folio-head">
                <div>
                  <p className="ps-folio-kicker">Mã đặt lịch</p>
                  <h3 className="ps-folio-code">Booking #GS-1024</h3>
                </div>
                <div className="ps-folio-status">
                  {isDepositPaid ? (
                    <span className="ps-status-pill is-paid">
                      <span className="ps-status-dot" />
                      Đã đặt lịch
                    </span>
                  ) : (
                    <span className="ps-status-pill is-pending">
                      <span className="ps-status-dot is-pulse" />
                      Chờ cọc 30%
                    </span>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div className="ps-folio-details">
                <div className="ps-folio-row">
                  <span>Khách hàng</span>
                  <strong>Nguyễn Thùy Linh</strong>
                </div>
                <div className="ps-folio-row">
                  <span>Gói dịch vụ</span>
                  <strong>Tốt nghiệp Premium</strong>
                </div>
                <div className="ps-folio-row">
                  <span>Tổng giá trị</span>
                  <strong>1.800.000đ</strong>
                </div>
                <div className="ps-folio-total-row">
                  <span>Cọc giữ lịch (30%)</span>
                  <strong className="ps-folio-deposit">540.000đ</strong>
                </div>
              </div>

              {/* Payment Action */}
              <div className="ps-folio-action">
                {isDepositPaid ? (
                  <div className="ps-paid-box">
                    ✓ Đã thanh toán cọc thành công! Lịch của bạn đã được xác nhận chính thức.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDepositPaid(true)}
                    className="ps-pay-btn"
                  >
                    Thanh toán cọc 540.000đ
                  </button>
                )}
              </div>

              <p className="ps-folio-note">
                Hỗ trợ thanh toán chuyển khoản ngân hàng qua mã QR VietQR.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
