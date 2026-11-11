export function Avatar({ src, initials, alt = '', size = 40, className = '' }) {
  const style = { width: `${size}px`, height: `${size}px` };
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        style={style}
        className={`st-avatar st-avatar-img ${className}`}
      />
    );
  }
  return (
    <span style={style} className={`st-avatar st-avatar-initials ${className}`}>
      {initials}
    </span>
  );
}

const getStatusDot = (status) => {
  switch (status) {
    case 'unanswered':
      return { tone: 'dot-conflict', label: 'Chưa trả lời' };
    case 'confirmed':
    case 'agreed':
      return { tone: 'dot-success', label: 'Đã xác nhận' };
    case 'done':
      return { tone: 'dot-muted', label: 'Hoàn thành' };
    case 'pending':
      return { tone: 'dot-accent', label: 'Chờ thanh toán cọc' };
    case 'consulting':
    default:
      return { tone: 'dot-warn', label: 'Đang tư vấn' };
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
        <div className="st-search-box">
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            className="st-search-icon"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm khách hàng…"
            aria-label="Tìm khách hàng"
            className="st-search-input"
          />
        </div>

        <div className="st-filter-pills" role="group" aria-label="Lọc trạng thái hội thoại">
          {tabs.map(([tabKey, label, count]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => onFilterChange(tabKey)}
              className={filterTab === tabKey ? 'st-pill is-active' : 'st-pill'}
            >
              <span>{label}</span>
              <span className="st-pill-count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="st-customer-list">
        {customers.map((c) => {
          const isActive = c.id === activeId;
          const statusDot = getStatusDot(c.status);

          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className={isActive ? 'st-customer-row is-active' : 'st-customer-row'}
              >
                <span className="st-customer-bar" aria-hidden="true" />
                <div className="st-avatar-wrap">
                  <Avatar src={c.avatar} initials={c.initials} alt={c.name} size={40} />
                  <span
                    className={`st-status-dot ${statusDot.tone}`}
                    title={statusDot.label}
                    aria-label={statusDot.label}
                  />
                </div>
                <div className="st-customer-body">
                  <div className="st-customer-top">
                    <span className={c.unread ? 'st-customer-name is-unread' : 'st-customer-name'}>
                      {c.name}
                    </span>
                    <span className="st-customer-time">{c.time}</span>
                  </div>
                  <div className="st-customer-bottom">
                    <p className={c.unread ? 'st-customer-last is-unread' : 'st-customer-last'}>
                      {c.last}
                    </p>
                    {c.unread ? (
                      <span className="st-unread-dot" title="Chưa đọc" aria-label="Chưa đọc" />
                    ) : null}
                  </div>
                </div>
              </button>
            </li>
          );
        })}

        {customers.length === 0 ? (
          <li className="st-inbox-empty">Không tìm thấy khách hàng.</li>
        ) : null}
      </ul>
    </aside>
  );
}
