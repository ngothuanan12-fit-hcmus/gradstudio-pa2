import { useState } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import '../styles/schedule.css';

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
    ['pending', 'Chờ cọc 30%', tabCounts.pending],
    ['confirmed', 'Đã đặt lịch', tabCounts.confirmed],
    ['done', 'Hoàn thành', tabCounts.done],
  ];

  return (
    <div className="ps-page">
      <header className="ps-header">
        <div className="ps-header-brand">
          <a href="index.html" className="ps-logo">
            GradStudio
          </a>
          <span className="ps-brand-tag">Khách hàng · Nguyễn Thùy Linh</span>
        </div>

        <nav className="ps-header-nav" aria-label="Điều hướng khách hàng">
          <a href="index.html" className="ps-nav-link">
            Trang chủ
          </a>
          <a href="lich-chup.html" aria-current="page" className="ps-nav-active">
            Lịch chụp của tôi
          </a>
          <a href="quan-ly.html" className="ps-nav-studio-pill">
            Quản lý studio
          </a>
        </nav>
      </header>

      <main className="ps-main">
        <div className="ps-title-row">
          <div>
            <h1 className="ps-title">Lịch chụp của tôi</h1>
            <p className="ps-subtitle">
              Xem lại lịch đã thống nhất với studio và thanh toán cọc 30% để giữ lịch chính thức.
            </p>
          </div>
        </div>

        <div role="group" aria-label="Lọc trạng thái lịch chụp" className="ps-tabs">
          {tabs.map(([tabKey, tabLabel, count]) => (
            <button
              key={tabKey}
              type="button"
              aria-pressed={activeTab === tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={activeTab === tabKey ? 'ps-tab is-active' : 'ps-tab'}
            >
              <span>{tabLabel}</span>
              <span className="ps-tab-count">({count})</span>
            </button>
          ))}
        </div>

        {!hasItemsForTab ? (
          <div className="ps-empty-card">
            <div className="ps-empty-icon" aria-hidden="true">
              ◷
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
                ? 'Sau khi buổi chụp diễn ra và studio bàn giao ảnh hoàn thiện, buổi chụp sẽ hiển thị tại đây.'
                : activeTab === 'confirmed'
                ? 'Hãy thanh toán cọc 30% cho booking #GS-1024 để giữ lịch chính thức.'
                : 'Bạn đã thanh toán cọc 30% cho buổi chụp ngày 24/10.'}
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
          <div className="ps-editorial-grid">
            <div className="ps-left-col">
              <section className="ps-package-card" aria-label="Gói chụp đã chọn">
                <img
                  src="./photos/tot-nghiep-900.webp"
                  srcSet="./photos/tot-nghiep-480.webp 480w, ./photos/tot-nghiep-900.webp 900w"
                  sizes="(min-width: 1280px) 720px, 100vw"
                  width="900"
                  height="1350"
                  alt="Nữ sinh mặc áo cử nhân ôm bó hoa trước bậc thềm sân trường"
                  className="ps-package-frame"
                />
                <div className="ps-package-caption">
                  <div>
                    <h2 className="ps-package-title">Tốt nghiệp cá nhân</h2>
                    <p className="ps-package-line">một mình hoặc cùng nhóm bạn thân</p>
                  </div>
                  <p className="ps-package-meta">
                    Gói Tốt nghiệp Premium · 2 giờ · 30 ảnh chỉnh
                  </p>
                </div>
              </section>

              <section className="ps-calendar-section" aria-label="Lịch trình ngày chụp">
                <div className="ps-month-head">
                  <div>
                    <h2 className="ps-month-title">Tháng 10, 2026</h2>
                    <p className="ps-month-sub">Lịch chụp tại studio · Thứ Bảy, 24/10</p>
                  </div>
                  <span className="ps-week-tag">Tuần 19/10 – 25/10</span>
                </div>

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
                        {isSelected ? (
                          <span className="ps-day-tag">
                            {isDepositPaid ? '✓ Đã đặt' : '◷ Chờ cọc'}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="ps-milestones-section">
                  <div className="ps-milestones-head">
                    <h3 className="ps-milestones-kicker">
                      Thứ Bảy, 24/10 · Lịch trình của Linh
                    </h3>
                    <span className="ps-milestones-count">3 mốc thời gian</span>
                  </div>

                  <div className="ps-milestones-list">
                    <div className="ps-milestone-row">
                      <s className="ps-milestone-time is-struck">09:00</s>
                      <div className="ps-milestone-body is-dashed">
                        <p className="ps-milestone-title is-muted">
                          ⚠ Giờ bạn yêu cầu ban đầu (09:00)
                        </p>
                        <p className="ps-milestone-sub">
                          Thợ makeup Mai đã kín lịch lúc này — bạn và studio đã thống nhất đổi sang 14:00.
                        </p>
                      </div>
                    </div>

                    <div className="ps-milestone-row">
                      <span
                        className={
                          isDepositPaid
                            ? 'ps-milestone-time is-paid'
                            : 'ps-milestone-time is-accent'
                        }
                      >
                        13:00
                      </span>
                      <div
                        className={
                          isDepositPaid
                            ? 'ps-milestone-body is-paid'
                            : 'ps-milestone-body is-accent'
                        }
                      >
                        <div className="ps-milestone-top">
                          <p className="ps-milestone-title">Makeup với Mai</p>
                          <span className="ps-milestone-range">13:00 – 14:00</span>
                        </div>
                        <p className="ps-milestone-sub">
                          60 phút trước giờ chụp · Đến sớm 10 phút để chọn trang phục
                        </p>
                      </div>
                    </div>

                    <div className="ps-milestone-row">
                      <span
                        className={
                          isDepositPaid
                            ? 'ps-milestone-time is-paid'
                            : 'ps-milestone-time is-accent'
                        }
                      >
                        14:00
                      </span>
                      <div
                        className={
                          isDepositPaid
                            ? 'ps-milestone-body is-paid'
                            : 'ps-milestone-body is-accent'
                        }
                      >
                        <div className="ps-milestone-top">
                          <p className="ps-milestone-title">Chụp ảnh tốt nghiệp tại Phòng B</p>
                          <span className="ps-milestone-range">14:00 – 16:00</span>
                        </div>
                        <p className="ps-milestone-sub">
                          Thợ chụp: Tuấn · Gói Tốt nghiệp Premium (2 giờ, 30 ảnh chỉnh)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="ps-folio" aria-label="Tóm tắt đặt lịch #GS-1024">
              <div className="ps-folio-head">
                <div>
                  <p className="ps-folio-kicker">Phiếu đặt lịch</p>
                  <h2 className="ps-folio-code">Booking #GS-1024</h2>
                </div>
                <div className="ps-folio-status">
                  {isDepositPaid ? (
                    <StatusBadge tone="confirmed">Đã đặt lịch</StatusBadge>
                  ) : (
                    <StatusBadge tone="pending">Đã thống nhất lịch · Chờ cọc 30%</StatusBadge>
                  )}
                </div>
              </div>

              <dl className="ps-folio-details">
                <div className="ps-folio-row">
                  <dt>Khách hàng</dt>
                  <dd>Nguyễn Thùy Linh</dd>
                </div>
                <div className="ps-folio-row">
                  <dt>Loại buổi chụp</dt>
                  <dd>Tốt nghiệp cá nhân</dd>
                </div>
                <div className="ps-folio-row">
                  <dt>Gói chụp</dt>
                  <dd>Gói Tốt nghiệp Premium · 2 giờ · 30 ảnh chỉnh</dd>
                </div>
                <div className="ps-folio-row">
                  <dt>Giờ chụp đã chốt</dt>
                  <dd>
                    <s>09:00</s> → 14:00 (Makeup 13:00), Thứ Bảy 24/10
                  </dd>
                </div>
                <div className="ps-folio-row">
                  <dt>Nhân sự & phòng</dt>
                  <dd>Makeup Mai · Thợ chụp Tuấn · Phòng B</dd>
                </div>
                <div className="ps-folio-row">
                  <dt>Tổng giá chốt</dt>
                  <dd>1.800.000đ</dd>
                </div>
                <div className="ps-folio-total-row">
                  <dt>Cọc giữ lịch (30%)</dt>
                  <dd className="ps-folio-deposit">540.000đ</dd>
                </div>
              </dl>

              <div className="ps-folio-action" aria-live="polite">
                {isDepositPaid ? (
                  <div role="status" className="ps-paid-box">
                    ✓ Đã nhận cọc 540.000đ — lịch chụp 14:00 ngày 24/10 của bạn đã được giữ chính thức.
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
                Lịch chỉ được giữ chính thức sau khi bạn thanh toán cọc 30%.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
