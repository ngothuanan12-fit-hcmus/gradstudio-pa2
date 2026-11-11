export function Avatar({ src, initials, alt = '', size = 40, className = '' }) {
  const sizeClass = size > 40 ? 'st-avatar st-avatar-lg' : 'st-avatar';
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`${sizeClass} st-avatar-img ${className}`.trim()}
      />
    );
  }
  return (
    <span className={`${sizeClass} st-avatar-initials ${className}`.trim()}>
      {initials}
    </span>
  );
}

const getStatusBadgeInfo = (status) => {
  switch (status) {
    case 'unanswered':
      return { tone: 'st-badge-neutral', glyph: '○', label: 'Chưa trả lời' };
    case 'confirmed':
    case 'agreed':
      return { tone: 'st-badge-success', glyph: '✓', label: 'Đã chốt lịch' };
    case 'done':
      return { tone: 'st-badge-neutral', glyph: '✓', label: 'Hoàn thành' };
    case 'pending':
      return { tone: 'st-badge-pending', glyph: '◷', label: 'Chờ cọc 30%' };
    case 'consulting':
    default:
      return { tone: 'st-badge-pending', glyph: '◷', label: 'Đang tư vấn' };
  }
};

export default function ConversationList({
  customers = [],
  activeId,
  onSelect,
  searchQuery = '',
  onSearchChange,
  filterTab = 'all',
  onFilterChange,
  counts = { all: 0, unanswered: 0, consulting: 0 },
}) {
  const tabs = [
    ['all', 'Tất cả', counts.all],
    ['unanswered', 'Chưa trả lời', counts.unanswered],
    ['consulting', 'Đang tư vấn', counts.consulting],
  ];

  return (
    <aside className="st-inbox" aria-label="Danh sách khách hàng">
      <div className="st-inbox-toolbar">
        <div className="st-search-field">
          <label htmlFor="customer-search" className="st-search-label">
            Tìm khách hàng
          </label>
          <div className="st-search-box">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="st-search-icon"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              id="customer-search"
              type="search"
              name="customer-search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Gõ tên khách hàng…"
              className="st-search-input"
            />
          </div>
        </div>

        <div className="st-filter-pills" role="group" aria-label="Lọc trạng thái hội thoại">
          {tabs.map(([tabKey, label, count]) => (
            <button
              key={tabKey}
              type="button"
              aria-pressed={filterTab === tabKey}
              onClick={() => onFilterChange(tabKey)}
              className={filterTab === tabKey ? 'st-pill is-active' : 'st-pill'}
            >
              <span>{label}</span>
              <span className="st-pill-count">({count})</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="st-customer-list">
        {customers.map((c) => {
          const isActive = c.id === activeId;
          const badge = getStatusBadgeInfo(c.status);

          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className={isActive ? 'st-customer-row is-active' : 'st-customer-row'}
              >
                <span className="st-customer-bar" aria-hidden="true" />
                <div className="st-avatar-wrap">
                  <Avatar src={c.avatar} initials={c.initials} alt={`Ảnh đại diện ${c.name}`} size={40} />
                </div>
                <div className="st-customer-body">
                  <div className="st-customer-top">
                    <span className="st-customer-name">{c.name}</span>
                    <span className="st-customer-time">{c.time}</span>
                  </div>
                  <p className={c.unread ? 'st-customer-last is-unread' : 'st-customer-last'}>
                    {c.last}
                  </p>
                  <div className="st-customer-bottom">
                    <span className={`st-badge ${badge.tone}`}>
                      <span className="st-badge-glyph" aria-hidden="true">
                        {badge.glyph}
                      </span>
                      <span>{badge.label}</span>
                    </span>
                    {c.unread ? (
                      <span className="st-unread-badge">Tin mới</span>
                    ) : null}
                  </div>
                </div>
              </button>
            </li>
          );
        })}

        {customers.length === 0 ? (
          <li className="st-inbox-empty">Không tìm thấy khách hàng phù hợp.</li>
        ) : null}
      </ul>
    </aside>
  );
}
