import Icon from './Icon.jsx';

// A status label is a span, never a clickable dot. Every tone keeps its text,
// its own border style and a visible icon, so it survives greyscale.
const LABELS = {
  neutral: { icon: 'circle', text: 'Chưa trả lời' },
  new: { icon: 'circle', text: 'Chưa trả lời' },
  done: { icon: 'check', text: 'Hoàn thành' },
  pending: { icon: 'clock', text: 'Đang tư vấn' },
  confirmed: { icon: 'check', text: 'Đã chốt lịch' },
  conflict: { icon: 'alert', text: 'Trùng lịch' },
};

export default function StatusBadge({ tone = 'neutral', children }) {
  const name = LABELS[tone] ? tone : 'neutral';
  const label = LABELS[name];
  return (
    <span className={`status-badge status-badge-${name}`}>
      <span className="status-badge-glyph"><Icon name={label.icon} /></span>
      <span>{children || label.text}</span>
    </span>
  );
}
