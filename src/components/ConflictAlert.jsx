export default function ConflictAlert({ title, lines = [], className = '' }) {
  return (
    <div role="alert" className={`st-alert-box ${className}`}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        className="st-alert-icon"
        aria-hidden="true"
      >
        <path
          d="M10 2.5 18 17H2L10 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 8v4M10 14.5v.01"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
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
