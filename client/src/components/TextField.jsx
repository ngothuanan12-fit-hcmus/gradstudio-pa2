// One labelled input (or `as="textarea"` / `as="select"`, with the options as children) with its message. The visible <label> is tied to the input; the message sits right after the input
// and is named by aria-describedby, so a screen reader reads it with the field and Tab reaches the field it belongs to.
export default function TextField({ id, label, error, hint, as = 'input', children, ...input }) {
  const Tag = as;
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return (
    <p className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <Tag
        className="input"
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...input}
      >
        {children}
      </Tag>
      {hint ? (
        <span className="field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </p>
  );
}
