export default function ConflictAlert({ title, lines = [], className = '' }) {
  return (
    <div role="alert" className={`st-alert-box ${className}`.trim()}>
      <span className="st-alert-icon" aria-hidden="true">
        ⚠
      </span>
      <div className="st-alert-body">
        <p className="st-alert-title">{title}</p>
        {lines.map((line) => (
          <p key={line} className="st-alert-line">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
