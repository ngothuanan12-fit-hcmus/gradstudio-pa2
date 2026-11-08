// A status label is a span, never a clickable dot. Every tone keeps its text,
// its own border style and a visible symbol, so it survives greyscale.
const LABELS = {
  neutral: { glyph: '○', text: 'Chưa trả lời' },
  pending: { glyph: '◷', text: 'Đang tư vấn' },
  confirmed: { glyph: '✓', text: 'Đã chốt lịch' },
  conflict: { glyph: '⚠', text: 'Trùng lịch' },
};

export default function StatusBadge({ tone = 'neutral', children }) {
  const name = LABELS[tone] ? tone : 'neutral';
  const label = LABELS[name];
  return (
    <span className={`status-badge status-badge-${name}`}>
      <span className="status-badge-glyph" aria-hidden="true">{label.glyph}</span>
      <span>{children || label.text}</span>
    </span>
  );
}
