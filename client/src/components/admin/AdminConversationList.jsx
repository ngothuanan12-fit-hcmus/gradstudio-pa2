import { Link } from 'react-router';
import DataState from '../DataState.jsx';
import EmptyState from '../EmptyState.jsx';
import Icon from '../Icon.jsx';
import { formatConvListTime } from '../../utils/date.js';
import { formatMoment } from '../../utils/moment.js';
import { CONV_DOT_META } from '../../utils/status.js';

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Chưa trả lời', label: 'Chưa trả lời' },
  { id: 'Đang tư vấn', label: 'Đang tư vấn' },
  { id: 'Đã chốt lịch', label: 'Đã chốt lịch' },
  { id: 'Hoàn thành', label: 'Hoàn thành' },
];

// Left column of the Admin workspace: instant search, status filter pills, and router-linked rows.
export default function AdminConversationList({
  conversationsQuery,
  activeId,
  search,
  onSearchChange,
  statusFilter,
  onFilterChange,
  isPrimaryHeading = true,
}) {
  const HeadingTag = isPrimaryHeading ? 'h1' : 'h2';
  return (
    <section className="admin-card admin-convs" aria-labelledby="admin-convs-title">
      <div className="convs-head">
        <HeadingTag id="admin-convs-title" className="heading">
          Hội thoại
        </HeadingTag>
        <div className="conv-search-wrap">
          <label className="sr-only" htmlFor="conv-search">
            Tìm hội thoại
          </label>
          <span className="conv-search-icon" aria-hidden="true">
            <Icon name="search" />
          </span>
          <input
            id="conv-search"
            className="conv-search-input"
            type="search"
            value={search}
            placeholder="Tìm hội thoại"
            autoComplete="off"
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className="conv-filters" role="group" aria-label="Lọc theo trạng thái">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="conv-filter"
              aria-pressed={statusFilter === item.id}
              onClick={() => onFilterChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="convs-scroll">
        <DataState query={conversationsQuery} emptyText="Chưa có hội thoại nào." loadingLabel="Đang tải hội thoại…">
          {(list) => {
            const latestDate = list[0]?.updatedAt?.slice(0, 10) || null;
            const keyword = search.trim().toLowerCase();
            const visible = list.filter((c) => {
              const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
              const matchesSearch =
                !keyword ||
                c.customer.name.toLowerCase().includes(keyword) ||
                (c.lastMessage?.text || '').toLowerCase().includes(keyword);
              return matchesStatus && matchesSearch;
            });

            if (!visible.length) {
              return <EmptyState>Không có hội thoại khớp. Thử từ khóa khác hoặc bỏ bộ lọc.</EmptyState>;
            }

            return (
              <ul className="conv-list" aria-label="Danh sách hội thoại">
                {visible.map((c) => {
                  const isActive = c.id === activeId;
                  const dot = CONV_DOT_META[c.status] || CONV_DOT_META['Chưa trả lời'];
                  const unread = typeof c.unread === 'number' ? c.unread : c.status === 'Chưa trả lời' ? 1 : 0;
                  return (
                    <li key={c.id}>
                      <Link
                        className={`conv-item${isActive ? ' is-active' : ''}`}
                        to={`/quan-ly/hoi-thoai/${c.id}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="conv-avatar">
                          <span aria-hidden="true">{c.customer.name.charAt(0)}</span>
                          <span className={`conv-status-dot ${dot.cls}`}>
                            <Icon name={dot.icon} />
                            <span className="sr-only">{c.status}</span>
                          </span>
                        </span>
                        <span className="conv-body">
                          <span className="conv-line">
                            <span className="conv-name">{c.customer.name}</span>
                            <time className="conv-time" dateTime={c.updatedAt} title={formatMoment(c.updatedAt)}>
                              {formatConvListTime(c.updatedAt, latestDate)}
                            </time>
                          </span>
                          <span className="conv-line">
                            <span className="conv-last">{c.lastMessage?.text || ''}</span>
                            {unread > 0 ? (
                              <span className="conv-unread">
                                {unread}
                                <span className="sr-only"> chưa trả lời</span>
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            );
          }}
        </DataState>
      </div>
    </section>
  );
}
