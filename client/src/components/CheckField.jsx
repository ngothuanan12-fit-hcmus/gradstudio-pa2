// A checkbox with its visible label beside it; the whole row is a 44 px tap target.
export default function CheckField({ id, label, ...input }) {
  return (
    <p className="check-field">
      <input id={id} type="checkbox" {...input} />
      <label htmlFor={id}>{label}</label>
    </p>
  );
}
